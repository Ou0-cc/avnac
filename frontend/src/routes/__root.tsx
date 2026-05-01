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
  hashBasedRouting: false,
});

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className="h-full">
      <NativeTitleTooltip />
      <Outlet />
    </div>
  );
}
