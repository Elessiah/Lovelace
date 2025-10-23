import React, {useEffect, useState} from "react";
import InputCustom from "@/components/InputCustom";
import {redirect} from "next/navigation";
import "./Menu.css"

type Props = {
    endpoint: string;
}

export default function DashboardUser({endpoint}: Props) {
    const [user, setUser] = useState<UserDashboard | null>(null);

    useEffect(() => {
        async function fetchUser() {
            const res: Response = await fetch(endpoint);
            if (res.ok)
            {
                const {data} = await res.json();
                setUser(data);
            } else {
                redirect("/login");
            }
        }

        fetchUser();
    }, [endpoint]);

    console.log(user);
    if (user == null)
        return (<>Chargement...</>);
    return (
        <div className="container">
            <h1 className={"title-menu"}>
                Informations personnelles
            </h1>
            <InputCustom
                componentName={"first_name"}
                displayName={user.role == "Model" ? "Prénom" : "Pseudo"}
                currentValue={user.first_name}
                isRequired={false}
                type={"text"}
                endpoint={endpoint}
            />
            {(user.role == "Model") &&
                <InputCustom
                    componentName={"last_name"}
                    displayName={"Nom de famille"}
                    currentValue={user.last_name}
                    isRequired={false}
                    type={"text"}
                    endpoint={endpoint}
                />
            }
            <InputCustom
                componentName={"age"}
                displayName={"Age"}
                currentValue={String(user.age)}
                isRequired={false}
                type={"number"}
                endpoint={endpoint}
                min={0}
                max={120}
            />
            <InputCustom
                componentName={"email"}
                displayName={"Email"}
                currentValue={user.email}
                isRequired={false}
                type={"email"}
                endpoint={endpoint}
            />
        </div>
    )
}