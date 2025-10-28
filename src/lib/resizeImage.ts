export default async function resizeImage(file: File, maxSize = 128): Promise<string> {
    return new Promise((resolve) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = e => {
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
                const width = img.width * scale;
                const height = img.height * scale;
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                ctx!.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL("image/jpeg", 0.9)); // 0.9 = qualité
            };
            img.src = e.target!.result as string;
        };
        reader.readAsDataURL(file);
    });
}
