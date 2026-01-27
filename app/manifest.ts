import type { MetadataRoute } from 'next'

// Required for static export
export const dynamic = 'force-static';

const basePath = process.env.NODE_ENV === 'production' ? '/homeworkout' : '';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Iron Flow - Workout Tracker',
    short_name: 'Iron Flow',
    description: 'CrossFit-style workout tracker with timers, exercise library, and progress tracking',
    start_url: `${basePath}/`,
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#ef4444',
    orientation: 'portrait',
    icons: [
      {
        src: `${basePath}/icons/icon-192.svg`,
        sizes: '192x192',
        type: 'image/svg+xml',
        purpose: 'maskable',
      },
      {
        src: `${basePath}/icons/icon-512.svg`,
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
  }
}
