import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import apiClient from "../api/apiClient"; // ✅ axios 기반 API 클라이언트
import "./LoginPage.css";
import googleLogo from "../assets/google.png";

function LoginPage() {
  const navigate = useNavigate();
  const { fetchAuthUser } = useAuth();

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
      // ✅ 1. 기존 쿠키 제거
      await apiClient.post("/api/auth/clear-cookie");

      // ✅ 2. 구글 로그인
      const res = await apiClient.post(
        "/api/auth/google-login",
        { credential },
        { withCredentials: true } // axios에서도 명시적으로 설정
      );
      const data = res.data;

      // ✅ 3. 사용자 상태 갱신
      await fetchAuthUser();

      // ✅ 4. 이동
      setTimeout(() => {
        if (data.isNewUser) {
          navigate("/preference");
        } else {
          navigate("/main");
        }
      }, 600);

    } catch (err) {
      console.error("❌ 로그인 실패:", err.response?.data?.detail || err.message);
      alert("로그인에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="login-container">
      <img src={googleLogo} alt="로고" className="logo" />
      <h2>Google 간편 로그인</h2>
      <div id="google-login-btn"></div>
    </div>
  );
}

export default LoginPage;
