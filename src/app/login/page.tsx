"use client";

import Header from "@/components/Header";
import LoginMenu from "@/components/LoginMenu";
import "./login.css";

export default function Register() {
  return (
      <div className={"div-container"}>
        <Header />
        <div className={"login-container"}>
          <LoginMenu targetOnSuccess={"/"} endpoint={"/api/login"} />
        </div>
      </div>
  )
}