import {useEffect, useState} from "react";
import {redirect} from "next/navigation";
import "./Menu.css";
import InputCustom from "@/components/InputCustom";
import ProjectInput from "@/components/ProjectInput";

type Props = {
    endpoint: string;
}

export default function DashboardModel({endpoint}: Props) {
    const [ambassadorInfo, setAmbassadorInfo] = useState<AmbassadorInfo | null>(null);

    useEffect(() => {
        async function fetchData() {
            const res: Response = await fetch(endpoint);
            if (res.ok) {
                const {data} = await res.json();
                setAmbassadorInfo(data);
            } else {
                redirect("/login");
            }
        }

        fetchData();
    }, [endpoint]);

    if (ambassadorInfo == null)
        return (<>Chargement...</>);
    return (
        <div className="container">
            <h1 className={"title-menu"}>
                Votre page
            </h1>
            <InputCustom
                componentName={"biography"}
                displayName={"Courte biographie"}
                currentValue={ambassadorInfo.biography}
                type={"textarea"}
                endpoint={endpoint}
            />
            <InputCustom
                componentName={"job"}
                displayName={"Métier"}
                currentValue={ambassadorInfo.job}
                type={"text"}
                endpoint={endpoint}
            />
            <InputCustom
                componentName={"background"}
                displayName={"Parcours"}
                currentValue={ambassadorInfo.background}
                type={"textarea"}
                endpoint={endpoint}
            />
            <InputCustom
                componentName={"company"}
                displayName={"Entreprise"}
                currentValue={ambassadorInfo.job}
                type={"text"}
                endpoint={endpoint}
            />
            <InputCustom
                componentName={"pitch"}
                displayName={"Slogan / Phrase de motivation"}
                currentValue={ambassadorInfo.job}
                type={"textarea"}
                endpoint={endpoint}
            />
            <h2 className={"title-menu"}>
                Projets phares:
            </h2>
            {ambassadorInfo.projects.map((project, index) => (
                <ProjectInput
                    key={index}
                    index={index}
                    project_title={project.project_title}
                    project_description={project.project_description}
                    project_photo_path={project.project_photo_path}
                    endpoint={endpoint}
                />
            ))
            }
        </div>
    );
}