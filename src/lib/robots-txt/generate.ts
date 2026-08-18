export type PathKind = "allow" | "disallow";

export type PathRule = {
  id: string;
  kind: PathKind;
  path: string;
};

export type AgentGroup = {
  id: string;
  userAgent: string;
  crawlDelay: string;
  rules: PathRule[];
};

export type RobotsDraft = {
  groups: AgentGroup[];
  sitemaps: string[];
};

export type RobotsIssue = {
  level: "error" | "warning" | "info";
  message: string;
  groupId?: string;
};

export type RobotsResult = {
  text: string;
  issues: RobotsIssue[];
  status: "valid" | "warning" | "error";
};

export const USER_AGENT_SUGGESTIONS = ["*", "Googlebot", "Bingbot", "Googlebot-Image", "GPTBot", "CCBot", "Applebot"] as const;

function group(
  id: string,
  userAgent: string,
  rules: Array<[string, PathKind, string]>,
  crawlDelay = "",
): AgentGroup {
  return {
    id,
    userAgent,
    crawlDelay,
    rules: rules.map(([ruleId, kind, path]) => ({ id: ruleId, kind, path })),
  };
}

export const DEFAULT_DRAFT: RobotsDraft = {
  groups: [
    group("group-1", "*", [
      ["rule-1", "allow", "/"],
      ["rule-2", "disallow", "/admin"],
      ["rule-3", "disallow", "/private"],
      ["rule-4", "disallow", "/search"],
    ]),
  ],
  sitemaps: ["https://example.com/sitemap.xml"],
};

export const ROBOTS_PRESETS: Array<{ id: string; label: string; hint: string; draft: RobotsDraft }> = [
  {
    id: "seo",
    label: "SEO default",
    hint: "Allow the site, hide admin and search, include a sitemap",
    draft: DEFAULT_DRAFT,
  },
  {
    id: "allow-all",
    label: "Allow all",
    hint: "Every crawler may fetch the whole site",
    draft: {
      groups: [group("group-1", "*", [["rule-1", "allow", "/"]])],
      sitemaps: [""],
    },
  },
  {
    id: "block-all",
    label: "Block all",
    hint: "Ask every crawler to stay out",
    draft: {
      groups: [group("group-1", "*", [["rule-1", "disallow", "/"]])],
      sitemaps: [""],
    },
  },
  {
    id: "block-folders",
    label: "Block folders",
    hint: "Allow the site, disallow admin, private, and API paths",
    draft: {
      groups: [
        group("group-1", "*", [
          ["rule-1", "allow", "/"],
          ["rule-2", "disallow", "/admin"],
          ["rule-3", "disallow", "/private"],
          ["rule-4", "disallow", "/tmp"],
          ["rule-5", "disallow", "/api/"],
        ]),
      ],
      sitemaps: ["https://example.com/sitemap.xml"],
    },
  },
];

export function cloneDraft(draft: RobotsDraft = DEFAULT_DRAFT): RobotsDraft {
  return {
    groups: draft.groups.map((item) => ({
      ...item,
      rules: item.rules.map((rule) => ({ ...rule })),
    })),
    sitemaps: [...draft.sitemaps],
  };
}

export function newGroupId(existing: AgentGroup[]) {
  return `group-${existing.length + 1}-${Math.random().toString(36).slice(2, 7)}`;
}

export function newRuleId(existing: PathRule[]) {
  return `rule-${existing.length + 1}-${Math.random().toString(36).slice(2, 7)}`;
}

export function emptyGroup(id: string): AgentGroup {
  return {
    id,
    userAgent: "*",
    crawlDelay: "",
    rules: [{ id: `${id}-rule-1`, kind: "disallow", path: "" }],
  };
}

const SITEMAP_URL = /^https?:\/\/[^\s]+$/i;

export function isValidSitemapUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return SITEMAP_URL.test(trimmed);
  }
}

function statusFromIssues(issues: RobotsIssue[]): RobotsResult["status"] {
  if (issues.some((issue) => issue.level === "error")) return "error";
  if (issues.some((issue) => issue.level === "warning")) return "warning";
  return "valid";
}

export function generateRobotsTxt(draft: RobotsDraft): RobotsResult {
  const issues: RobotsIssue[] = [];
  const lines: string[] = [];

  if (!draft.groups.length) {
    issues.push({ level: "error", message: "Add at least one user-agent group." });
  }

  const seenAgents = new Map<string, string>();
  let crawlDelayNoted = false;

  draft.groups.forEach((groupItem, index) => {
    const agent = groupItem.userAgent.trim() || "*";
    if (!groupItem.userAgent.trim()) {
      issues.push({
        level: "error",
        message: `Group ${index + 1} needs a user-agent (use * for all crawlers).`,
        groupId: groupItem.id,
      });
    }
    if (/\s/.test(agent) && agent !== "*") {
      issues.push({
        level: "warning",
        message: `“${agent}” contains a space. User-agent tokens are usually a single name such as Googlebot.`,
        groupId: groupItem.id,
      });
    }

    const agentKey = agent.toLowerCase();
    const previous = seenAgents.get(agentKey);
    if (previous) {
      issues.push({
        level: "warning",
        message: `User-agent “${agent}” is used in more than one group. Crawlers merge matching groups.`,
        groupId: groupItem.id,
      });
    } else {
      seenAgents.set(agentKey, groupItem.id);
    }

    if (index > 0) lines.push("");
    lines.push(`User-agent: ${agent}`);

    const usedPaths = new Map<string, PathKind>();
    let emittedRule = false;

    for (const rule of groupItem.rules) {
      const path = rule.path.trim();
      if (!path) {
        issues.push({
          level: "warning",
          message: `An empty ${rule.kind} path in group ${index + 1} was skipped.`,
          groupId: groupItem.id,
        });
        continue;
      }
      if (/\s/.test(path)) {
        issues.push({
          level: "error",
          message: `Path “${path}” contains spaces. Use a URL path such as /admin.`,
          groupId: groupItem.id,
        });
        continue;
      }
      if (!path.startsWith("/") && path !== "*") {
        issues.push({
          level: "warning",
          message: `Path “${path}” should usually start with /.`,
          groupId: groupItem.id,
        });
      }

      const prior = usedPaths.get(path);
      if (prior && prior !== rule.kind) {
        issues.push({
          level: "warning",
          message: `“${path}” is both Allow and Disallow for ${agent}. Crawlers use the longest matching rule.`,
          groupId: groupItem.id,
        });
      }
      usedPaths.set(path, rule.kind);

      const directive = rule.kind === "allow" ? "Allow" : "Disallow";
      lines.push(`${directive}: ${path}`);
      emittedRule = true;
    }

    if (!emittedRule) {
      issues.push({
        level: "info",
        message: `Group ${index + 1} (${agent}) has no Allow or Disallow rules, so matching crawlers are unrestricted.`,
        groupId: groupItem.id,
      });
    }

    const delayRaw = groupItem.crawlDelay.trim();
    if (delayRaw) {
      const delay = Number(delayRaw);
      if (!Number.isFinite(delay) || delay < 0) {
        issues.push({
          level: "error",
          message: `Crawl-delay for ${agent} must be a number of seconds (0 or more).`,
          groupId: groupItem.id,
        });
      } else {
        lines.push(`Crawl-delay: ${Number.isInteger(delay) ? String(delay) : delay}`);
        if (!crawlDelayNoted) {
          crawlDelayNoted = true;
          issues.push({
            level: "info",
            message: "Crawl-delay is ignored by Google. Bing and some other crawlers still honor it.",
            groupId: groupItem.id,
          });
        }
      }
    }
  });

  const sitemapValues = draft.sitemaps.map((item) => item.trim()).filter(Boolean);
  if (sitemapValues.length) lines.push("");
  for (const sitemap of sitemapValues) {
    if (!isValidSitemapUrl(sitemap)) {
      issues.push({
        level: "error",
        message: `Sitemap “${sitemap}” must be an absolute http:// or https:// URL.`,
      });
      continue;
    }
    lines.push(`Sitemap: ${sitemap}`);
  }

  const text = lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return { text: text ? `${text}\n` : "", issues, status: statusFromIssues(issues) };
}

export const ROBOTS_FAQS = [
  {
    question: "What belongs in robots.txt?",
    answer:
      "User-agent groups with Allow and Disallow paths, optional Crawl-delay, and Sitemap URLs. This generator sticks to those widely supported directives and skips Host, Noindex, and other non-standard lines.",
  },
  {
    question: "Does Google honor Crawl-delay?",
    answer:
      "No. Google ignores Crawl-delay. Bing, Yandex, and some other crawlers still use it. The file stays valid if you include it.",
  },
  {
    question: "Can I use more than one user-agent?",
    answer:
      "Yes. Add a group per crawler (for example * and GPTBot). Matching groups are combined by the crawler. Sitemap lines apply to the whole file, not a single agent.",
  },
  {
    question: "Where should I put the file?",
    answer:
      "Serve it at https://your-domain/robots.txt on the site root. Paths are relative to the host, and Sitemap values must be full URLs.",
  },
  {
    question: "Is this processed on a server?",
    answer: "No. The file is generated in your browser. Nothing is uploaded to Utilvia.",
  },
] as const;
