import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/components/CyberTrace";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "ForensiX | Secure Investigation Login" },
    { name: "description", content: "Sign in to the ForensiX cyber fraud investigation workspace." },
    { property: "og:title", content: "ForensiX | Secure Investigation Login" },
    { property: "og:description", content: "Sign in to the ForensiX cyber fraud investigation workspace." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: LoginPage,
});
