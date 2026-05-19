import type { NextConfig } from "next";
import path from "path";
import { assertPublicMcpEnv } from "@workspace/common/env/public-mcp";

assertPublicMcpEnv();

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/common", "@workspace/routes"],
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
  devIndicators: {
    position: "bottom-right",
  },
};

export default nextConfig;
