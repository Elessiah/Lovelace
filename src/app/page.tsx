"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUserId() {
      try {
        const res = await fetch("/api/")
        const data = await res.json()
        if (data.success) setUserId(data.id_user.toString())
      } catch (err) {
        console.error(err)
      }
    }

    fetchUserId()
  }, [])

  return (
    <div>
      <Link href="/signup">Inscription</Link>
      <br /><br />
      <Link href="/login">Connexion</Link>
      <br /><br />
      {userId ? (
        <Link href={`/dashboard/${userId}`}>Mon Dashboard</Link>
      ) : (
        <span>Connectez-vous pour accéder à votre dashboard</span>
      )}
      <br /><br />
      <Link href="/list">Page Ambassadrices</Link>
      <br /><br />
      <Link href="/logout">Page de déconnexion</Link>
    </div>
  )
}
