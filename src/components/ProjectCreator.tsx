import React, {useRef, useState} from "react";
import Modal from "@/components/Modal";
import InputCustom from "@/components/InputCustom";

type Props = {
    endpoint: string;
}

export default function ProjectCreator({ endpoint }: Props) {
    const [isMenuOpen, setMenuOpen] = useState(false);
    const Title = useRef<string>("");
    const description = useRef<string>("");

    async function handleSubmit(ev: React.FormEvent)
    {
        ev.preventDefault();

    }

   return (
       <div>
            <button onClick={() => {setMenuOpen(!isMenuOpen)}} className={"submit-button"}>Ajouter un projet</button>
           <Modal isVisible={isMenuOpen} onClose={() => setMenuOpen(!isMenuOpen)}>
               <form onSubmit={handleSubmit}>
                <InputCustom
                    componentName={"project-title"}
                    displayName={"Titre du projet"}
                    currentValue={""}
                    endpoint={""}
                    placeholder={"Titre du projet"}
                />
               </form>
           </Modal>
       </div>
   )
}