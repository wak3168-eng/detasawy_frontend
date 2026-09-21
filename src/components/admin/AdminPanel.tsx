"use client";
import CampaignManager from "./CampaignManager";
import OverviewStats from "./OverviewStats";
import PromptManager from "./PromptManager";
import ReviewQueue from "./ReviewQueue";
import TeamManager from "./TeamManager";
import DatasetPanel from "./DatasetPanel";
import Contributions from "./Contributions";
export default function AdminPanel({ section = "" }: { section?: string }) {
  switch (section) {
    case "prompts":
      return <PromptManager />;
    case "contributions":
      return <Contributions />;
    case "dataset":
      return <DatasetPanel />;
    case "campaigns":
      return <CampaignManager />;
    case "team":
      return <TeamManager />;
    case "review":
      return <ReviewQueue />;
    default:
      return <OverviewStats />;
  }
}
