"use client";
import RegisterMenu from "@/components/RegisterMenu";
import {redirect} from "next/navigation";
import "./register.css";
import Header from "@/components/Header";

export default function Register() {
    return (
        <div className={"div-container"}>
            <Header/>
            <div className={"register-container"}>
                <RegisterMenu onSuccess={() => redirect("/")} endpoint={"/api/login"}></RegisterMenu>
            </div>
        </div>
    )
}