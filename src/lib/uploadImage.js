// Helper compartilhado entre CoverUploader e MomentsUploader.
// Comprime client-side, pede signed URL e faz PUT no Supabase Storage.

const MAX_BYTES = 8 * 1024 * 1024

export async function uploadImage(file, { maxDim = 1600, quality = 0.85 } = {}) {
  if (!file) throw new Error('Sem arquivo.')
  if (!file.type.startsWith('image/')) throw new Error('Selecione uma imagem.')
  if (file.size > MAX_BYTES) throw new Error('Imagem maior que 8MB.')

  const compressed = await compressImage(file, maxDim, quality)

  const sigRes = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mimeType: compressed.type, size: compressed.size }),
  })
  const sig = await sigRes.json()
  if (!sigRes.ok) throw new Error(sig.error || 'Falha ao gerar upload URL.')

  const up = await fetch(sig.signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': compressed.type },
    body: compressed,
  })
  if (!up.ok) throw new Error('Falha no upload.')

  return { publicUrl: sig.publicUrl }
}

async function compressImage(file, maxDim, quality) {
  if (typeof window === 'undefined') return file

  const dataUrl = await new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = reject
    r.readAsDataURL(file)
  })

  const img = await new Promise((resolve, reject) => {
    const i = new window.Image()
    i.onload = () => resolve(i)
    i.onerror = reject
    i.src = dataUrl
  })

  let { width, height } = img
  if (width > maxDim || height > maxDim) {
    if (width > height) {
      height = Math.round((height * maxDim) / width)
      width = maxDim
    } else {
      width = Math.round((width * maxDim) / height)
      height = maxDim
    }
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, width, height)

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', quality)
  )
  return new File([blob], 'image.jpg', { type: 'image/jpeg' })
}
