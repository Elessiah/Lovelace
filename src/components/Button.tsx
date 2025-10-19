"use client"

import {useState} from "react";

export default function Button({ children, onClick} : { children: React.ReactNode; onClick: () => void })
{
    const [Counter, setCounter] = useState(0)
    console.log("Bouton est rendu");
    return (
        <button onClick={() => setCounter(Counter + 1)}>
            {children} : {Counter}
        </button>
    )
}