import type { MetadataRoute } from 'next'

// Required for static export
export const dynamic = 'force-static';

const basePath = process.env.NODE_ENV === 'production' ? '/homeworkout' : '';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Silverthorne Tone Builder',
    short_name: 'Tone Builder',
    description: 'Facility-based strength, cardio, and posture workout tracker for Silverthorne Recreation Center',
    start_url: `${basePath}/`,
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#ef4444',
    orientation: 'portrait',
    icons: [
      {
        src: `${basePath}/icons/icon-192.png`,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: `${basePath}/icons/icon-512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
