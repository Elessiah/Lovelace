"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"

export default function ReinitPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [newPassword, setNewPassword] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    if (!token) setMessage("Token manquant ou invalide")
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    if (!newPassword) return setMessage("Veuillez entrer un nouveau mot de passe")
    
    setLoading(true)
    try {
      const res = await fetch("/api/reinit-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      })
      const data = await res.json()
      setMessage(data.message)
      if (data.success) setTimeout(() => router.push("/login"), 2000)
    } catch (err) {
      console.error(err)
      setMessage("Erreur serveur")
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null // empêche le pré-rendu côté serveur

  return (
    <div>
      <h2>Réinitialiser le mot de passe</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          required
        />
        <br />
        <button type="submit" disabled={loading}>
          {loading ? "Réinitialisation..." : "Réinitialiser"}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  )
}
