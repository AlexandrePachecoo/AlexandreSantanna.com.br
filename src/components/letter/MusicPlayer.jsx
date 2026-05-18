'use client'

import { Music } from 'lucide-react'

// Suporta links comuns: Spotify (embed), YouTube (embed), ou qualquer URL como link externo.
function spotifyEmbed(url) {
  const m = url.match(/spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/)
  if (!m) return null
  return `https://open.spotify.com/embed/${m[1]}/${m[2]}`
}

function youtubeEmbed(url) {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]+)/
  )
  if (!m) return null
  return `https://www.youtube.com/embed/${m[1]}`
}

export function MusicPlayer({ url }) {
  if (!url) return null

  const spotify = spotifyEmbed(url)
  if (spotify) {
    return (
      <iframe
        src={spotify}
        className="h-20 w-full rounded-xl"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title="Música"
      />
    )
  }

  const yt = youtubeEmbed(url)
  if (yt) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl">
        <iframe
          src={yt}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          loading="lazy"
          title="Música"
        />
      </div>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium underline-offset-4 hover:underline"
      style={{ color: 'var(--letter-accent)' }}
    >
      <Music className="h-4 w-4" />
      Ouvir música
    </a>
  )
}
