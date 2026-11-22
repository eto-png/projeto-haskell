import { createFileRoute, redirect } from "@tanstack/react-router";
export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Workspace — DevVault" },
      { name: "description", content: "Workspace do DevVault, seu cofre de código." },
      { property: "og:title", content: "Workspace — DevVault" },
      { property: "og:description", content: "Workspace do seu cofre de snippets." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/", statusCode: 301 });
  },
});
