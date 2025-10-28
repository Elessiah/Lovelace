"use client";

import { useEffect, useState } from "react"
import Link from "next/link";
import styles from "./ambassador.module.css";

export default function Ambassador() {
  return (
    <div className="pageWrapper">
        <div className="mainWrapper">
            <div className={styles.profileBannerAmbassador}>
                <div className={styles.bannerTexts}>
                    <div className={styles.titlesBannerAmbassador}>
                        <div className="titleNameAmbassador">
                            <h1>Nom</h1>
                            <h1>Prénom</h1>
                        </div>
                        <div className={styles.titleJobAmbassador}>
                            <h2>Métier</h2>
                            <h2>Entreprise</h2>
                        </div>
                    </div>
                    <div className={styles.thematicProfession}>
                        <a href="">Thématique 1</a>
                        <p>|</p>
                        <a href="">Thématique 2</a>
                    </div>
                </div>
                <button className="ctaButton">
                    <Link href="/">Echanger</Link>
                </button>
            </div>
            <div className={styles.aboutAmbassador}>
                <h2>À propos</h2>
                <p>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam ut tortor fringilla, pellentesque purus eget, maximus risus. Integer tincidunt augue eros, et mattis ante porta vitae. Praesent pharetra, odio vel bibendum hendrerit, sapien elit tempor mauris, in fermentum nisi magna vel dui. Proin sed molestie justo. Cras mollis turpis mauris. Maecenas lacinia, enim tristique convallis luctus, urna justo ornare nisi, eu euismod urna diam tempor augue. Donec tincidunt magna id nibh euismod, id ullamcorper nunc lobortis. Pellentesque vel augue quis purus dapibus tincidunt. Nulla luctus egestas venenatis.
                </p>
            </div>
            <div className={styles.routeAmbassador}>
                <h2>Parcours</h2>
                <ul>
                   <li>2024 — Poste actuel, impact mesurable</li>
                   <li>2021 — Projet marquant, résultat</li>
                   <li>2019 — Diplôme / thèse</li>
                   <li>2017 — Stage / première expérience</li> 
                </ul>
            </div>
            <div className={styles.projectsAmbassador}>
                <h2>Projets phare</h2>
                <div className={styles.projectCardAmbassador}>
                    <img src="/project1.png" alt="Project 1" />
                    <div className={styles.projectInfoAmbassador}>
                        <h3>Projet 1</h3>
                        <p>Description brève du projet 1 et de son impact.</p>
                    </div>
                </div>
                <div className={styles.projectCardAmbassador}>
                    <img src="/project1.png" alt="Project 1" />
                    <div className={styles.projectInfoAmbassador}>
                        <h3>Projet 2</h3>
                        <p>Description brève du projet 2 et de son impact.</p>
                    </div>
                </div>
                <div className="ctaContent">
                    <button className="ctaButton">
                        <Link href="/">Echanger avec l'ambassadrice</Link>
                    </button>
                </div>
            </div>
            <div className={styles.quoteAmbassador}>
                <p>"Citation inspirante de l'ambassadrice sur son parcours ou sa vision des sciences."</p>
            </div>
            <div className={styles.adviceAmbassador}>
                <h2>Mes conseils</h2>
                <ul>
                    <li>Fais des projets concrets dès l’école.</li>
                    <li>Apprends la mesure et le terrain.</li>
                    <li>Demande des retours réguliers.</li>
                </ul>
            </div>
        </div>
    </div>
  )
}