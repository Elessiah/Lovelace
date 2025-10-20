import React, {FormEvent, useState} from "react";

type Props = {
    componentName: string;
    displayName: string;
    endpoint: string;
}

export default function TextForm({ componentName, displayName, endpoint }: Props) {
    const [text, setText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError(null);
        setSuccess(false);

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({[componentName]: text}),
            });

            if (!res.ok) {
               const j = await res.json().catch(() => ({}));
               setError(j?.message || `Erreur ${res.status}`);
               return;
            }

            setSuccess(true);
            setText('');
        }
        catch (e: never) {
            setError(e?.message || 'Erreur réseau');
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className={"input-container"}>
                    <label htmlFor="text" className={"input-font"}>{displayName}</label>
                    <input
                        id={componentName}
                        type="text"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        required
                        className={"input-input"}
                    />
                </div>

                {error && <div role="alert" className={"div-alert-error"}>{error}</div>}
                {success && <div role="status" className={"div-alert-status"}>Connecté !</div>}

            </form>
        </div>
    );
}