import React from "react";
import "./Menu.css";

type Props =  {
    isVisible: boolean;
    onClose: () => void;
    children?: React.ReactNode;
}

export default function Modal({isVisible, onClose, children}: Props) {
    if (!isVisible)
        return (<></>)
    return (
        <div className={"modal-overlay"} onClick={onClose}>
            {children}
        </div>
    )
}