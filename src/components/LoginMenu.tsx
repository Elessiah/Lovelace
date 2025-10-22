// components/LoginMenu.tsx
"use client";
import React, { useState } from 'react';
import "./RegisterLoginMenu.css";
import {redirect} from "next/navigation";
import {Eye, EyeOff} from "lucide-react";

type Props = {
    endpoint: string; // url d'API, défaut '/api/auth/register'
};

export default function LoginMenu({ endpoint = '/api/login' }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [targetOnSuccess, setTargetOnSuccess] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const emailValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

    if (targetOnSuccess.length > 0) {
        redirect(targetOnSuccess);
    }

    async function handleSubmit(ev: React.FormEvent) {
        ev.preventDefault();
        setError(null);

        if (!emailValid(email)) { setError('E-mail invalide'); return; }

        setLoading(true);
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, password: password }),
            });
            const data: redirectPackage = await res.json().catch(() => ({}));

            if (!res.ok) {
                setError(data?.message || `Erreur ${res.status}`);
                setLoading(false);
                return;
            }

            setTargetOnSuccess(data.redirect);
            setEmail('');
            setPassword('');
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
                    <div className="password-wrapper">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            className="input-input"
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                        >
                            {showPassword ? <Eye size={20}/> : <EyeOff size={20}/>}
                        </button>
                    </div>
                </div>

                {error && <div role="alert" className={"div-alert-error"}>{error}</div>}

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
