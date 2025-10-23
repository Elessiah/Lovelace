import React, {useRef, useState} from "react";

type Props = {
    componentName: string;
    displayName: string;
    currentValue: string;
    isRequired?: boolean;
    type?: string;
    endpoint: string;
    min?: number;
    max?: number;
}

export default function InputCustom({ componentName, displayName, currentValue, isRequired = false, type = "text", endpoint, min = undefined, max = undefined }: Props) {
    const valueOG = useRef(currentValue);
    const [value, setValue] = useState(currentValue);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    async function handleSubmit()
    {
        if (error)
            setError(null);

        if (value == valueOG.current)
            return;

        if (min !== undefined && max !== undefined && (Number(value) < min || Number(value) > max)) {
            setError("Merci d'entrée une valeur cohérente");
            setValue(currentValue);
            return;
        }

        const res = await fetch(endpoint + "/" + componentName,
            { method: "POST", body: JSON.stringify({value}) });

        if (!res.ok) {
            const data = await res.json();
            setError(data?.message || `Erreur ${res.status}`);
            return;
        }

        valueOG.current = value;
        setSuccess(true);
        setTimeout(() => {
            setSuccess(false);
        }, 5000);
    }

    return (
        <div>
            <div className={"input-container"}>
                <label htmlFor={componentName} className={"input-font"}>{displayName}</label>
                    <input
                        id={componentName}
                        type={type}
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        required={isRequired}
                        className={"input-input"}
                        onBlur={e => handleSubmit() }
                        onKeyUp={e => { if (e.key === "Enter") { handleSubmit(); } } }
                        min={min}
                        max={max}
                    />
            </div>
            {error && <div role="alert" className={"div-alert-error"}>{error}</div>}
            {success && <div role="status" className={"div-alert-status"}>Mise à jour !</div>}
        </div>
    );
}