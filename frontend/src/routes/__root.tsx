import { Outlet, createRootRoute } from "@tanstack/react-router";
// import { PostHogProvider } from "posthog-js/react";
// import posthog from "posthog-js";
import { init } from '@plausible-analytics/tracker'

import NativeTitleTooltip from "../components/native-title-tooltip";

init({
  domain: 'ou0.cc',
  endpoint: 'https://plausible.canine.tools/api/event',
  captureOnLocalhost: false,
  outboundLinks: true,
  hashBasedRouting: true,
});

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const posthogHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;
  const token = import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN;
  const posthogApiHost = import.meta.env.DEV ? "/ingest" : posthogHost;

  return (
    <div className="h-full">
      <NativeTitleTooltip />
      <Outlet />
    </div>
  );
}
