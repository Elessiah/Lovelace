// components/RegisterMenu.tsx
"use client";
import React, { useState } from 'react';
import { Eye, EyeOff } from "lucide-react";
import "./Menu.css";
import {redirect} from "next/navigation";

type Props = {
    targetOnSuccess: string;
    endpoint: string; // url d'API, défaut '/api/auth/register'
};

export default function RegisterMenu({ targetOnSuccess = "/", endpoint = '/api/register' }: Props) {
    const [role, setRole] = useState('User');
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [age, setAge] = useState("20");
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const emailValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

    if (success) {
        redirect(targetOnSuccess);
    }

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
                body: JSON.stringify({ role: role, firstname: firstname, lastname: lastname, age: age, email: email, password: password }),
            });

            if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                setError(j?.message || `Erreur ${res.status}`);
                setLoading(false);
                return;
            }

            setSuccess(true);
            setRole('User');
            setFirstname('');
            setLastname('');
            setAge("20");
            setEmail('');
            setPassword('');
            setConfirm('');
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
                    <label htmlFor="role"  className={"input-font"}>S'inscrire en tant que :</label>
                    <select className={"select-role"} value={role} onChange={e => setRole(e.target.value)}>
                        <option value={"User"}>Aspirante</option>
                        <option value={"Model"}>Ambassadrice</option>
                    </select>
                </div>
                {role === "Model" ?
                    <>
                        <div className={"input-container"}>
                            <label htmlFor="firstname" className={"input-font"}>Prénom</label>
                            <input
                                id="firstname"
                                type="text"
                                placeholder="Prénom"
                                value={firstname}
                                onChange={e => setFirstname(e.target.value)}
                                required
                                className={"input-input"}
                            />
                        </div>
                        <div className={"input-container"}>
                            <label htmlFor="lastname" className={"input-font"}>Nom</label>
                            <input
                                id="lastname"
                                placeholder="Nom de famille"
                                type="text"
                                value={lastname}
                                onChange={e => setLastname(e.target.value)}
                                required
                                className={"input-input"}
                            />
                        </div>
                    </>
                    :
                    <div className={"input-container"}>
                        <label htmlFor={"pseudo"} className={"input-font"}>Pseudo</label>
                        <input
                            id={"pseudo"}
                            placeholder="Pseudo"
                            type={"text"}
                            value={firstname}
                            onChange={e => setFirstname(e.target.value)}
                            required
                            className={"input-input"}
                            />
                    </div>
                }

                <div className={"input-container"}>
                    <label htmlFor={"age"} className={"input-font"}>Age</label>
                    <input
                        type="number"
                        id="age"
                        name="age"
                        placeholder="Age"
                        value={age}
                        onChange={e => setAge(e.target.value)}
                        min={0}
                        max={120}
                        className="input-input"
                        />
                </div>

                <div className={"input-container"}>
                    <label htmlFor="email" className={"input-font"}>Adresse e-mail</label>
                    <input
                        id="email"
                        type="email"
                        placeholder="Adresse e-mail"
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
                            placeholder="Mot de passe"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            autoComplete={"new-password"}
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

                <div className={"input-container"}>
                    <label htmlFor="confirm" className={"input-font"}>Confirmez avec votre mot de passe</label>
                    <div className="password-wrapper">
                        <input
                            id="confirm"
                            placeholder="Mot de passe à confirmer"
                            type={showPassword ? "text" : "password"}
                            value={confirm}
                            autoComplete={"new-password"}
                            onChange={e => setConfirm(e.target.value)}
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
