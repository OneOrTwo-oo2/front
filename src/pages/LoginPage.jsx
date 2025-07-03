import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import jwt_decode from "jwt-decode";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();

  useEffect(() => {
    /* global google */
    google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
    });

    google.accounts.id.renderButton(
      document.getElementById("google-login-btn"),
      { theme: "outline", size: "large" }
    );
  }, []);

  const handleCredentialResponse = async (response) => {
    const credential = response.credential;

    const res = await fetch("http://localhost:8000/api/auth/google-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });

    const data = await res.json();

    localStorage.setItem("token", data.token); // 필요 시 저장

    if (data.isNewUser) {
      navigate("/preference");
    } else {
      navigate("/main");
    }
  };

  return (
    <div className="login-container">
      <img src="/logo.png" alt="로고" className="logo" />
      <h2>Google 간편 로그인</h2>
      <div id="google-login-btn"></div>
    </div>
  );
}

export default LoginPage;
