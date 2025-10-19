"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ListPage() {
  const [ambassadors, setAmbassadors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/list");
        const data = await res.json();
        if (data.success) setAmbassadors(data.data);
      } catch (err) {
        console.error("Erreur fetch /api/list :", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <p style={{ textAlign: "center", marginTop: "40px" }}>Chargement...</p>;

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "24px" }}>Nos Ambassadrices</h1>

      {ambassadors.length === 0 ? (
        <p>Aucune ambassadrice active pour le moment.</p>
      ) : (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            justifyContent: "center"
          }}
        >
          {ambassadors.map((a) => (
            <div
              key={a.id_user}
              style={{
                cursor: "pointer",
                backgroundColor: "#fff",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                borderRadius: "16px",
                padding: "16px",
                width: "200px",
                textAlign: "center",
                transition: "all 0.2s",
              }}
            >
              <img
                src={a.pp_path || "/default-avatar.png"}
                alt={`${a.first_name} ${a.last_name}`}
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                  borderRadius: "50%",
                  margin: "0 auto 12px"
                }}
              />
              <h2 style={{ color:"#000", fontSize: "18px", fontWeight: "600", margin: "8px 0" }}>
                {a.first_name} {a.last_name}
              </h2>
              <button
                onClick={() => router.push(`/list/${a.id_user}`)}
                style={{
                  padding: "8px 12px",
                  margin: "8px 0",
                  border: "none",
                  borderRadius: "8px",
                  backgroundColor: "#4f46e5",
                  color: "#fff",
                  cursor: "pointer"
                }}
              >
                Page ambassadrice
              </button>
              <p style={{ fontSize: "14px", color: "#555", margin: "4px 0" }}>
                {a.metier || "Métier non renseigné"}
              </p>
              <p style={{ fontSize: "12px", color: "#888", margin: "4px 0" }}>
                {a.domaine || "—"}
              </p>
              <p style={{ fontSize: "14px", color: "#333", marginTop: "8px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {a.biographie || "Pas encore de biographie."}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
