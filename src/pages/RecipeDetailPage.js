import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient'; // ✅ axios 인스턴스
import './RecipeDetailPage.css';

function RecipeDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { link, recommendation_reason, dietary_tips, isWatson  } = location.state || {};

  const [summary, setSummary] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);
  const [video, setVideo] = useState('');
  const [totalTime, setTotalTime] = useState('');
  const [yieldInfo, setYieldInfo] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      if (!isWatson && !link) return; // 일반 레시피인데 link 없으면 실패 처리
      if (!link) {
        setLoading(false);  // Watson 레시피는 link 없이도 보여야 하니까 로딩 false
        return;
      }
      const fetchDetail = async () => {
        try {
          const res = await apiClient.get("/recipe-detail", {
            params: { link }
          });
          console.log("✅ 받아온 데이터:", res.data);
          setSummary(res.data.summary);
          setIngredients(res.data.ingredients || []);
          setSteps(res.data.steps || []);
          setVideo(res.data.video || '');
          setTotalTime(res.data.total_time || '');
          setYieldInfo(res.data.yield_info || '');
        } catch (err) {
          console.error("❌ 상세 정보 불러오기 실패:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchDetail();
    }, [link, isWatson]);


  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await apiClient.get("/recipe-detail", {
          params: { link }
        });
        console.log("✅ 받아온 데이터:", res.data);
        setSummary(res.data.summary);
        setIngredients(res.data.ingredients || []);
        setSteps(res.data.steps || []);
        setVideo(res.data.video || '');
        setTotalTime(res.data.total_time || '');
        setYieldInfo(res.data.yield_info || '');
      } catch (err) {
        console.error("❌ 상세 정보 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    if (link) fetchDetail();
  }, [link]);

  if (!link && !isWatson) return <p>링크 정보가 없습니다.</p>;
  if (loading) return <p>로딩 중...</p>;

  return (
    <div className="detail-container">
      <button onClick={() => navigate(-1)}>← 뒤로가기</button>
              {isWatson && recommendation_reason && (
      <div className="ai-recommendation">
        <h3>🤖 추천 이유</h3>
        <p>{recommendation_reason}</p>
      </div>
    )}

    {isWatson && dietary_tips && (
      <div className="ai-tips">
        <h3>💡 식이요법 팁</h3>
        <p>{dietary_tips}</p>
      </div>
    )}
    {summary && (
      <>
        <h2>📋 요약</h2>
        <p className="summary">{summary}</p>
      </>
    )}
      {(yieldInfo || totalTime) && (
        <div className="meta-info">
          {yieldInfo && <p>👥 인분 수: {yieldInfo}</p>}
          {totalTime && <p>⏱️ 조리 시간: {totalTime.replace('PT', '').replace('M', '분')}</p>}
        </div>
      )}

      {ingredients.length > 0 && (
        <>
          <h2>🧂 재료</h2>
          <ul className="ingredients">
            {ingredients.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </>
      )}

      <h2>🍳 조리순서</h2>
      <ol className="steps">
        {steps.map((s, i) => (
          <li key={i}>
            {s.img && <img src={s.img} alt={`step ${i + 1}`} />}
            <p>{s.desc}</p>
          </li>
        ))}
      </ol>

      {video && (
        <>
          <h2>🎥 동영상</h2>
          <div className="video-container">
            <iframe
              src={video}
              title="요리 동영상"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </>
      )}

      <a href={link} target="_blank" rel="noopener noreferrer">🔗 원본 레시피 보기</a>
    </div>
  );
}

export default RecipeDetailPage;
