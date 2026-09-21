import { createFileRoute } from "@tanstack/react-router";
import { RiskPage } from "@/components/CyberTrace";

export const Route = createFileRoute("/risk-analysis")({
  head: () => ({ meta: [
    { title: "Risk Analysis | ForensiX" },
    { name: "description", content: "Review entities flagged by ForensiX for suspicious activity." },
    { property: "og:title", content: "Risk Analysis | ForensiX" },
    { property: "og:description", content: "Review entities flagged by ForensiX for suspicious activity." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: RiskPage,
});
