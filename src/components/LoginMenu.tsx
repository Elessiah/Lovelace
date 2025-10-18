// components/LoginMenu.tsx
"use client";
import React, { useState } from 'react';
import "./RegisterLoginMenu.css";

type Props = {
    onSuccess?: () => void;
    endpoint?: string; // url d'API, défaut '/api/auth/register'
};

export default function LoginMenu({ onSuccess, endpoint = '/api/auth/register' }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const emailValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

    async function handleSubmit(ev: React.FormEvent) {
        ev.preventDefault();
        setError(null);
        setSuccess(false);

        if (!emailValid(email)) { setError('E-mail invalide'); return; }

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
                Connexion
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

                {error && <div role="alert" className={"div-alert-error"}>{error}</div>}
                {success && <div role="status" className={"div-alert-status"}>Connecté !</div>}

                <div className={"div-submit"}>
                    <button
                        type="submit"
                        disabled={loading}
                        className={"submit-button"}
                    >
                        {loading ? 'Envoi...' : 'Connexion'}
                    </button>
                </div>
                <a href="/register" className={"redirect"}>S'inscrire</a>
            </form>
        </div>
    );
}
