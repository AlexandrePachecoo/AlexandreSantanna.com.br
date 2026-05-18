'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function PasswordGate({ slug, onUnlock }) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/letters/${slug}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const json = await res.json()
      if (!res.ok || !json.letter) {
        setError(json.error || 'Senha incorreta.')
        return
      }
      onUnlock?.(json.letter)
    } catch {
      setError('Não consegui validar. Tente de novo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-rose-50 via-white to-rose-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm rounded-3xl border border-border/40 bg-card p-8 shadow-2xl"
      >
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Lock className="h-5 w-5" />
        </div>
        <h1 className="mt-6 text-center font-display text-2xl">Carta protegida</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Digite a senha para abrir essa carta.
        </p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <Input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            required
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Abrindo...' : 'Abrir carta'}
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
