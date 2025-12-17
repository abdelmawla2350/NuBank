import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const sentryWebpackPluginOptions = {
  org: "malak-im",
  project: "javascript-nextjs",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
};

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
};

export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
