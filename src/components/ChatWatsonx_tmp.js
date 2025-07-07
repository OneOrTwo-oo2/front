import React, { useState } from 'react';
import './ChatWatsonx_tmp.css';

const INGREDIENT_LIST = [
  "김치", "삼겹살", "양파", "달걀", "두부", "마늘", "된장", "고추장"
];

function ChatBox() {
  const [ingredients, setIngredients] = useState([]);
  const [parsed, setParsed] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleIngredient = (item) => {
    setIngredients(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await fetch("/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: ingredients.join(', ') })
      });

      if (!res.ok) throw new Error("서버 응답 오류");

      const data = await res.json();
      const resultData = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
      const text = resultData?.results?.[0]?.generated_text ?? '';
      const parsedResult = parseRecipeResult(text);
      setParsed(parsedResult);
    } catch (err) {
      console.error("에러 발생:", err);
      setParsed({ error: "요청 실패. 서버 상태를 확인해주세요." });
    } finally {
      setLoading(false);
    }
  };

  const parseRecipeResult = (text) => {
    const section = (title) => {
      const match = text.match(new RegExp(`\\[${title}\\][\\s\\n]*(.*?)\\n(?=\\[|$)`, "s"));
      return match ? match[1].trim() : '';
    };

    const youtubeList = [...text.matchAll(/\"(.*?)\".*?\((.*?)조회(?:수)?\)/g)].map(match => ({
      title: match[1],
      views: match[2]
    }));

    return {
      title: section('레시피 제목'),
      intro: section('요리 소개'),
      ingredients: section('재료'),
      time: section('조리 시간'),
      level: section('난이도'),
      servings: section('분량'),
      steps: section('조리 순서'),
      tip: section('요리 팁'),
      hashtags: section('해시태그'),
      youtube: youtubeList
    };
  };

  return (
    <div className="chatbox">
      <h1>🥕 식재료 기반 요리 추천</h1>

      <div className="ingredient-buttons">
        {INGREDIENT_LIST.map((item, i) => (
          <button
            key={i}
            className={`ingredient-btn ${ingredients.includes(item) ? 'selected' : ''}`}
            onClick={() => toggleIngredient(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <p className="selected-list">선택한 재료: {ingredients.join(', ') || '없음'}</p>

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "로딩 중..." : "레시피 추천받기"}
      </button>

      {parsed && !parsed.error && (
        <div className="recipe">
          <h2>{parsed.title}</h2>
          <p><strong>요리 소개:</strong> {parsed.intro}</p>
          <p><strong>재료:</strong><br />{parsed.ingredients}</p>
          <p><strong>⏱ 조리 시간:</strong> {parsed.time}</p>
          <p><strong>난이도:</strong> {parsed.level}</p>
          <p><strong>분량:</strong> {parsed.servings}</p>
          <p><strong>조리 순서:</strong><br />{parsed.steps}</p>
          <p><strong>요리 팁:</strong> {parsed.tip}</p>
          <p><strong>해시태그:</strong> {parsed.hashtags}</p>

          <h3>📺 유튜브 추천 영상</h3>
          {parsed.youtube.map((vid, idx) => (
            <div key={idx}>
              <p>{idx + 1}. {vid.title} ({vid.views} 조회수)</p>
              <iframe
                width="100%"
                height="315"
                src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(vid.title)}`}
                title={`YouTube video ${idx}`}
                frameBorder="0"
                allowFullScreen
              ></iframe>
            </div>
          ))}
        </div>
      )}

      {parsed?.error && <p className="error">{parsed.error}</p>}
    </div>
  );
}

export default ChatBox;
