import type { NextConfig } from "next";
import { dirname } from "path";
import { fileURLToPath } from "url";

const isProd = process.env.NODE_ENV === 'production';
const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  // Enable static export for GitHub Pages
  output: 'export',
  
  // Set base path for GitHub Pages (repo name)
  basePath: isProd ? '/homeworkout' : '',
  
  // Disable image optimization (not supported in static export)
  images: {
    unoptimized: true,
  },

  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
