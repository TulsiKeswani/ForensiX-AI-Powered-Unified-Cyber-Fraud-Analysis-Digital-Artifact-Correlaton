import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/evidence")({
  component: EvidenceLayout,
});

function EvidenceLayout() {
  return <Outlet />;
}
