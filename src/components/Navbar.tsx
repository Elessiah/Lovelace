"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export default function Navbar() {
  const [userId, setUserId] = useState<string | null>(null)
  const [open, setOpen] = useState(false);

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
<header className="navBarWrapper">
    <div className="navBar">
        <Link href="/" className="brand">Lovelace</Link>

        <button className="menuButton" aria-label="Ouvrir le menu" aria-expanded={open} aria-controls="navMenu" onClick={() => setOpen(!open)}>
            <span className={`barBurgerMenu ${open ? "open" : ""}`} />
            <span className={`barBurgerMenu ${open ? "open" : ""}`} />
            <span className={`barBurgerMenu ${open ? "open" : ""}`} />
        </button>

        <nav id="navMenu" className={`menu ${open ? "open" : ""}`}>
            <ul>
                <li><Link href="/list" onClick={() => setOpen(false)}>Les Ambassadrices</Link></li>
                <li><Link href="/messagerie" onClick={() => setOpen(false)}>Ma Messagerie</Link></li>
                {userId ? (
                    <li><Link href={`/dashboard/${userId}`} onClick={() => setOpen(false)}>Mon Dashboard</Link></li>
                ) : (
                        <>
                        <li><Link href="/login" onClick={() => setOpen(false)}>Connexion</Link></li>
                        <li><Link className='menuCTAButton' href="/signup" onClick={() => setOpen(false)}>Inscription</Link></li>
                        </>
            )}
                <li><Link href="/logout" onClick={() => setOpen(false)}>Déconnexion</Link></li>
            </ul>        
        </nav>
    </div>
</header>
)
}