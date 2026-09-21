import { createFileRoute } from "@tanstack/react-router";
import { EvidencePage } from "@/components/CyberTrace";

export const Route = createFileRoute("/evidence/")({
  head: () => ({ meta: [
    { title: "Evidence & Parsing | ForensiX" },
    { name: "description", content: "Review parsed evidence records and extracted investigation entities." },
    { property: "og:title", content: "Evidence & Parsing | ForensiX" },
    { property: "og:description", content: "Review parsed evidence records and extracted investigation entities." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: EvidencePage,
});
