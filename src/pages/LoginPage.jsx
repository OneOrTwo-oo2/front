import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

    try {
      const res = await fetch("http://localhost:8000/api/auth/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
        credentials: "include", // ✅ 쿠키 기반 인증을 위해 반드시 필요
      });

      const data = await res.json();

      // ✅ 새로운 유저인지 확인하는 콘솔로그
      // console.log("📦 로그인 응답 데이터:", data);

      if (!res.ok) {
        throw new Error(data.detail || "로그인 실패");
      }

      // ✅ 토큰은 쿠키에 저장되므로 localStorage나 디코딩 필요 없음

      // ✅ 로그인 후 라우팅
      if (data.isNewUser) {
        navigate("/preference");
      } else {
        navigate("/main");
      }
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
