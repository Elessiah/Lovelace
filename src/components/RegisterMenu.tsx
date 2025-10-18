// components/RegisterMenu.tsx
"use client";
import React, { useState } from 'react';
import "./RegisterLoginMenu.css";

type Props = {
    onSuccess?: () => void;
    endpoint?: string; // url d'API, défaut '/api/auth/register'
};

export default function RegisterMenu({ onSuccess, endpoint = '/api/auth/register' }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const emailValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

    async function handleSubmit(ev: React.FormEvent) {
        ev.preventDefault();
        setError(null);
        setSuccess(false);

        if (!emailValid(email)) { setError('E-mail invalide'); return; }
        if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return; }

        setLoading(true);
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                setError(j?.message || `Erreur ${res.status}`);
                setLoading(false);
                return;
            }

            setSuccess(true);
            setEmail('');
            setPassword('');
            setConfirm('');
            onSuccess?.();
        } catch (e: any) {
            setError(e?.message || 'Erreur réseau');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={"container"}>
            <h1 className={"title-menu"}>
                Inscription
            </h1>
            <form onSubmit={handleSubmit}>
                <div className={"input-container"}>
                    <label htmlFor="email" className={"input-font"}>Adresse e-mail</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className={"input-input"}
                    />
                </div>

                <div className={"input-container"}>
                    <label htmlFor="password" className={"input-font"}>Mot de passe</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className={"input-input"}
                    />
                </div>

                <div className={"input-container"}>
                    <label htmlFor="confirm" className={"input-font"}>Confirmer</label>
                    <input
                        id="confirm"
                        type="password"
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        required
                        className={"input-input"}
                    />
                </div>

                {error && <div role="alert" className={"div-alert-error"}>{error}</div>}
                {success && <div role="status" className={"div-alert-status"}>Compte créé. Vérifie ton e-mail.</div>}

                <div className={"div-submit"}>
                    <button
                        type="submit"
                        disabled={loading}
                        className={"submit-button"}
                    >
                        {loading ? 'Envoi...' : 'Créer mon compte'}
                    </button>
                </div>
                <a href="/login" className={"redirect"}>Connexion</a>
            </form>
        </div>
    );
}
