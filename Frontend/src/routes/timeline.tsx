import { createFileRoute } from "@tanstack/react-router";
import { TimelinePage } from "@/components/CyberTrace";

export const Route = createFileRoute("/timeline")({
  head: () => ({ meta: [
    { title: "Case Timeline | ForensiX" },
    { name: "description", content: "Review key investigation events in chronological order." },
    { property: "og:title", content: "Case Timeline | ForensiX" },
    { property: "og:description", content: "Review key investigation events in chronological order." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: TimelinePage,
});
