import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

// Leaflet touches `window` at import time, so the whole app shell is loaded
// only in the browser.
const FortyGuardApp = lazy(() => import("@/components/FortyGuardApp"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FortyGuard City Intelligence — California Map" },
      {
        name: "description",
        content:
          "Explore California on an interactive map with search, coordinates and FortyGuard temperature intelligence layers.",
      },
      { property: "og:title", content: "FortyGuard City Intelligence — California Map" },
      {
        property: "og:description",
        content:
          "Interactive California map with place search, satellite imagery and FortyGuard thermal data layers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ClientOnly fallback={<MapLoading />}>
      <Suspense fallback={<MapLoading />}>
        <FortyGuardApp />
      </Suspense>
    </ClientOnly>
  );
}

function MapLoading() {
  return (
    <div className="flex h-dvh w-full items-center justify-center bg-muted">
      <p className="text-sm text-muted-foreground">Loading map…</p>
    </div>
  );
}
