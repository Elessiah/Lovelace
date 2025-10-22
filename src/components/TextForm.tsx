import React, {useState} from "react";

type Props = {
    componentName: string;
    displayName: string;
    isRequired: boolean;
    type: string;
}

export default function TextForm({ componentName, displayName, isRequired, type }: Props) {
    const [text, setText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    return (
        <div>
            <div className={"input-container"}>
                <label htmlFor={componentName} className={"input-font"}>{displayName}</label>
                <input
                    id={componentName}
                    type={type}
                    value={text}
                    onChange={e => setText(e.target.value)}
                    required={isRequired}
                    className={"input-input"}
                />
            </div>
            {error && <div role="alert" className={"div-alert-error"}>{error}</div>}
            {success && <div role="status" className={"div-alert-status"}>Mise à jour !</div>}
        </div>
    );
}