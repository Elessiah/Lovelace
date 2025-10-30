"use client";

import { useEffect, useState } from "react"
import Link from "next/link";
import "./ambassador.css";
import { redirect, useParams } from "next/navigation";

export default function Ambassador() {

    const { ambassador_ID} = useParams();
    const [ambassadorInfo, setAmbassadorInfo] = useState<AmbassadorInfo | null>(null);

        useEffect(() => {
            async function fetchData() {
                const res: Response = await fetch(`/api/model/model_id/${ambassador_ID}`);
                if (res.ok) {
                    const {data} = await res.json();
                    setAmbassadorInfo(data);
                } else if (res.status != 404) {
                    redirect("/");
                }
            }

            fetchData();
        }, []);
        if (ambassadorInfo == null)
        return (<>Chargement...</>);

  return (
    <div className={"pageWrapper"}>
        <div className={"mainWrapper"}>
            <div className={"profileBannerAmbassador"}>
                <div className={"bannerTexts"}>
                    <div className={"titlesBannerAmbassador"}>
                        <div className={"titleNameAmbassador"}>
                            <h1>{ambassadorInfo.last_name}</h1>
                            <h1>{ambassadorInfo.first_name}</h1>
                        </div>
                        <div className={"titleJobAmbassador"}>
                            <h2>{ambassadorInfo.job}</h2>
                            <h2>{ambassadorInfo.company}</h2>
                        </div>
                    </div>
                    <div className={"thematicProfession"}>
                        <a href="">Thématique 1</a>
                        <p>|</p>
                        <a href="">Thématique 2</a>
                    </div>
                </div>
                <button className={"ctaButton"}>
                    <Link href="/">Echanger</Link>
                </button>
            </div>
            <div className={"aboutAmbassador"}>
                <h2>À propos</h2>
                <p>
                    {ambassadorInfo.biography}
                </p>
            </div>
            <div className={"routeAmbassador"}>
                <h2>Parcours</h2>
                <ul>
                   <li>2024 — Poste actuel, impact mesurable</li>
                   <li>2021 — Projet marquant, résultat</li>
                   <li>2019 — Diplôme / thèse</li>
                   <li>2017 — Stage / première expérience</li> 
                </ul>
            </div>
            <div className={"quoteAmbassador"}>
                <p>{ambassadorInfo.pitch}</p>
            </div>
            <div className={"projectsAmbassador"}>
                <h2>Projets phare</h2>
                {ambassadorInfo.projects.map((project: Project, index: number) => (
                    <div key={index} className={"projectCardAmbassador"}>
                    <img src={project.project_photo_path} />
                    <div className={"projectInfoAmbassador"}>
                        <h3>{project.project_title}</h3>
                        <p>{project.project_description}</p>
                    </div>
                </div>
                ))}

                <div className={"ctaContent"}>
                    <button className={"ctaButton"}>
                        <Link href="/">Echanger avec l'ambassadrice</Link>
                    </button>
                </div>
            </div>
            <div className={"adviceAmbassador"}>
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