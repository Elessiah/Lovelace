import React, { useRef } from "react";
import "./Menu.css";

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
        <>
            <label htmlFor="ppinput" className={"input-font"}>Photo de profil</label>
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
                {imageUrl.length &&
                    <img
                        src={imageUrl}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                        }}
                    />
                }
                <input
                    id="ppinput"
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                />
            </div>
        </>
    );
}
