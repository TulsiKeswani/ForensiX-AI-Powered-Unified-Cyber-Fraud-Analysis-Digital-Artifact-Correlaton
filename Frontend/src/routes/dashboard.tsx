import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/components/CyberTrace";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [
    { title: "Investigation Dashboard | ForensiX" },
    { name: "description", content: "Review evidence, entities, linked clusters, and risk across active cases." },
    { property: "og:title", content: "Investigation Dashboard | ForensiX" },
    { property: "og:description", content: "Review evidence, entities, linked clusters, and risk across active cases." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: DashboardPage,
});
