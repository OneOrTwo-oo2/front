import './LoginPage.css';

function LoginPage() {
  return (
    <div className="login-container">
      <img src="/logo.png" alt="로고" className="logo" />
      <h2>Google 간편 로그인</h2>
      <a href="http://localhost:5000/auth/google" className="google-login-btn">
        <img
          src="https://developers.google.com/identity/images/g-logo.png"
          alt="Google"
          className="google-icon"
        />
        Google 계정으로 로그인
      </a>
    </div>
  );
}

export default LoginPage;
