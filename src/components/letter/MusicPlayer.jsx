'use client'

function youtubeEmbed(url) {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]+)/
  )
  if (!m) return null
  return `https://www.youtube.com/embed/${m[1]}?autoplay=1`
}

export function MusicPlayer({ url }) {
  if (!url) return null

  const yt = youtubeEmbed(url)
  if (!yt) return null

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
