"use client";
import {redirect} from "next/navigation";
import "./login.css";
import Header from "@/components/Header";
import LoginMenu from "@/components/LoginMenu";

export default function Login() {
    return (
        <div className={"div-container"}>
            <Header/>
            <div className={"login-container"}>
                <LoginMenu onSuccess={() => redirect("/")} endpoint={"/api/login"}/>
            </div>
        </div>
    )
}