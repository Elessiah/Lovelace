"use client"
import { useState } from "react"

export default function Signup() {
  const [role, setRole] = useState("Utilisateur") 
  const [nom, setNom] = useState("")
  const [prenom, setPrenom] = useState("")
  const [email, setEmail] = useState("")
  const [mdp, setMdp] = useState("")
  const [pp, setPp] = useState<File | null>(null) 
  const [message, setMessage] = useState("") 
  const [error, setError] = useState(false) 

  const [confirmEmail, setConfirmEmail] = useState("")
  const [confirmMessage, setConfirmMessage] = useState("")
  const [confirmError, setConfirmError] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage("")
    setError(false)

    const formData = new FormData()
    formData.append("role", role)
    formData.append("nom", nom)
    formData.append("prenom", prenom)
    formData.append("email", email)
    formData.append("mdp", mdp)
    if (pp) formData.append("pp", pp)

    try {
      const res = await fetch("/api/signup", { method: "POST", body: formData })

      if (!res.ok) {
        // si la réponse n'est pas 2xx, lire le texte brut pour debug
        const text = await res.text()
        throw new Error(text)
      }

      const data = await res.json()
      setMessage(data.message)
      setError(!data.success)
    } catch (err: any) {
      console.error(err)
      setMessage(err.message || "Erreur serveur lors de l'inscription")
      setError(true)
    }
  }

  async function handleSendConfirmation(e: React.FormEvent) {
    e.preventDefault()
    setConfirmMessage("")
    setConfirmError(false)

    try {
      const res = await fetch("/api/resendmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: confirmEmail }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text)
      }

      const data = await res.json()
      setConfirmMessage(data.message)
      setConfirmError(!data.success)
    } catch (err: any) {
      console.error(err)
      setConfirmMessage(err.message || "Erreur serveur lors de l'envoi du mail")
      setConfirmError(true)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <h2>Inscription</h2>

        <label>
          S'inscrire en tant que :
          <select value={role} onChange={e => setRole(e.target.value)}>
            <option>Utilisateur</option>
            <option>Ambassadrice</option>
          </select>
        </label>
        <br />

        <input type="text" placeholder="Nom" value={nom} onChange={e => setNom(e.target.value)} />
        <br />
        <input type="text" placeholder="Prénom" value={prenom} onChange={e => setPrenom(e.target.value)} />
        <br />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <br />
        <input type="password" placeholder="Mot de passe" value={mdp} onChange={e => setMdp(e.target.value)} />
        <br />
        <span>Photo de profil </span>
        <input type="file" accept="image/*" onChange={e => setPp(e.target.files ? e.target.files[0] : null)} />
        <br />
        <button type="submit">S'inscrire</button>

        {message && (
          <p style={{ color: error ? "red" : "green", marginTop: "1rem" }}>{message}</p>
        )}
      </form>

      <form onSubmit={handleSendConfirmation} style={{ marginTop: "2rem" }}>
        <h3>Je n'ai pas reçu de mail de confirmation, renvoyer le mail</h3>
        <input
          type="email"
          placeholder="Email"
          value={confirmEmail}
          onChange={e => setConfirmEmail(e.target.value)}
          required
        />
        <button type="submit" style={{ marginLeft: "1rem" }}>Envoyer</button>

        {confirmMessage && (
          <p style={{ color: confirmError ? "red" : "green", marginTop: "1rem" }}>
            {confirmMessage}
          </p>
        )}
      </form>
    </>
  )
}
