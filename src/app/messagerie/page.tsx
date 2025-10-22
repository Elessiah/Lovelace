"use client";

import { useEffect, useState, useRef } from "react";
import crypto from "crypto";

interface Chat {
  id_chat: number;
  id_auteur: number;
  id_destinataire: number;
  chat_key: string;
  encrypted_msg: string;
  auteur_first_name: string;
  auteur_last_name: string;
  dest_first_name: string;
  dest_last_name: string;
  auteur_pp: string | null;
  dest_pp: string | null;
}

interface Message {
  auteur: number;
  msg: string;
  iv: string | null;
  timestamp: number;
}

interface User {
  user_id: number;
  first_name: string;
  last_name: string;
  pp_path: string | null;
}

export default function MessageriePage() {
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Charger l'user connecté
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        const data = await res.json();
        if (data.success) setUser(data);
      } catch (err) {
        console.error("Erreur fetch user:", err);
      }
    }
    fetchUser();
  }, []);

  // Charger tous les chats
  useEffect(() => {
    async function fetchChats() {
      try {
        const res = await fetch("/api/messagerie", { credentials: "include" });
        const data = await res.json();
        if (data.success) setChats(data.data);
      } catch (err) {
        console.error("Erreur fetch chats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchChats();
  }, []);

  // Afficher les messages du chat sélectionné
  useEffect(() => {
    if (!selectedChat) return;
    const parsedMsgs = selectedChat.encrypted_msg
      ? JSON.parse(selectedChat.encrypted_msg)
      : [];
    setMsgs(parsedMsgs);
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat]);

  // Rafraîchir le chat
  const refreshChat = async (id_chat: number) => {
    const res = await fetch("/api/messagerie", { credentials: "include" });
    const data = await res.json();
    if (data.success) {
      const updatedChat = data.data.find((c: Chat) => c.id_chat === id_chat);
      if (updatedChat) setSelectedChat(updatedChat);
    }
  };

  // Rafraîchissement automatique toutes les 1s
  useEffect(() => {
    if (!selectedChat) return;
    const interval = setInterval(() => {
      refreshChat(selectedChat.id_chat);
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedChat]);

  // Envoi d'un message texte
  const sendMessage = async () => {
    if (!message.trim() || !selectedChat) return;
    try {
      await fetch("/api/messagerie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_chat: selectedChat.id_chat, message }),
        credentials: "include",
      });
      setMessage("");
      await refreshChat(selectedChat.id_chat);
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error("Erreur sendMessage:", err);
      alert("Erreur lors de l'envoi du message");
    }
  };

  // Envoi d’un fichier
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedChat || !e.target.files?.length) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("id_chat", String(selectedChat.id_chat));

    try {
      await fetch("/api/messagerie", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      await refreshChat(selectedChat.id_chat);
      e.target.value = "";
    } catch (err) {
      console.error("Erreur upload:", err);
      alert("Erreur lors de l'envoi du fichier");
    }
  };

  // Déchiffrement d’un message texte
  const decryptMsg = (m: Message) => {
    try {
      if (!selectedChat || !m.iv) return "Message non chiffré";
      const key = Buffer.from(selectedChat.chat_key, "hex");
      const iv = Buffer.from(m.iv, "hex");
      const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
      let decrypted = decipher.update(m.msg, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } catch {
      return "Impossible de décrypter";
    }
  };

  if (loading || !user)
    return <p style={{ textAlign: "center", marginTop: 40 }}>Chargement des chats...</p>;

  return (
    <div style={{ display: "flex", padding: 24, maxWidth: 900, margin: "0 auto" }}>
      {/* Liste des chats */}
      <div style={{ width: 260, marginRight: 24, borderRight: "1px solid #ddd" }}>
        <h2 style={{ marginBottom: 16 }}>Chats</h2>
        {chats.map((c) => {
          const otherName =
            user.user_id === c.id_auteur
              ? `${c.dest_first_name} ${c.dest_last_name}`
              : `${c.auteur_first_name} ${c.auteur_last_name}`;
          const otherPP =
            user.user_id === c.id_auteur
              ? c.dest_pp || "/default_pp.png"
              : c.auteur_pp || "/default_pp.png";

          return (
            <div
              key={c.id_chat}
              onClick={() => setSelectedChat(c)}
              style={{
                cursor: "pointer",
                padding: 8,
                borderBottom: "1px solid #eee",
                background:
                  selectedChat?.id_chat === c.id_chat ? "#f3f3f3" : "transparent",
                display: "flex",
                alignItems: "center",
              }}
            >
              <img
                src={otherPP}
                alt="pp"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  marginRight: 10,
                  objectFit: "cover",
                }}
              />
              <span>{otherName}</span>
            </div>
          );
        })}
      </div>

      {/* Messages du chat */}
      <div
        style={{
          flex: 1,
          border: "1px solid #ccc",
          borderRadius: 8,
          padding: 16,
          height: 500,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {selectedChat ? (
          <>
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {msgs.map((m, i) => {
                const isMine = m.auteur === user.user_id;
                const userPP = isMine
                  ? selectedChat.auteur_pp || "/default_pp.png"
                  : selectedChat.dest_pp || "/default_pp.png";

                const content = m.msg.startsWith("FICHIER:")
                  ? (() => {
                      const fileName = m.msg.replace("FICHIER:", "");
                      const fileUrl = `/api/messagerie?file=${fileName}`;
                      if (fileName.match(/\.(png|jpg|jpeg|gif)$/i)) {
                        return (
                          <img
                            src={fileUrl}
                            alt="Image"
                            style={{ maxWidth: "200px", borderRadius: 8 }}
                          />
                        );
                      } else {
                        return (
                          <a
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "#007bff",
                              textDecoration: "underline",
                            }}
                          >
                            📎 Télécharger le fichier
                          </a>
                        );
                      }
                    })()
                  : decryptMsg(m);

                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      flexDirection: isMine ? "row-reverse" : "row",
                      alignItems: "flex-end",
                      marginBottom: 8,
                      gap: 8,
                    }}
                  >
                    <img
                      src={userPP}
                      alt="pp"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                    <div
                      style={{
                        maxWidth: "70%",
                        padding: "6px 10px",
                        borderRadius: 10,
                        background: isMine ? "#007bff" : "#eee",
                        color: isMine ? "#fff" : "#000",
                        wordWrap: "break-word",
                      }}
                    >
                      {content}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Zone d’envoi */}
            <div style={{ marginTop: 8, display: "flex", alignItems: "center" }}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{
                  flex: 1,
                  padding: 8,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                }}
                placeholder="Écrire un message..."
              />
              <button
                onClick={sendMessage}
                style={{
                  padding: "8px 16px",
                  marginLeft: 8,
                  borderRadius: 6,
                  border: "none",
                  background: "#007bff",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Envoyer
              </button>
              <input
                type="file"
                onChange={handleFileUpload}
                style={{ marginLeft: 8 }}
              />
            </div>
          </>
        ) : (
          <p style={{ textAlign: "center", marginTop: 200 }}>
            Sélectionnez un chat
          </p>
        )}
      </div>
    </div>
  );
}
