"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";

export default function ChatPage() {
  const params = useParams();
  const id_chat = params.id_chat; // correspond maintenant au nom du fichier [id_chat]
  const [chat, setChat] = useState<any>(null);
  const [msgs, setMsgs] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log("[ChatPage] useEffect triggered, id_chat =", id_chat);

    if (!id_chat) {
      console.warn("[ChatPage] id_chat invalide");
      setLoading(false);
      return;
    }

    async function loadChat() {
      try {
        console.log("[ChatPage] Fetching chat data...");
        const res = await fetch(`/api/chat?id_chat=${id_chat}`);
        const data = await res.json();
        console.log("[ChatPage] fetch /api/chat response:", data);

        if (data.success) {
          setChat(data.data);
          const parsedMsgs = data.data.encrypted_msg ? JSON.parse(data.data.encrypted_msg) : [];
          console.log("[ChatPage] Parsed messages:", parsedMsgs);
          setMsgs(parsedMsgs);
        } else {
          console.warn("[ChatPage] Chat non trouvé ou fetch échoué");
          setChat(null);
        }
      } catch (err) {
        console.error("[ChatPage] Erreur fetch chat:", err);
        setChat(null);
      } finally {
        console.log("[ChatPage] Finished loading chat");
        setLoading(false);
      }
    }

    loadChat();
  }, [id_chat]);

  const sendMessage = async () => {
    if (!message.trim() || !chat) return;

    try {
      console.log("[ChatPage] Sending message:", message);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_chat: chat.id_chat, message, userId: 1 }), // remplacer userId si nécessaire
      });
      const data = await res.json();
      console.log("[ChatPage] send message response:", data);

      setMessage("");

      // refresh messages
      console.log("[ChatPage] Refreshing messages...");
      const res2 = await fetch(`/api/chat?id_chat=${id_chat}`);
      const data2 = await res2.json();
      console.log("[ChatPage] fetch /api/chat after send:", data2);

      if (data2.success) {
        const parsedMsgs = data2.data.encrypted_msg ? JSON.parse(data2.data.encrypted_msg) : [];
        console.log("[ChatPage] Updated messages:", parsedMsgs);
        setMsgs(parsedMsgs);
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } catch (err) {
      console.error("[ChatPage] Erreur lors de l'envoi du message:", err);
      alert("Erreur lors de l'envoi du message");
    }
  };

  if (loading) return <p style={{ textAlign: "center", marginTop: 40 }}>Chargement... (loading)</p>;
  if (!chat) return <p style={{ textAlign: "center", marginTop: 40 }}>Chat non trouvé</p>;

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: "0 auto" }}>
      <h1>Chat privé</h1>
      <div style={{ border: "1px solid #ccc", padding: 16, height: 400, overflowY: "auto" }}>
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

// Déchiffrement asynchrone AES-CBC avec logs
function AsyncMessage({ m, chatKey, chat }: { m: any; chatKey: string; chat: any }) {
  const [text, setText] = useState("Chargement...");

  useEffect(() => {
    let mounted = true;
    async function decrypt() {
      if (!chatKey) return;

      try {
        console.log("[AsyncMessage] Déchiffrement message:", m);
        const keyBytes = Uint8Array.from(chatKey.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
        const iv = Uint8Array.from(m.iv.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
        const ciphertext = Uint8Array.from(m.msg.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));

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
        console.log("[AsyncMessage] Message déchiffré:", decryptedText);

        if (mounted) setText(decryptedText);
      } catch (err) {
        console.error("[AsyncMessage] Impossible de décrypter:", err);
        if (mounted) setText("Impossible de décrypter");
      }
    }

    decrypt();
    return () => { mounted = false; };
  }, [m, chatKey]);

  return (
    <div style={{ marginBottom: 8, textAlign: m.auteur === chat.id_auteur ? "right" : "left" }}>
      <span style={{ background: "#000", padding: "4px 8px", borderRadius: 8, display: "inline-block" }}>
        {text}
      </span>
    </div>
  );
}
