"use client";

import { useEffect, useState, useRef } from "react";
import crypto from "crypto";

interface Chat {
  id_chat: number;
  id_auteur: number;
  id_destinataire: number;
  chat_key: string;
  encrypted_msg: string;
}

export default function MessageriePage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [msgs, setMsgs] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Charge tous les chats
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

  // Affiche les messages du chat sélectionné
  useEffect(() => {
    if (!selectedChat) return;
    const parsedMsgs = selectedChat.encrypted_msg ? JSON.parse(selectedChat.encrypted_msg) : [];
    setMsgs(parsedMsgs);
  }, [selectedChat]);

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
      // refresh messages
      const res = await fetch("/api/messagerie", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        const updatedChat = data.data.find((c: Chat) => c.id_chat === selectedChat.id_chat);
        if (updatedChat) setSelectedChat(updatedChat);
      }
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (err) {
      console.error("Erreur sendMessage:", err);
      alert("Erreur lors de l'envoi du message");
    }
  };

  const decryptMsg = (m: any) => {
    try {
      if (!selectedChat) return "Impossible de décrypter";
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

  if (loading) return <p style={{ textAlign: "center", marginTop: 40 }}>Chargement des chats...</p>;

  return (
    <div style={{ display: "flex", padding: 24, maxWidth: 900, margin: "0 auto" }}>
      {/* Liste des chats */}
      <div style={{ width: 250, marginRight: 24 }}>
        <h2>Chats</h2>
        {chats.map((c) => (
          <div key={c.id_chat} style={{ cursor: "pointer", padding: 8, borderBottom: "1px solid #ccc" }}
               onClick={() => setSelectedChat(c)}>
            Chat {c.id_chat} ({c.id_auteur} ↔ {c.id_destinataire})
          </div>
        ))}
      </div>

      {/* Messages du chat sélectionné */}
      <div style={{ flex: 1, border: "1px solid #ccc", padding: 16, height: 500, overflowY: "auto" }}>
        {selectedChat ? (
          <>
            {msgs.map((m, i) => (
              <div key={i} style={{ marginBottom: 8, textAlign: m.auteur === selectedChat.id_auteur ? "right" : "left" }}>
                <span style={{ background: "#000", padding: "4px 8px", borderRadius: 8, display: "inline-block" }}>
                  {decryptMsg(m)}
                </span>
              </div>
            ))}
            <div ref={chatEndRef} />
            <div style={{ marginTop: 16 }}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ width: "70%", padding: 8 }}
                placeholder="Écrire un message..."
              />
              <button onClick={sendMessage} style={{ padding: "8px 16px", marginLeft: 8 }}>Envoyer</button>
            </div>
          </>
        ) : (
          <p>Sélectionnez un chat</p>
        )}
      </div>
    </div>
  );
}
