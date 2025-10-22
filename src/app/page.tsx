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
        <div className={styles.sectionHero}>
          <h1>La plateforme qui rend visibles les femmes de science</h1>
          <p>Les modèles féminins existent. Nous les mettons en lumière pour inspirer les générations futures et montrer la diversité des parcours scientifiques d'aujourd'hui.</p>
          <button className="ctaButton">
            <Link href="/list">Découvrir les ambassadrices</Link>
          </button>
        </div>
        <div className={styles.sectionRoute}>
          <h2 id={styles.routeTitle}>Explorer les parcours</h2>
          <div className={styles.filters}>
            <button className={styles.filterButton}>Aéronautique</button>
            <button className={styles.filterButton}>Biologie</button>
            <button className={styles.filterButton}>Chimie</button>
            <button className={styles.filterButton}>Géologie</button>
            <button className={styles.filterButton}>Informatique</button>
            <button className={styles.filterButton}>Mathématiques</button>
            <button className={styles.filterButton}>Physique</button>
            <button className={styles.filterButton}>Santé</button>
          </div>
          <div className="sectionScientists">
            <div className={styles.profilesScientistsWrapper}>
              <div className={styles.profileScientistCard}>
                <h3>Nom Prénom</h3>
              </div>
              <div className={styles.profileScientistCard}>
                <h3>Nom Prénom</h3>
              </div>
              <div className={styles.profileScientistCard}>
                <h3>Nom Prénom</h3>
              </div>
            </div>
            <div className="arrow"></div>
          </div>
          <div className={styles.sectionInfo}>
            <h2>Redonner leur place aux femmes dans les sciences</h2>
            <p>Les métiers scientifiques souffrent d'un manque de visibilité féminine. Notre plateforme présente celles qui innovent, enseignent, inventent et dirigent. Elles partagent leurs expériences pour aider les jeunes à trouver leur voie.</p>
          </div>
          <div className={styles.testimonies}>
            <h2>Un impact mesurable</h2>
            <p>Chaque visite compte. Chaque échange inspire.</p>
            <div className={styles.testimonyCard}>
              <p className={styles.textTestimony}>"J'ai découvert une chercheuse qui m'a donné envie de poursuivre mes études en physique."</p>
              <p className={styles.author}>Élise, 17 ans</p>
            </div>
          </div>
          <div className={styles.sectionKeyFigures}>
            <div className={styles.keyFigureWrapper}>
              <h3>+300 profils d'ambassadrices</h3>
            </div>
            <div className={styles.keyFigureWrapper}>
              <h3>+10 000 jeunes accompagnés</h3>
            </div>
            <div className={styles.keyFigureWrapper}>
              <h3>25 domaines scientifiques représentés</h3>
            </div>
          </div>
          <div className={styles.shareRoute}>
            <h2>Partage ton parcours</h2>
            <p>Tu veux inspirer à ton tour ? <br /> Rejoins la communauté d'ambassadrices et aide à ouvrir de nouveaux horizons.</p>
            <button className="ctaButton">
              <Link href="/signup">Devenir ambassadrice</Link>
            </button>
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        <p>&copy; 2025 Lovelace. Tous droits réservés.</p>
        <Link href="/legal">Mentions légales</Link>
      </div>
    </div>
  )
}