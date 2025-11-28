import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Explicitly set the project root to avoid Next.js picking a higher-level lockfile
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
