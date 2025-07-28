import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import apiClient from "../api/apiClient";
import "./LoginPage.css";
import googleLogo from "../assets/google.png";

function LoginPage() {
  const navigate = useNavigate();
  const { fetchAuthUser } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // ✅ 구글 로그인 스크립트 로드 및 버튼 렌더
  useEffect(() => {
    const loadGoogleScript = () => {
      return new Promise((resolve, reject) => {
        if (window.google && window.google.accounts) {
          resolve();
          return;
        }

        const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (existingScript) {
          existingScript.addEventListener('load', resolve);
          existingScript.addEventListener('error', reject);
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    loadGoogleScript()
      .then(() => {
        if (!window.google || !window.google.accounts) {
          throw new Error("Google API not available");
        }

        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        window.google.accounts.id.renderButton(
          document.getElementById("google-login-btn"),
          {
            theme: "outline",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            width: 280,
          }
        );
      })
      .catch((err) => {
        console.error("Google Login Script 로딩 실패:", err);
      });
  }, []);

  const handleCredentialResponse = async (response) => {
    const credential = response.credential;
    setIsLoading(true);

    try {
      await apiClient.post("/auth/clear-cookie");
      const res = await apiClient.post(
        "/auth/google-login",
        { credential },
        { withCredentials: true }
      );
      const data = res.data;
      await fetchAuthUser();

      setTimeout(() => {
        if (data.isNewUser) {
          navigate("/preference");
        } else {
          navigate("/main");
        }
      }, 600);

    } catch (err) {
      console.error("❌ 구글 로그인 실패:", err.response?.data?.detail || err.message);
      alert("구글 로그인에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'email') {
      setEmailChecked(false);
      setEmailAvailable(false);
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const checkEmailDuplicate = async () => {
    if (!formData.email) {
      alert("이메일을 먼저 입력해주세요.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      alert("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    setIsCheckingEmail(true);
    try {
      const res = await apiClient.post("/auth/check-email", {
        email: formData.email
      });

      const { available, message } = res.data;
      setEmailAvailable(available);
      setEmailChecked(true);
      alert(message);
    } catch (err) {
      console.error("중복확인 실패:", err);

      if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        const shouldContinue = window.confirm(
          "서버에 연결할 수 없습니다. 백엔드 서버가 실행되지 않았을 수 있습니다.\n\n" +
          "임시로 중복확인을 건너뛰고 계속하시겠습니까?"
        );

        if (shouldContinue) {
          setEmailAvailable(true);
          setEmailChecked(true);
          alert("임시로 사용 가능한 이메일로 설정했습니다. 실제 서버에서는 중복확인이 필요합니다.");
        }
      } else if (err.response?.status === 404) {
        alert("중복확인 API를 찾을 수 없습니다. 서버를 확인해주세요.");
      } else if (err.response?.status === 500) {
        alert("서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      } else {
        alert("중복확인 중 오류가 발생했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식을 입력해주세요.";
    }

    if (!isLogin) {
      if (!emailChecked) {
        newErrors.email = "이메일 중복확인을 해주세요.";
      } else if (!emailAvailable) {
        newErrors.email = "이미 가입된 이메일입니다.";
      }
    }

    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요.";
    } else if (formData.password.length < 6) {
      newErrors.password = "비밀번호는 6자 이상이어야 합니다.";
    }

    if (!isLogin) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "비밀번호 확인을 입력해주세요.";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
      }

      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = "개인정보 수집 및 이용에 동의해주세요.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      if (isLogin) {
        await apiClient.post("/auth/login", {
          email: formData.email,
          password: formData.password
        }, { withCredentials: true });

        await fetchAuthUser();
        navigate("/main");
      } else {
        await apiClient.post("/auth/signup", {
          email: formData.email,
          password: formData.password
        }, { withCredentials: true });

        await fetchAuthUser();
        navigate("/preference");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail ||
        (isLogin ? "로그인에 실패했습니다." : "회원가입에 실패했습니다.");
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false
    });
    setErrors({});
    setEmailChecked(false);
    setEmailAvailable(false);
  };

  const openPrivacyModal = (e) => {
    e.preventDefault();
    setShowPrivacyModal(true);
  };

  const closePrivacyModal = () => {
    setShowPrivacyModal(false);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1 className="app-title">Recipe Go</h1>
          <p className="app-subtitle">맛있는 레시피를 찾아보세요</p>
        </div>

        <div className="login-form-container">
          <div className="form-header">
            <h2>{isLogin ? "로그인" : "회원가입"}</h2>
            <p>{isLogin ? "계정에 로그인하세요" : "새로운 계정을 만드세요"}</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">이메일</label>
              <div className="email-input-group">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="example@email.com"
                  className={errors.email ? "error" : ""}
                />
                {!isLogin && (
                  <button
                    type="button"
                    onClick={checkEmailDuplicate}
                    disabled={isCheckingEmail || !formData.email}
                    className="check-email-btn"
                  >
                    {isCheckingEmail ? "확인 중..." : "중복확인"}
                  </button>
                )}
              </div>
              {emailChecked && (
                <span className={`email-status ${emailAvailable ? 'available' : 'unavailable'}`}>
                  {emailAvailable ? "✓ 사용 가능한 이메일입니다." : "✗ 이미 가입된 이메일입니다."}
                </span>
              )}
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">비밀번호</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="비밀번호를 입력하세요"
                className={errors.password ? "error" : ""}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">비밀번호 확인</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="비밀번호를 다시 입력하세요"
                  className={errors.confirmPassword ? "error" : ""}
                />
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>
            )}

            {!isLogin && (
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  <span className="checkbox-text">
                    <a href="#" onClick={openPrivacyModal}>개인정보 수집 및 이용</a>에 동의합니다.
                  </span>
                </label>
                {errors.agreeToTerms && <span className="error-message">{errors.agreeToTerms}</span>}
              </div>
            )}

            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? "처리 중..." : (isLogin ? "로그인" : "회원가입")}
            </button>
          </form>

          <div className="divider">
            <span>또는</span>
          </div>

          <div className="google-login-section">
            <div id="google-login-btn"></div>
          </div>

          <div className="toggle-mode">
            <p>
              {isLogin ? "계정이 없으신가요?" : "이미 계정이 있으신가요?"}
              <button type="button" onClick={toggleMode} className="toggle-btn">
                {isLogin ? "회원가입" : "로그인"}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* 개인정보 수집 및 이용 모달 */}
      {showPrivacyModal && (
        <div className="modal-overlay" onClick={closePrivacyModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>개인정보 수집 및 이용 동의</h3>
            </div>
            <div className="modal-body">
              <div className="privacy-content">
                <h4>수집 이용 목적</h4>
                <p>맞춤형 레시피 추천 및 건강관리 서비스 제공</p>
                
                <h4>수집 항목</h4>
                <p>이메일 주소, 비밀번호, 질병 정보, 알러지 정보 등 건강 관련 민감정보</p>
                
                <h4>보유 및 이용기간</h4>
                <p>회원 탈퇴 또는 동의 철회 시까지</p>
                
                <h4>동의 거부 권리 및 불이익</h4>
                <p>동의를 거부할 수 있으나, 맞춤형 추천 등 일부 서비스 이용이 제한될 수 있습니다.</p>
                
                <h4>동의</h4>
                <p>본인은 위의 개인정보 수집 및 이용에 동의합니다.</p>
                
                <p className="privacy-note">
                  (예시: 네이버, 카카오 등 주요 서비스의 개인정보 수집 및 이용 동의서 참고)
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-close-btn" onClick={closePrivacyModal}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;
