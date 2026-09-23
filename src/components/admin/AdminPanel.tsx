"use client";
import dynamic from "next/dynamic";
import OverviewStats from "./OverviewStats";

const CampaignManager = dynamic(() => import("./CampaignManager"));
const PromptManager = dynamic(() => import("./PromptManager"));
const ReviewQueue = dynamic(() => import("./ReviewQueue"));
const TeamManager = dynamic(() => import("./TeamManager"));
const DatasetPanel = dynamic(() => import("./DatasetPanel"));
const Contributions = dynamic(() => import("./Contributions"));
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
