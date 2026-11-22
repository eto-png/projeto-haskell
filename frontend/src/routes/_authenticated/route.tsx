import { createFileRoute, Outlet } from "@tanstack/react-router";
// Legacy URLs only; DevVault's session gate belongs to the vault route.
export const Route = createFileRoute("/_authenticated")({ ssr: false, component: Outlet });
