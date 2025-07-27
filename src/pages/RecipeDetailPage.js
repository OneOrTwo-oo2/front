import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient'; // ✅ axios 인스턴스
import './RecipeDetailPage.css';
import { fetchWithAutoRefresh } from '../utils/fetchWithAuth';

function RecipeDetailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { link, isWatson } = location.state || {};
  console.log("📥 location.state:", location.state);

  const [summary, setSummary] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);
  const [video, setVideo] = useState('');
  const [totalTime, setTotalTime] = useState('');
  const [yieldInfo, setYieldInfo] = useState('');
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [recommendationReason, setRecommendationReason] = useState(location.state?.recommendation_reason || '');
  const [dietaryTips, setDietaryTips] = useState(location.state?.dietary_tips || '');

  const mainIngredients = ingredients.slice(0, 6);
  const seasoningIngredients = ingredients.slice(6);

  useEffect(() => {
    if (!recommendationReason || !dietaryTips) {
      const metaMap = JSON.parse(localStorage.getItem("watsonMetaMap") || "{}");
      const matched = metaMap && Object.values(metaMap).find((r) => r.link === link);
      if (matched) {
        setRecommendationReason(matched.recommendation_reason);
        setDietaryTips(matched.dietary_tips);
      }
    }
  }, [link]);

  useEffect(() => {
    if (!isWatson && !link) return;
    if (!link) {
      setLoading(false);
      return;
    }
    const fetchDetail = async () => {
      try {
        const res = await apiClient.get("/recipe-detail", {
          params: { link }
        });
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

  const checkBookmark = async () => {
    if (!summary) return;
    try {
      const res = await fetchWithAutoRefresh('/bookmarks', { method: 'GET' });
      const data = await res.data;
      const found = data.find(r => (
        (r.title && (r.title === summary.title || r.title === summary.text)) ||
        (r.link && r.link === link)
      ));
      setIsBookmarked(!!found);
    } catch (err) {
      setIsBookmarked(false);
    }
  };

  useEffect(() => {
    checkBookmark();
  }, [summary]);

  const handleBookmark = async () => {
  if (isBookmarked || bookmarkLoading) return;
  setBookmarkLoading(true);
  try {
    const bookmarkData = {
      title: summary?.title || summary?.text || '',
      image: summary?.image || '',
      summary: isWatson ? '' : (summary?.text || ''),  // ✅ 수정
      link: link || '',
      is_ai_generated: Boolean(isWatson),
      recommendation_reason: recommendationReason || '',
      dietary_tips: dietaryTips || ''
    };
    await fetchWithAutoRefresh('/bookmark-with-recipe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookmarkData),
    });
    setIsBookmarked(true);
    checkBookmark();
  } catch (err) {
    alert('북마크 저장에 실패했습니다.');
  } finally {
    setBookmarkLoading(false);
  }
};

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!link && !isWatson) return <p>링크 정보가 없습니다.</p>;
  if (loading) return <p>로딩 중...</p>;

  return (
    <div className="detail-container">
      <button className="back-button" onClick={() => navigate(-1)}>← 뒤로가기</button>

      <div className="sticky-bookmark-btn">
        <button className="bookmark-btn" onClick={handleBookmark} disabled={isBookmarked || bookmarkLoading}>
          {isBookmarked ? (
            <><span className="icon" style={{ color: '#2dbd5a' }}>✅</span><span style={{ color: '#2dbd5a' }}>저장됨</span></>
          ) : (
            <><span className="icon">🔖</span>북마크</>
          )}
        </button>
      </div>

      {isWatson && recommendationReason && (
        <div className="ai-recommendation">
          <h3>🤖 추천 이유</h3>
          <p>{recommendationReason}</p>
        </div>
      )}

      {isWatson && dietaryTips && (
        <div className="ai-tips">
          <h3>💡 식이요법 팁</h3>
          <p>{dietaryTips}</p>
        </div>
      )}

      {summary && (
        <>
          <h2>📋 요약</h2>
          <div className="summary-box">
            {summary.text && <p className="summary-text">{summary.text}</p>}
            <div className="meta-info">
              {summary.serving && <span> 👥 : {summary.serving}</span>}
              {summary.time && <span>  ⏱️ 소요 시간 : {summary.time}</span>}
              {summary.difficulty && <span>  🔥 난이도 : {summary.difficulty}</span>}
            </div>
          </div>
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
          <div className="ingredient-section">
            <div className="ingredient-column">
              <h4>🧺 주재료</h4>
              <ul>
                {mainIngredients.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
            <div className="ingredient-column">
              <h4>🧂 양념/조미료</h4>
              <ul>
                {seasoningIngredients.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </div>
          </div>
        </>
      )}

      <h2>🔍 조리순서</h2>
      <div className="steps">
        {steps.map((s, i) => (
          <div key={i} className="step-card">
            {s.img && <img src={s.img} alt={`step ${i + 1}`} />}
            <div className="step-desc">
              <strong>{i + 1}. </strong>{s.desc}
            </div>
          </div>
        ))}
      </div>

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
      <span style={{ fontSize: '7pt', color: '#888', marginLeft: 6 }}>(출처 : 만개의 레시피 )</span>

      <div style={{ display: 'flex', justifyContent: 'center', margin: '32px 0' }}>
        <button className="back-button" onClick={handleScrollTop}>↑ 맨 위로</button>
      </div>
    </div>
  );
}

export default RecipeDetailPage;
