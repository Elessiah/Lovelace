"use client";

import Header from "@/components/Header";
import LoginMenu from "@/components/LoginMenu";
import "./login.css";

export default function Login() {
  return (
      <div className={"div-container"}>
        <div className={"login-container"}>
          <LoginMenu endpoint={"/api/login"} />
        </div>
      </div>
  )
}