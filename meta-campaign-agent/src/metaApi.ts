const GRAPH_API_VERSION = process.env.GRAPH_API_VERSION || "v21.0";
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || "";
const AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID || "";

function baseUrl(path: string) {
  return `https://graph.facebook.com/${GRAPH_API_VERSION}/${path}`;
}

function encodeValue(v: unknown): string {
  return typeof v === "string" ? v : JSON.stringify(v);
}

async function graphGet(path: string, params: Record<string, unknown> = {}) {
  const url = new URL(baseUrl(path));
  url.searchParams.set("access_token", ACCESS_TOKEN);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) url.searchParams.set(k, encodeValue(v));
  }
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok) throw new Error(`Graph API GET ${path} failed: ${JSON.stringify(json)}`);
  return json;
}

async function graphPost(path: string, body: Record<string, unknown> = {}) {
  const form = new URLSearchParams();
  form.set("access_token", ACCESS_TOKEN);
  for (const [k, v] of Object.entries(body)) {
    if (v !== undefined) form.set(k, encodeValue(v));
  }
  const res = await fetch(baseUrl(path), { method: "POST", body: form });
  const json = await res.json();
  if (!res.ok) throw new Error(`Graph API POST ${path} failed: ${JSON.stringify(json)}`);
  return json;
}

export function listCampaigns(opts: { status?: string } = {}) {
  return graphGet(`${AD_ACCOUNT_ID}/campaigns`, {
    fields: "id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time",
    effective_status: opts.status ? [opts.status] : undefined,
    limit: 100,
  });
}

export function getInsights(opts: {
  objectId: string;
  datePreset?: string;
  level?: "campaign" | "adset" | "ad";
}) {
  const { objectId, datePreset = "last_7d", level } = opts;
  return graphGet(`${objectId}/insights`, {
    fields:
      "campaign_name,adset_name,ad_name,spend,impressions,clicks,ctr,cpc,cpm,actions,cost_per_action_type,reach,frequency",
    date_preset: datePreset,
    level,
  });
}

export function listAdSets(campaignId: string) {
  return graphGet(`${campaignId}/adsets`, {
    fields: "id,name,status,daily_budget,lifetime_budget,targeting,optimization_goal,bid_amount",
  });
}

export function listAds(adsetId: string) {
  return graphGet(`${adsetId}/ads`, {
    fields: "id,name,status,creative",
  });
}

export function getAdCreative(creativeId: string) {
  return graphGet(creativeId, {
    fields: "id,name,title,body,image_url,object_story_spec,call_to_action_type",
  });
}

export function createCampaign(opts: {
  name: string;
  objective: string;
  status?: string;
  specialAdCategories?: string[];
}) {
  return graphPost(`${AD_ACCOUNT_ID}/campaigns`, {
    name: opts.name,
    objective: opts.objective,
    status: opts.status || "PAUSED",
    special_ad_categories: opts.specialAdCategories || [],
  });
}

export function createAdSet(opts: {
  campaignId: string;
  name: string;
  dailyBudget?: number;
  lifetimeBudget?: number;
  targeting: Record<string, unknown>;
  optimizationGoal: string;
  billingEvent?: string;
  bidAmount?: number;
  status?: string;
}) {
  return graphPost(`${AD_ACCOUNT_ID}/adsets`, {
    campaign_id: opts.campaignId,
    name: opts.name,
    daily_budget: opts.dailyBudget,
    lifetime_budget: opts.lifetimeBudget,
    targeting: opts.targeting,
    optimization_goal: opts.optimizationGoal,
    billing_event: opts.billingEvent || "IMPRESSIONS",
    bid_amount: opts.bidAmount,
    status: opts.status || "PAUSED",
  });
}

export function createAdCreative(opts: {
  name: string;
  pageId: string;
  link: string;
  message: string;
  imageHash?: string;
  headline?: string;
  description?: string;
  callToAction?: string;
}) {
  return graphPost(`${AD_ACCOUNT_ID}/adcreatives`, {
    name: opts.name,
    object_story_spec: {
      page_id: opts.pageId,
      link_data: {
        link: opts.link,
        message: opts.message,
        image_hash: opts.imageHash,
        name: opts.headline,
        description: opts.description,
        call_to_action: { type: opts.callToAction || "LEARN_MORE" },
      },
    },
  });
}

export function createAd(opts: {
  name: string;
  adsetId: string;
  creativeId: string;
  status?: string;
}) {
  return graphPost(`${AD_ACCOUNT_ID}/ads`, {
    name: opts.name,
    adset_id: opts.adsetId,
    creative: { creative_id: opts.creativeId },
    status: opts.status || "PAUSED",
  });
}

export function updateBudget(opts: {
  entityId: string;
  dailyBudget?: number;
  lifetimeBudget?: number;
}) {
  return graphPost(opts.entityId, {
    daily_budget: opts.dailyBudget,
    lifetime_budget: opts.lifetimeBudget,
  });
}

export function setStatus(opts: { entityId: string; status: "ACTIVE" | "PAUSED" }) {
  return graphPost(opts.entityId, { status: opts.status });
}
