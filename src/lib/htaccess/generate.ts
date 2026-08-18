export type WwwMode = "none" | "force-www" | "remove-www";

export type HtaccessConfig = {
  httpsRedirect: boolean;
  wwwMode: WwwMode;
  error404: string;
  error403: string;
  error500: string;
  browserCaching: boolean;
  gzip: boolean;
  blockIps: string;
  disableDirectoryListing: boolean;
  protectFiles: string;
};

export type HtaccessIssue = {
  level: "error" | "warning" | "info";
  message: string;
};

export type HtaccessResult = {
  text: string;
  issues: HtaccessIssue[];
  status: "valid" | "warning" | "error";
};

export const WWW_MODES: Array<{ id: WwwMode; label: string; hint: string }> = [
  { id: "none", label: "No change", hint: "Leave www and non-www URLs as they are." },
  { id: "force-www", label: "Force www", hint: "301 redirect example.com to www.example.com." },
  { id: "remove-www", label: "Remove www", hint: "301 redirect www.example.com to example.com." },
];

export const DEFAULT_HTACCESS: HtaccessConfig = {
  httpsRedirect: true,
  wwwMode: "none",
  error404: "",
  error403: "",
  error500: "",
  browserCaching: false,
  gzip: false,
  blockIps: "",
  disableDirectoryListing: true,
  protectFiles: ".env\nconfig.php",
};

export function cloneHtaccess(config: HtaccessConfig = DEFAULT_HTACCESS): HtaccessConfig {
  return { ...config };
}

function splitLines(value: string) {
  return value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
}

function escapeFilePattern(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function isValidDenyTarget(value: string) {
  if (/^(\d{1,3}\.){1,3}\d{1,3}(\/\d{1,2})?$/.test(value)) {
    const [ip, cidr] = value.split("/");
    const octets = ip.split(".").map(Number);
    if (octets.some((octet) => octet > 255)) return false;
    if (cidr !== undefined) {
      const prefix = Number(cidr);
      if (!Number.isInteger(prefix) || prefix < 0 || prefix > 32) return false;
    }
    return true;
  }
  if (value.includes(":")) {
    return /^[0-9a-f:]+(\/\d{1,3})?$/i.test(value);
  }
  return /^[a-z0-9][a-z0-9.-]*[a-z0-9]$/i.test(value) || /^[a-z0-9]$/i.test(value);
}

function isValidErrorPath(value: string) {
  return value.startsWith("/") || /^https?:\/\//i.test(value);
}

function statusFromIssues(issues: HtaccessIssue[]): HtaccessResult["status"] {
  if (issues.some((issue) => issue.level === "error")) return "error";
  if (issues.some((issue) => issue.level === "warning")) return "warning";
  return "valid";
}

export function generateHtaccess(config: HtaccessConfig): HtaccessResult {
  const sections: string[] = [];
  const issues: HtaccessIssue[] = [];

  if (config.httpsRedirect || config.wwwMode !== "none") {
    const rewrite = ["# URL Rewrites", "RewriteEngine On"];
    if (config.httpsRedirect) {
      rewrite.push(
        "",
        "# Redirect HTTP to HTTPS",
        "RewriteCond %{HTTPS} off",
        "RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]",
      );
    }
    if (config.wwwMode === "force-www") {
      rewrite.push(
        "",
        "# Force www",
        "RewriteCond %{HTTP_HOST} !^www\\. [NC]",
        "RewriteRule ^(.*)$ https://www.%{HTTP_HOST}%{REQUEST_URI} [L,R=301]",
      );
    } else if (config.wwwMode === "remove-www") {
      rewrite.push(
        "",
        "# Remove www",
        "RewriteCond %{HTTP_HOST} ^www\\.(.+)$ [NC]",
        "RewriteRule ^(.*)$ https://%1%{REQUEST_URI} [L,R=301]",
      );
    }
    sections.push(rewrite.join("\n"));
  }

  const errorLines: string[] = [];
  const errors: Array<[code: string, path: string]> = [
    ["404", config.error404],
    ["403", config.error403],
    ["500", config.error500],
  ];
  for (const [code, raw] of errors) {
    const path = raw.trim();
    if (!path) continue;
    if (!isValidErrorPath(path)) {
      issues.push({
        level: "warning",
        message: `ErrorDocument ${code} should be a site path like /${code}.html or a full http(s) URL.`,
      });
    }
    errorLines.push(`ErrorDocument ${code} ${path}`);
  }
  if (errorLines.length) {
    sections.push(["# Custom error pages", ...errorLines].join("\n"));
  }

  if (config.browserCaching) {
    sections.push(
      [
        "# Browser caching",
        "<IfModule mod_expires.c>",
        "  ExpiresActive On",
        '  ExpiresByType image/jpeg "access plus 1 year"',
        '  ExpiresByType image/png "access plus 1 year"',
        '  ExpiresByType image/webp "access plus 1 year"',
        '  ExpiresByType text/css "access plus 1 month"',
        '  ExpiresByType application/javascript "access plus 1 month"',
        "</IfModule>",
      ].join("\n"),
    );
  }

  if (config.gzip) {
    sections.push(
      [
        "# GZIP compression",
        "<IfModule mod_deflate.c>",
        "  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json text/plain",
        "</IfModule>",
      ].join("\n"),
    );
  }

  const ips = splitLines(config.blockIps);
  if (ips.length) {
    const denyLines = ["# Block specific IPs", "Order Deny,Allow"];
    for (const ip of ips) {
      if (!isValidDenyTarget(ip)) {
        issues.push({
          level: "warning",
          message: `“${ip}” does not look like an IP, CIDR range, or hostname.`,
        });
      }
      denyLines.push(`Deny from ${ip}`);
    }
    sections.push(denyLines.join("\n"));
  }

  if (config.disableDirectoryListing) {
    sections.push("# Disable directory browsing\nOptions -Indexes");
  }

  const files = splitLines(config.protectFiles);
  if (files.length) {
    const pattern = files.map(escapeFilePattern).join("|");
    sections.push(
      [
        "# Protect sensitive files",
        `<FilesMatch "(${pattern})$">`,
        "  Order Allow,Deny",
        "  Deny from all",
        "</FilesMatch>",
      ].join("\n"),
    );
  }

  if (!sections.length) {
    issues.push({
      level: "info",
      message: "Turn on a rule or add an error page, IP, or file pattern to generate .htaccess.",
    });
  } else {
    issues.push({
      level: "info",
      message: ".htaccess only works on Apache. Nginx uses server-block configuration instead.",
    });
  }

  const text = sections.length ? `${sections.join("\n\n")}\n` : "";
  return { text, issues, status: statusFromIssues(issues) };
}

export const HTACCESS_FAQS = [
  {
    question: "What is an .htaccess file?",
    answer:
      "It is a directory-level Apache config file. You can use it for HTTPS redirects, www canonicalization, custom error pages, browser caching, GZIP, IP blocks, and protecting files like .env — without editing the main server config.",
  },
  {
    question: "Does .htaccess work on Nginx?",
    answer:
      "No. Apache reads .htaccess; Nginx ignores it. On Nginx you would put the same ideas in a server block. This generator is for Apache only.",
  },
  {
    question: "How do I redirect HTTP to HTTPS using .htaccess?",
    answer:
      "Turn on Redirect HTTP to HTTPS. The file enables RewriteEngine and 301-redirects any request where HTTPS is off to the same host and path over https://.",
  },
  {
    question: "Will incorrect .htaccess rules break my site?",
    answer:
      "Yes, a bad rule can cause a 500 error or a redirect loop. Keep a backup, upload the file to your document root, and test HTTPS, www, and a few pages. If the site fails, rename or remove .htaccess to recover.",
  },
  {
    question: "Is this generator free?",
    answer: "Yes. It runs in your browser with no signup. Rules stay on your device.",
  },
] as const;
