"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Ambassador {
  first_name: string;
  last_name: string;
  pp_path?: string;
  metier?: string;
  domaine?: string;
  biographie?: string;
}

export default function ListIdPage() {
  const [ambassador, setAmbassador] = useState<Ambassador | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const id_user = Number(params.id_user);

  useEffect(() => {
    console.log("[ListIdPage] useEffect triggered, id_user =", id_user);

    if (!id_user || isNaN(id_user)) {
      console.warn("[ListIdPage] id_user invalide");
      setLoading(false);
      setAmbassador(null);
      return;
    }

    const fetchData = async () => {
      try {
        console.log("[ListIdPage] Fetching /api/list/perId");
        const res = await fetch(`/api/list/perId?id_user=${id_user}`);
        const data = await res.json();
        console.log("[ListIdPage] fetch response:", data);

        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setAmbassador(data.data[0]);
          console.log("[ListIdPage] Ambassador data set:", data.data[0]);
        } else {
          console.warn("[ListIdPage] Aucun ambassadeur trouvé pour cet id_user");
          setAmbassador(null);
        }
      } catch (err) {
        console.error("[ListIdPage] Erreur fetch /api/list/perId:", err);
        setAmbassador(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id_user]);

  const startChat = async () => {
    if (!id_user) {
      console.warn("[ListIdPage] startChat appelé avec id_user invalide");
      return;
    }

    try {
      console.log("[ListIdPage] startChat avec id_user =", id_user);
      const res = await fetch("/api/chat/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_destinataire: id_user }),
      });
      const data = await res.json();
      console.log("[ListIdPage] startChat response:", data);

      if (data.success && data.id_chat) {
        router.push(`/chat/${data.id_chat}`);
      } else {
        alert(data.message || "Impossible de lancer le chat");
      }
    } catch (err) {
      console.error("[ListIdPage] Erreur lors du lancement du chat:", err);
      alert("Erreur lors du lancement du chat");
    }
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: 40 }}>Chargement...</p>;
  if (!ambassador) return <p style={{ textAlign: "center", marginTop: 40 }}>Ambassadrice non trouvée.</p>;

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 24 }}>
        {ambassador.first_name} {ambassador.last_name}
      </h1>
      <div
        style={{
          backgroundColor: "#fff",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          borderRadius: 16,
          padding: 16,
          textAlign: "center",
        }}
      >
        <img
          src={ambassador.pp_path || "/default-avatar.png"}
          alt={`Photo de ${ambassador.first_name} ${ambassador.last_name}`}
          style={{
            width: 120,
            height: 120,
            objectFit: "cover",
            borderRadius: "50%",
            margin: "0 auto 16px",
          }}
        />
        <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
          {ambassador.metier || "Métier non renseigné"}
        </p>
        <p style={{ fontSize: 14, color: "#555", marginBottom: 16 }}>
          {ambassador.domaine || "—"}
        </p>
        <p style={{ fontSize: 14, color: "#333", marginBottom: 16 }}>
          {ambassador.biographie || "Pas encore de biographie."}
        </p>
        <button
          onClick={startChat}
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: 8,
            backgroundColor: "#4f46e5",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Lancer un chat privé
        </button>
      </div>
    </div>
  );
}
