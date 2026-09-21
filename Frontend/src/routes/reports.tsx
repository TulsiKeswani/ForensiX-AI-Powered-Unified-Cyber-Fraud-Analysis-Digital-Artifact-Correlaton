import { createFileRoute } from "@tanstack/react-router";
import { ReportsPage } from "@/components/CyberTrace";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [
    { title: "Investigative Brief | ForensiX" },
    { name: "description", content: "Review a concise field-ready summary of the investigation." },
    { property: "og:title", content: "Investigative Brief | ForensiX" },
    { property: "og:description", content: "Review a concise field-ready summary of the investigation." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: ReportsPage,
});
