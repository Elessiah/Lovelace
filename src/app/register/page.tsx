"use client";
import RegisterMenu from "@/components/RegisterMenu";
import "./register.css";
import Header from "@/components/Header";

export default function Register() {
    return (
        <div className={"div-container"}>
            <Header/>
            <div className={"register-container"}>
                <RegisterMenu targetOnSuccess={"/"} endpoint={"/api/register"}></RegisterMenu>
            </div>
        </div>
    )
}