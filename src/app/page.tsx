"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import styles from "./page.module.css"

export default function Home() {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUserId() {
      try {
        const res = await fetch("/api/")
        const data = await res.json()
        if (data.success) setUserId(data.user_id.toString())
      } catch (err) {
        console.error(err)
      }
    }

    fetchUserId()
  }, [])

  return (
    <div className="pageWrapper">
      <div className="mainWrapper">
        <div className="navBar">
          <Link href="/" className="brand">Lovelace</Link>
          <nav className="menu">
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
            <Link href="/messagerie">Ma Messagerie</Link>
            <br /><br />
            <Link href="/logout">Page de déconnexion</Link>
          </nav>
        </div>
        <div className={styles.sectionHero}>
          <h1>La plateforme qui rend visibles les femmes de science</h1>
          <p>Les modèles féminins existent. Nous les mettons en lumière pour inspirer les générations futures et montrer la diversité des parcours scientifiques d'aujourd'hui.</p>
          <button className="ctaButton">
            <Link href="/list">Découvrir les ambassadrices</Link>
          </button>
        </div>
        <div className={styles.sectionInfo}>
          <h2>Redonner leur place aux femmes dans les sciences</h2>
          <p>Les métiers scientifiques souffrent d'un manque de visibilité féminine. Notre plateforme présente celles qui innovent, enseignent, inventent et dirigent. Elles partagent leurs expériences pour aider les jeunes à trouver leur voie.</p>
        </div>
        <div className={styles.sectionStrengths}>
          <h2>Les atouts</h2>
          <div className={styles.sectionStrengthsMainWrapper}>
            <div className={styles.sectionStrenghtWrapperRight}>
              <div className={styles.strengthProfile}><h3>Profils réels et vérifiés</h3></div>
              <div className={styles.strengthTestimonies}><h3>Témoignages concrets</h3></div>
            </div>
            <div className={styles.strengthMentoring}><h3>Mentorat et échanges possibles</h3></div>
          </div>
        </div>
        <div className="sectionRoute">
          <h2>Explorer les parcours</h2>
          <div className="filters">
            <button className="filterButton">Aéronautique</button>
            <button className="filterButton">Biologie</button>
            <button className="filterButton">Chimie</button>
            <button className="filterButton">Informatique</button>
            <button className="filterButton">Mathématiques</button>
            <button className="filterButton">Physique</button>
            <button className="filterButton">Santé</button>
          </div>
          <div className="sectionScientists">
            <div className="profilesScientistsWrapper">
              <div className="profileScientistCard">
                <h3>Nom Prénom</h3>
              </div>
              <div className="profileScientistCard">
                <h3>Nom Prénom</h3>
              </div>
              <div className="profileScientistCard">
                <h3>Nom Prénom</h3>
              </div>
            </div>
            <div className="arrow"></div>
          </div>
          <div className="testimonies">
            <h2>Un impact mesurable</h2>
            <p>Chaque visite compte. Chaque échange inspire.</p>
            <div className="testimonyCard">
              <p>"J'ai découvert une chercheuse qui m'a donné envie de poursuivre mes études en physique."</p>
              <p className="author">Élise, 17 ans</p>
            </div>
          </div>
          <div className="sectionKeyFigures">
            <h3 className="keyFigures">+300 profils d'ambassadrices</h3>
            <h3 className="keyFigures">+10 000 jeunes accompagnés</h3>
            <h3 className="keyFigures">25 domaines scientifiques représentés</h3>
          </div>
          <div className="shareRoute">
            <h2>Partage ton parcours</h2>
            <p>Tu veux inspirer à ton tour ? Rejoins la communauté d'ambassadrices et aide à ouvrir de nouveaux horizons.</p>
            <button className="ctaButton">
              <Link href="/signup">Devenir ambassadrice</Link>
            </button>
          </div>
          <div className="footer">
            <p>&copy; 2025 Lovelace. Tous droits réservés.</p>
            <Link href="/legal">Mentions légales</Link>
          </div>
        </div>
      </div>
    </div>
  )
}