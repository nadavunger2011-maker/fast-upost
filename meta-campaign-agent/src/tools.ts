import type Anthropic from "@anthropic-ai/sdk";
import * as meta from "./metaApi.js";

export const toolDefinitions: Anthropic.Tool[] = [
  {
    name: "list_campaigns",
    description: "List campaigns in the ad account, optionally filtered by effective status (ACTIVE, PAUSED, etc).",
    input_schema: {
      type: "object",
      properties: {
        status: { type: "string", description: "Effective status filter, e.g. ACTIVE or PAUSED" },
      },
    },
  },
  {
    name: "get_insights",
    description:
      "Get performance insights (spend, impressions, clicks, ctr, cpc, cpm, conversions) for a campaign, adset, or ad id, over a date preset (e.g. today, yesterday, last_7d, last_30d, last_90d).",
    input_schema: {
      type: "object",
      properties: {
        objectId: { type: "string", description: "Campaign, adset, or ad ID" },
        datePreset: { type: "string", description: "Date preset, default last_7d" },
        level: { type: "string", enum: ["campaign", "adset", "ad"], description: "Breakdown level" },
      },
      required: ["objectId"],
    },
  },
  {
    name: "list_adsets",
    description: "List ad sets under a campaign, including budgets, targeting, and optimization goal.",
    input_schema: {
      type: "object",
      properties: { campaignId: { type: "string" } },
      required: ["campaignId"],
    },
  },
  {
    name: "list_ads",
    description: "List ads under an ad set, including status and creative reference.",
    input_schema: {
      type: "object",
      properties: { adsetId: { type: "string" } },
      required: ["adsetId"],
    },
  },
  {
    name: "get_ad_creative",
    description: "Get the full creative details (copy, image, CTA) for a creative ID.",
    input_schema: {
      type: "object",
      properties: { creativeId: { type: "string" } },
      required: ["creativeId"],
    },
  },
  {
    name: "create_campaign",
    description: "Create a new campaign. Defaults to PAUSED status so it can be reviewed before going live.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        objective: {
          type: "string",
          description: "e.g. OUTCOME_SALES, OUTCOME_LEADS, OUTCOME_TRAFFIC, OUTCOME_ENGAGEMENT, OUTCOME_AWARENESS",
        },
        status: { type: "string", enum: ["ACTIVE", "PAUSED"] },
        specialAdCategories: { type: "array", items: { type: "string" } },
      },
      required: ["name", "objective"],
    },
  },
  {
    name: "create_adset",
    description: "Create a new ad set under a campaign, with budget, targeting, and optimization goal. Defaults to PAUSED.",
    input_schema: {
      type: "object",
      properties: {
        campaignId: { type: "string" },
        name: { type: "string" },
        dailyBudget: { type: "number", description: "Daily budget in account currency minor units (e.g. cents)" },
        lifetimeBudget: { type: "number" },
        targeting: { type: "object", description: "Meta targeting spec object" },
        optimizationGoal: { type: "string", description: "e.g. OFFSITE_CONVERSIONS, LINK_CLICKS, REACH" },
        billingEvent: { type: "string", description: "e.g. IMPRESSIONS" },
        bidAmount: { type: "number" },
        status: { type: "string", enum: ["ACTIVE", "PAUSED"] },
      },
      required: ["campaignId", "name", "targeting", "optimizationGoal"],
    },
  },
  {
    name: "create_ad_creative",
    description: "Create a new ad creative (link ad) with copy, image, and call to action.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        pageId: { type: "string", description: "Facebook Page ID running the ad" },
        link: { type: "string" },
        message: { type: "string", description: "Primary text/body copy" },
        imageHash: { type: "string", description: "Uploaded image hash from the ad account image library" },
        headline: { type: "string" },
        description: { type: "string" },
        callToAction: { type: "string", description: "e.g. LEARN_MORE, SHOP_NOW, SIGN_UP" },
      },
      required: ["name", "pageId", "link", "message"],
    },
  },
  {
    name: "create_ad",
    description: "Create a new ad under an ad set, attaching an existing creative. Defaults to PAUSED.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        adsetId: { type: "string" },
        creativeId: { type: "string" },
        status: { type: "string", enum: ["ACTIVE", "PAUSED"] },
      },
      required: ["name", "adsetId", "creativeId"],
    },
  },
  {
    name: "update_budget",
    description: "Update the daily or lifetime budget of a campaign or ad set.",
    input_schema: {
      type: "object",
      properties: {
        entityId: { type: "string", description: "Campaign or ad set ID" },
        dailyBudget: { type: "number" },
        lifetimeBudget: { type: "number" },
      },
      required: ["entityId"],
    },
  },
  {
    name: "set_status",
    description: "Pause or activate a campaign, ad set, or ad.",
    input_schema: {
      type: "object",
      properties: {
        entityId: { type: "string" },
        status: { type: "string", enum: ["ACTIVE", "PAUSED"] },
      },
      required: ["entityId", "status"],
    },
  },
];

export async function callTool(name: string, input: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case "list_campaigns":
      return meta.listCampaigns(input as never);
    case "get_insights":
      return meta.getInsights(input as never);
    case "list_adsets":
      return meta.listAdSets(input.campaignId as string);
    case "list_ads":
      return meta.listAds(input.adsetId as string);
    case "get_ad_creative":
      return meta.getAdCreative(input.creativeId as string);
    case "create_campaign":
      return meta.createCampaign(input as never);
    case "create_adset":
      return meta.createAdSet(input as never);
    case "create_ad_creative":
      return meta.createAdCreative(input as never);
    case "create_ad":
      return meta.createAd(input as never);
    case "update_budget":
      return meta.updateBudget(input as never);
    case "set_status":
      return meta.setStatus(input as never);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
