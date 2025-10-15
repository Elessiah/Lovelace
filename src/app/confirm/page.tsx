"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

export default function ConfirmPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [message, setMessage] = useState("Vérification en cours...")

  useEffect(() => {
    if (!token) {
      setMessage("Token manquant.")
      return
    }

    fetch(`/api/confirm?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setMessage("✅ Votre compte a été confirmé !")
        else setMessage(`❌ Erreur : ${data.message}`)
      })
      .catch(err => {
        console.error(err)
        setMessage("❌ Erreur serveur lors de la confirmation")
      })
  }, [token])

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Confirmation de compte</h1>
      <p>{message}</p>
    </div>
  )
}
