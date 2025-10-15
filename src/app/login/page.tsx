"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [resetEmail, setResetEmail] = useState("") // pour reset
  const [resetMessage, setResetMessage] = useState("")
  const [showReset, setShowReset] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    setMessage(data.message)
    if (data.success && data.redirect) router.push(data.redirect)
  }

  // Fonction pour envoyer le mail de réinitialisation
  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setResetMessage("")

    try {
      const res = await fetch("/api/reinit-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      })
      const data = await res.json()
      setResetMessage(data.message)
    } catch (err) {
      console.error(err)
      setResetMessage("Erreur serveur lors de l'envoi du mail")
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Entre ton email"
        />
        <br />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Mot de passe"
        />
        <br />
        <button type="submit">Connexion</button>
        {message && <p>{message}</p>}
      </form>

      <hr style={{ margin: "2rem 0" }} />

      {!showReset ? (
        <button onClick={() => setShowReset(true)}>Mot de passe oublié ?</button>
      ) : (
        <form onSubmit={handleResetPassword}>
          <input
            type="email"
            value={resetEmail}
            onChange={e => setResetEmail(e.target.value)}
            placeholder="Entre ton email"
            required
          />
          <button type="submit">Réinitialiser le mot de passe</button>
          {resetMessage && <p>{resetMessage}</p>}
        </form>
      )}
    </>
  )
}
