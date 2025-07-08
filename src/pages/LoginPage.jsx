import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext"; // ✅ 인증 훅
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const { fetchAuthUser } = useAuth(); // ✅ 인증 상태 갱신용

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

    try {
      // ✅ 1. 기존 사용자 쿠키 제거
      await fetch("http://localhost:8000/api/auth/clear-cookie", {
        method: "POST",
        credentials: "include",
      });

      // ✅ 2. 새 로그인 요청
      const res = await fetch("http://localhost:8000/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
        credentials: "include", // ✅ 쿠키 저장 필수
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "로그인 실패");
      }

      // ✅ 3. 현재 사용자 인증 갱신
      await fetchAuthUser();

      // ✅ 4. 페이지 이동
      setTimeout(() => {
        if (data.isNewUser) {
          navigate("/preference");
        } else {
          navigate("/main");
        }
      }, 600); 

    } catch (err) {
      console.error("❌ 로그인 실패:", err.message);
      alert("로그인에 실패했습니다. 다시 시도해주세요.");
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
