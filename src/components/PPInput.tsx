import React, { useRef } from "react";

type Props = {
    imageUrl: string;
    onChange: (file: File) => void;
    size?: number;
};

export default function PPInput({ imageUrl, onChange, size = 120 }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleClick() {
        fileInputRef.current?.click();
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) onChange(file);
    }

    return (
        <div
            onClick={handleClick}
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                overflow: "hidden",
                cursor: "pointer",
                position: "relative",
                background: "#FFFFFF",
            }}
        >
            <img
                src={imageUrl}
                alt="Profil"
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                }}
            />
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileChange}
            />
        </div>
    );
}
