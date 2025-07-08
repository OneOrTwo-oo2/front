import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PrivacyPage.css';

function PrivacyPage() {
  const [privacyText, setPrivacyText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/privacy.md')
      .then(res => res.text())
      .then(setPrivacyText)
      .catch(err => {
        console.error("🔴 privacy.md 불러오기 실패:", err);
        setPrivacyText("민감정보 수집에 대한 설명을 불러올 수 없습니다.");
      });
  }, []);

  return (
    <div className="privacy-page">
      <h2>민감정보 수집 동의서</h2>
      <pre className="markdown-text">{privacyText}</pre>
      <button onClick={() => navigate(-1)}>뒤로가기</button>
    </div>
  );
}

export default PrivacyPage;
