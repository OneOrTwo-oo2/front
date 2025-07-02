import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './RecipeDetailPage.css';

function RecipeDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { link } = location.state || {};

  const [summary, setSummary] = useState('');
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get("http://localhost:8000/recipe-detail", {
          params: { link }
        });
        setSummary(res.data.summary);
        setSteps(res.data.steps);
      } catch (err) {
        console.error("❌ 상세 정보 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    if (link) fetchDetail();
  }, [link]);

  if (!link) return <p>링크 정보가 없습니다.</p>;
  if (loading) return <p>로딩 중...</p>;

  return (
    <div className="detail-container">
      <button onClick={() => navigate(-1)}>← 뒤로가기</button>
      <h2>📋 요약</h2>
      <p className="summary">{summary}</p>

      <h2>🍳 조리순서</h2>
      <ol className="steps">
        {steps.map((s, i) => (
          <li key={i}>
            {s.img && <img src={s.img} alt={`step ${i + 1}`} />}
            <p>{s.desc}</p>
          </li>
        ))}
      </ol>

      <a href={link} target="_blank" rel="noopener noreferrer">🔗 원본 레시피 보기</a>
    </div>
  );
}

export default RecipeDetailPage;