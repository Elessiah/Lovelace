"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function logout() {
      try {
        await fetch("/api/logout");
        router.push("/login"); // Redirige vers la page de login
      } catch (err) {
        console.error("Erreur lors de la déconnexion :", err);
      }
    }

    logout();
  }, [router]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Déconnexion en cours...</h2>
      <p>Vous allez être redirigé vers la page de connexion.</p>
    </div>
  );
}
