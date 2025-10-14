// get const to hash mdp on route
// send confirmation mail to confirm signup
// if status amba = send pending request to admin PAR MAIL avec les infos de l'inscription
// send pp img to folder like IMG_DATA with name like pp_[id] then put the link of img in the DB then when GET link db it will show img (it will be on another page user/dashboard #for chatgpt: don't do the page user only this one)
// inscription en tant que : Utilisatrice, Ambassadrice
// Mail
// Nom
// Prénom
// mdp
// pop up pour demander confirmation par mail
// une fois mail confirmé: OK si user
// puis si signup as user > redirection pages listes ambassadrices
// si signup amba > demande acceptation to admin > pop up pour leur dire en attente accept admin
// si accepter par admin mail confirmation acceptation sur leur boite mail

"use client"
import { useState } from "react"

export default function Signup() {
  const [status, setStatus] = useState("Utilisateur")  // choix rôle
  const [nom, setNom] = useState("")
  const [prenom, setPrenom] = useState("")
  const [email, setEmail] = useState("")
  const [mdp, setMdp] = useState("")
  const [pp, setPp] = useState<File | null>(null) // photo de profil

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const formData = new FormData()
    formData.append("status", status)
    formData.append("nom", nom)
    formData.append("prenom", prenom)
    formData.append("email", email)
    formData.append("mdp", mdp)
    if (pp) formData.append("pp", pp)

    await fetch("/api/signup", {
      method: "POST",
      body: formData,
    })
  }

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <h2>Inscription</h2>

      <label>
        S'inscrire en tant que :
        <select value={status} onChange={e => setStatus(e.target.value)}>
          <option>Utilisateur</option>
          <option>Ambassadrice</option>
        </select>
      </label>

      <input type="text" placeholder="Nom" value={nom} onChange={e => setNom(e.target.value)} />
      <input type="text" placeholder="Prénom" value={prenom} onChange={e => setPrenom(e.target.value)} />
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Mot de passe" value={mdp} onChange={e => setMdp(e.target.value)} />
      <input type="file" accept="image/*" onChange={e => setPp(e.target.files ? e.target.files[0] : null)} />

      <button type="submit">S'inscrire</button>
    </form>
  )
}
