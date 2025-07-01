import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const googleToken = '예시_구글_토큰'; // 👈 실제로는 Google 로그인 완료 후 받은 credential/token 넣어야 함

      const res = await fetch('/api/auth/google-login', {
        method: 'POST',
        body: JSON.stringify({ credential: googleToken }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      localStorage.setItem('token', data.token);

      if (data.isNewUser) {
        navigate('/preference'); // 회원가입 후
      } else {
        navigate('/home'); // 기존 유저는 홈으로
      }
    } catch (err) {
      console.error('Google 로그인 오류:', err);
    }
  };

  return (
    <div className="login-container">
      <img src="/logo.png" alt="로고" className="logo" />
      <h2>Google 간편 로그인</h2>
      <button className="google-login-btn" onClick={handleGoogleLogin}>
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google"
          className="google-icon"
        />
        Google 계정으로 로그인
      </button>
    </div>
  );
}

export default LoginPage;
