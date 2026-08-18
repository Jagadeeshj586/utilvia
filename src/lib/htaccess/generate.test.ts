import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_HTACCESS,
  cloneHtaccess,
  generateHtaccess,
  isValidDenyTarget,
} from "./generate";

const DEFAULT_OUTPUT = `# URL Rewrites
RewriteEngine On

# Redirect HTTP to HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Disable directory browsing
Options -Indexes

# Protect sensitive files
<FilesMatch "(\\.env|config\\.php)$">
  Order Allow,Deny
  Deny from all
</FilesMatch>
`;

describe("cloneHtaccess", () => {
  it("isolates copies from the default config", () => {
    const copy = cloneHtaccess();
    copy.httpsRedirect = false;
    assert.equal(DEFAULT_HTACCESS.httpsRedirect, true);
  });
});

describe("generateHtaccess", () => {
  it("matches the default Apache snippet", () => {
    const result = generateHtaccess(DEFAULT_HTACCESS);
    assert.equal(result.text, DEFAULT_OUTPUT);
    assert.equal(result.status, "valid");
  });

  it("adds force-www and remove-www rewrite blocks", () => {
    const force = generateHtaccess({ ...DEFAULT_HTACCESS, wwwMode: "force-www" });
    assert.match(force.text, /# Force www/);
    assert.match(force.text, /RewriteCond %\{HTTP_HOST\} !\^www\\\. \[NC\]/);
    assert.match(force.text, /https:\/\/www\.%\{HTTP_HOST\}%\{REQUEST_URI\}/);

    const remove = generateHtaccess({ ...DEFAULT_HTACCESS, wwwMode: "remove-www" });
    assert.match(remove.text, /# Remove www/);
    assert.match(remove.text, /RewriteCond %\{HTTP_HOST\} \^www\\\.\(\.\+\)\$ \[NC\]/);
    assert.match(remove.text, /https:\/\/%1%\{REQUEST_URI\}/);
  });

  it("emits error pages, caching, gzip, and IP blocks", () => {
    const result = generateHtaccess({
      ...DEFAULT_HTACCESS,
      error404: "/404.html",
      error403: "/403.html",
      error500: "/500.html",
      browserCaching: true,
      gzip: true,
      blockIps: "192.0.2.1\n2001:db8::1",
    });
    assert.match(result.text, /ErrorDocument 404 \/404\.html/);
    assert.match(result.text, /ErrorDocument 403 \/403\.html/);
    assert.match(result.text, /ErrorDocument 500 \/500\.html/);
    assert.match(result.text, /<IfModule mod_expires\.c>/);
    assert.match(result.text, /ExpiresByType image\/webp "access plus 1 year"/);
    assert.match(result.text, /<IfModule mod_deflate\.c>/);
    assert.match(result.text, /Deny from 192\.0\.2\.1/);
    assert.match(result.text, /Deny from 2001:db8::1/);
  });

  it("warns on odd error paths and IPs but still emits them", () => {
    const result = generateHtaccess({
      ...DEFAULT_HTACCESS,
      httpsRedirect: false,
      disableDirectoryListing: false,
      protectFiles: "",
      error404: "404.html",
      blockIps: "not an ip",
    });
    assert.equal(result.status, "warning");
    assert.match(result.text, /ErrorDocument 404 404\.html/);
    assert.match(result.text, /Deny from not an ip/);
    assert.ok(result.issues.some((issue) => /ErrorDocument 404/.test(issue.message)));
    assert.ok(result.issues.some((issue) => /not an ip/.test(issue.message)));
  });

  it("returns empty output when every rule is off", () => {
    const result = generateHtaccess({
      ...DEFAULT_HTACCESS,
      httpsRedirect: false,
      wwwMode: "none",
      disableDirectoryListing: false,
      protectFiles: "",
    });
    assert.equal(result.text, "");
    assert.ok(result.issues.some((issue) => issue.level === "info"));
  });

  it("omits RewriteEngine when HTTPS and www are unused", () => {
    const result = generateHtaccess({
      ...DEFAULT_HTACCESS,
      httpsRedirect: false,
      wwwMode: "none",
    });
    assert.doesNotMatch(result.text, /RewriteEngine/);
    assert.match(result.text, /Options -Indexes/);
  });
});

describe("isValidDenyTarget", () => {
  it("accepts IPv4, CIDR, IPv6, and hostnames", () => {
    assert.equal(isValidDenyTarget("192.0.2.1"), true);
    assert.equal(isValidDenyTarget("192.0.2.0/24"), true);
    assert.equal(isValidDenyTarget("2001:db8::1"), true);
    assert.equal(isValidDenyTarget("bad.example"), true);
    assert.equal(isValidDenyTarget("999.1.1.1"), false);
    assert.equal(isValidDenyTarget("not an ip"), false);
  });
});
