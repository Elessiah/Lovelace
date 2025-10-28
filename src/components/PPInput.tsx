import React, {useRef, useState} from "react";
import "./Menu.css";
import resizeImage from "@/lib/resizeImage";

type Props = {
    imageUrl: string;
    endpoint: string;
    size?: number;
};

export default function PPInput({ imageUrl, endpoint, size = 120 }: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [pictureUrl, setPictureUrl] = useState<string>(imageUrl);
    console.log(pictureUrl);

    function handleClick() {
        fileInputRef.current?.click();
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        let imageBase64 = null;
        if (file) {
            imageBase64 = await resizeImage(file, 256);
        }

        const res = await fetch(endpoint + "/profile_picture", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ picture: imageBase64 }),
        });

        const body: {success: boolean, message: string, newPath: string} = await res.json();

        if (!res.ok) {
            console.log(body.message);
        } else {
            setPictureUrl(`${body.newPath}?t=${Date.now()}`);
            console.log(`Updating URL : ${pictureUrl}`);
        }
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
                        src={pictureUrl}
                        className="profilePictureEdit"
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
