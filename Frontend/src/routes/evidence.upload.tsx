import { createFileRoute } from "@tanstack/react-router";
import { UploadPage } from "@/components/CyberTrace";

export const Route = createFileRoute("/evidence/upload")({
  head: () => ({ meta: [
    { title: "Upload Evidence | ForensiX" },
    { name: "description", content: "Upload digital evidence and artifacts for a ForensiX case." },
    { property: "og:title", content: "Upload Evidence | ForensiX" },
    { property: "og:description", content: "Upload digital evidence and artifacts for a ForensiX case." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: UploadPage,
});
