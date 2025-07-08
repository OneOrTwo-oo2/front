// src/pages/HelpPage.jsx
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './HelpPage.css'; // 선택사항

function HelpPage() {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('/help.md')
      .then(res => res.text())
      .then(setContent)
      .catch(err => {
        console.error("❌ 도움말 불러오기 실패:", err);
        setContent("도움말 내용을 불러올 수 없습니다.");
      });
  }, []);

  return (
    <div className="help-page">
      <h1>📘 도움말</h1>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}

export default HelpPage;
