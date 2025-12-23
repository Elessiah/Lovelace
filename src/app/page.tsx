"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import "./Home.css"

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
        <div className={"sectionHero"}>
          <h1>La plateforme qui rend visibles les femmes de science</h1>
          <p>Les modèles féminins existent. Nous les mettons en lumière pour inspirer les générations futures et montrer la diversité des parcours scientifiques d'aujourd'hui.</p>
          <button className="ctaButton">
            <Link href="/list">Découvrir les ambassadrices</Link>
          </button>
        </div>
        <div className={"sectionRoute"}>
          <h2 id={"routeTitle"}>Explorer les parcours</h2>
          <div className={"filters"}>
            <button className={"filterButton"}>Aéronautique</button>
            <button className={"filterButton"}>Biologie</button>
            <button className={"filterButton"}>Chimie</button>
            <button className={"filterButton"}>Géologie</button>
            <button className={"filterButton"}>Informatique</button>
            <button className={"filterButton"}>Mathématiques</button>
            <button className={"filterButton"}>Physique</button>
            <button className={"filterButton"}>Santé</button>
          </div>
          <div className="sectionScientists">
            <div className={"profilesScientistsWrapper"}>
              <div className={"profileScientistCard"}>
                <h3>Nom Prénom</h3>
              </div>
              <div className={"profileScientistCard"}>
                <h3>Nom Prénom</h3>
              </div>
              <div className={"profileScientistCard"}>
                <h3>Nom Prénom</h3>
              </div>
            </div>
            <div className="arrow"></div>
          </div>
          <div className={"sectionInfo"}>
            <h2>Redonner leur place aux femmes dans les sciences</h2>
            <p>Les métiers scientifiques souffrent d'un manque de visibilité féminine. Notre plateforme présente celles qui innovent, enseignent, inventent et dirigent. Elles partagent leurs expériences pour aider les jeunes à trouver leur voie.</p>
          </div>
          <div className={"testimonies"}>
            <h2>Un impact mesurable</h2>
            <p>Chaque visite compte. Chaque échange inspire.</p>
            <div className={"testimonyCard"}>
              <p className={"textTestimony"}>"J'ai découvert une chercheuse qui m'a donné envie de poursuivre mes études en physique."</p>
              <p className={"author"}>Élise, 17 ans</p>
            </div>
          </div>
          <div className={"sectionKeyFigures"}>
            <div className={"keyFigureWrapper"}>
              <h3>+300 profils d'ambassadrices</h3>
            </div>
            <div className={"keyFigureWrapper"}>
              <h3>+10 000 jeunes accompagnés</h3>
            </div>
            <div className={"keyFigureWrapper"}>
              <h3>25 domaines scientifiques représentés</h3>
            </div>
          </div>
          <div className={"shareRoute"}>
            <h2>Partage ton parcours</h2>
            <p>Tu veux inspirer à ton tour ? <br /> Rejoins la communauté d'ambassadrices et aide à ouvrir de nouveaux horizons.</p>
            <button className="ctaButton">
              <Link href="/register">Devenir ambassadrice</Link>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}