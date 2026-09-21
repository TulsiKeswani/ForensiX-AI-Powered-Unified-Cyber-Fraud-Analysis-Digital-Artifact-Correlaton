import { createFileRoute } from "@tanstack/react-router";
import { NetworkPage } from "@/components/CyberTrace";

export const Route = createFileRoute("/network")({
  head: () => ({ meta: [
    { title: "Entity Network | ForensiX" },
    { name: "description", content: "Visualize linked entities and relationships in a cyber fraud case." },
    { property: "og:title", content: "Entity Network | ForensiX" },
    { property: "og:description", content: "Visualize linked entities and relationships in a cyber fraud case." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: NetworkPage,
});
