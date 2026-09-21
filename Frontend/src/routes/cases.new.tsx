import { createFileRoute } from "@tanstack/react-router";
import { NewCasePage } from "@/components/CyberTrace";

export const Route = createFileRoute("/cases/new")({
  head: () => ({ meta: [
    { title: "Create New Case | ForensiX" },
    { name: "description", content: "Create and register a new cyber fraud investigation case." },
    { property: "og:title", content: "Create New Case | ForensiX" },
    { property: "og:description", content: "Create and register a new cyber fraud investigation case." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: NewCasePage,
});
