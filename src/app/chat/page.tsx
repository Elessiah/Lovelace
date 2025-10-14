"use client" 
// 👉 Obligatoire ici : ça indique à Next.js que ce fichier s’exécute CÔTÉ NAVIGATEUR
// (par défaut, tout dans /app est côté serveur)

import { useState } from "react"
// 👉 On importe useState de React pour stocker et modifier des valeurs à l’intérieur du composant

// ============================
// === COMPOSANT PRINCIPAL ===
// ============================
export default function Connexion() {
  // ----------------------------
  // 🔹 Déclaration des variables d'état (states)
  // ----------------------------
  // "pseudo" : contient la valeur tapée dans l'input
  // "setPseudo" : permet de modifier cette valeur
  const [pseudo, setPseudo] = useState("")

  // "message" : contiendra la réponse envoyée par le serveur (ex : "Salut Vincent !")
  // "setMessage" : pour la modifier
  const [message, setMessage] = useState("")

  // ----------------------------
  // 🔹 Fonction qui s’exécute quand on clique sur "Envoyer"
  // ----------------------------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault() 
    // 🔸 Empêche le comportement par défaut du formulaire
    //    (sinon la page se rechargerait complètement)

    // 🔹 On envoie une requête HTTP POST vers notre route API "/api/connexion"
    const res = await fetch("/api/connexion", {
      method: "POST", // méthode HTTP
      headers: {
        "Content-Type": "application/json", // indique qu’on envoie du JSON
      },
      body: JSON.stringify({ pseudo }), 
      // 🔸 On transforme notre objet { pseudo: "Vincent" } en texte JSON
      //    car le corps d’une requête HTTP doit toujours être une chaîne de texte
    })

    // 🔹 On attend la réponse du serveur, puis on la convertit en JSON
    const data = await res.json()

    // 🔹 On stocke la valeur du message renvoyé dans notre state
    setMessage(data.message)
  }

  // ----------------------------
  // 🔹 Ce que la page affiche
  // ----------------------------
  return (
    <form onSubmit={handleSubmit}>
      {/* Champ texte lié à la variable pseudo */}
      <input
        type="text"
        value={pseudo}                        // valeur actuelle du champ
        onChange={e => setPseudo(e.target.value)} // se met à jour à chaque frappe
        placeholder="Entre ton pseudo"        // texte grisé par défaut
      />

      {/* Bouton pour valider le formulaire */}
      <button type="submit">Envoyer</button>

      {/* Si on a reçu un message du serveur, on l’affiche */}
      {message && <p>{message}</p>}
    </form>
  )
}
