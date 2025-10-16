"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";

// 🔹 Types
interface Chat {
  id_chat: number;
  id_auteur: number;
  chat_key: string;
  encrypted_msg: string | null;
}

interface Message {
  auteur: number;
  msg: string;
  iv: string | null;
  timestamp: number;
}

export default function ChatPage() {
  const params = useParams();
  const id_chat = params.id_chat as string | undefined;
  const [chat, setChat] = useState<Chat | null>(null);
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 🔹 Chargement du chat
  useEffect(() => {
    if (!id_chat) {
      setLoading(false);
      return;
    }

    async function loadChat() {
      try {
        const res = await fetch(`/api/chat/${id_chat}`);
        const data = await res.json();

        if (data.success) {
          setChat(data.data as Chat);
          const parsedMsgs: Message[] = data.data.encrypted_msg
            ? JSON.parse(data.data.encrypted_msg)
            : [];
          setMsgs(parsedMsgs);
        } else {
          setChat(null);
        }
      } catch (err) {
        console.error("Erreur fetch chat:", err);
        setChat(null);
      } finally {
        setLoading(false);
      }
    }

    loadChat();
  }, [id_chat]);

  // 🔹 Envoi d'un message
  const sendMessage = async () => {
    if (!message.trim() || !chat) return;

    try {
      const res = await fetch(`/api/chat/${id_chat}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      setMessage("");

      if (data.success) {
        const res2 = await fetch(`/api/chat/${id_chat}`);
        const data2 = await res2.json();
        if (data2.success) {
          const parsedMsgs: Message[] = data2.data.encrypted_msg
            ? JSON.parse(data2.data.encrypted_msg)
            : [];
          setMsgs(parsedMsgs);
          chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      }
    } catch (err) {
      console.error("Erreur lors de l'envoi du message:", err);
      alert("Erreur lors de l'envoi du message");
    }
  };

  if (loading)
    return <p style={{ textAlign: "center", marginTop: 40 }}>Chargement...</p>;
  if (!chat)
    return <p style={{ textAlign: "center", marginTop: 40 }}>Chat non trouvé</p>;

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: "0 auto" }}>
      <h1>Chat privé</h1>
      <div
        style={{ border: "1px solid #ccc", padding: 16, height: 400, overflowY: "auto" }}
      >
        {msgs.map((m, i) => (
          <AsyncMessage key={i} m={m} chatKey={chat.chat_key} chat={chat} />
        ))}
        <div ref={chatEndRef} />
      </div>
      <div style={{ marginTop: 16 }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ width: "70%", padding: 8 }}
          placeholder="Écrire un message..."
        />
        <button
          onClick={sendMessage}
          style={{ padding: "8px 16px", marginLeft: 8 }}
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}

// 🔹 Déchiffrement asynchrone AES-CBC
function AsyncMessage({
  m,
  chatKey,
  chat,
}: {
  m: Message;
  chatKey: string;
  chat: Chat;
}) {
  const [text, setText] = useState("Chargement...");

  useEffect(() => {
    let mounted = true;

    async function decrypt() {
      if (!chatKey) return;

      // Gestion des messages fichiers
      if (m.msg.startsWith("FICHIER:")) {
        const fileName = m.msg.replace("FICHIER:", "");
        if (mounted) setText(`📎 ${fileName}`);
        return;
      }

      try {
        const keyBytes = Uint8Array.from(
          chatKey.match(/.{1,2}/g)!.map((b: string) => parseInt(b, 16))
        );
        const iv = Uint8Array.from(
          (m.iv ?? "").match(/.{1,2}/g)!.map((b: string) => parseInt(b, 16))
        );
        const ciphertext = Uint8Array.from(
          m.msg.match(/.{1,2}/g)!.map((b: string) => parseInt(b, 16))
        );

        const cryptoKey = await window.crypto.subtle.importKey(
          "raw",
          keyBytes,
          { name: "AES-CBC" },
          false,
          ["decrypt"]
        );

        const decryptedBuffer = await window.crypto.subtle.decrypt(
          { name: "AES-CBC", iv },
          cryptoKey,
          ciphertext
        );

        const decryptedText = new TextDecoder().decode(decryptedBuffer);
        if (mounted) setText(decryptedText);
      } catch {
        if (mounted) setText("Impossible de décrypter");
      }
    }

    decrypt();
    return () => {
      mounted = false;
    };
  }, [m, chatKey]);

  return (
    <div
      style={{
        marginBottom: 8,
        textAlign: m.auteur === chat.id_auteur ? "right" : "left",
      }}
    >
      <span
        style={{
          background: "#000",
          padding: "4px 8px",
          borderRadius: 8,
          display: "inline-block",
          color: "#fff",
        }}
      >
        {text}
      </span>
    </div>
  );
}
