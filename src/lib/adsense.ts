const PLACEHOLDER_PREFIX = "YOUR_";

function slot(value: string | undefined) {
  const next = value?.trim() ?? "";
  if (!next || next.startsWith(PLACEHOLDER_PREFIX)) return "";
  return next;
}

export const ADSENSE_PUBLISHER_ID =
  process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID?.trim() || "ca-pub-6348532092856318";

export const ADSENSE = {
  publisherId: ADSENSE_PUBLISHER_ID,
  scriptSrc: `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`,
  slots: {
    homepageBelowHero: slot(process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_BELOW_HERO),
    homepageBeforeCategories: slot(process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_BEFORE_CATEGORIES),
    toolBelowIntro: slot(process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOOL_BELOW_INTRO),
    toolBelowWorkspace: slot(process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOOL_BELOW_WORKSPACE),
    toolBottom: slot(process.env.NEXT_PUBLIC_ADSENSE_SLOT_TOOL_BOTTOM),
    categoryMid: slot(process.env.NEXT_PUBLIC_ADSENSE_SLOT_CATEGORY_MID),
  },
} as const;

export type AdSenseSlot = keyof typeof ADSENSE.slots;

export function hasAdSlot(name: AdSenseSlot) {
  return Boolean(ADSENSE.slots[name]);
}
