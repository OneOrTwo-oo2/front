import React, { useEffect, useState } from 'react';
import qs from 'qs';
import './RecipeListPage.css'; // 동일한 스타일 재사용
import apiClient from '../api/apiClient'; // ✅ axios 인스턴스

function RandomRecipePage() {
  const [theme, setTheme] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRecipes = async (themeCode) => {
    setLoading(true);
    try {
      const res = await apiClient.get('/recipes', {
        params: { theme: themeCode },
        paramsSerializer: params => qs.stringify(params),
      });
      setResults(res.data.results);
    } catch (err) {
      console.error('❌ 테마별 레시피 에러:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleThemeClick = (themeCode) => {
    setTheme(themeCode);
    fetchRecipes(themeCode);
    window.history.pushState(null, '', `/theme?theme=${themeCode}`);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('theme');
    if (t) {
      setTheme(t);
      fetchRecipes(t);
    }
  }, []);

  return (
    <div className="recipe-list-page">
      <h2>💡테마별 추천</h2>

      <div className="theme-buttons">
        <button onClick={() => handleThemeClick('101012001')}>저칼로리</button>
        <button onClick={() => handleThemeClick('101012003')}>디톡스</button>
        <button onClick={() => handleThemeClick('101012004')}>변비</button>
        <button onClick={() => handleThemeClick('101012005')}>피부미용</button>
        <button onClick={() => handleThemeClick('101012006')}>두피-모발</button>
        <button onClick={() => handleThemeClick('101012007')}>빈혈예방</button>
        <button onClick={() => handleThemeClick('101012008')}>골다공증</button>
        <button onClick={() => handleThemeClick('101012009')}>갱년기건강</button>
        <button onClick={() => handleThemeClick('101012010')}>생리불순</button>
        <button onClick={() => handleThemeClick('101013001')}>임신준비</button>
        <button onClick={() => handleThemeClick('101013002')}>입덧</button>
        <button onClick={() => handleThemeClick('101013003')}>태교음식</button>
        <button onClick={() => handleThemeClick('101013004')}>수유</button>
        <button onClick={() => handleThemeClick('101013002')}>산후조리</button>
        <button onClick={() => handleThemeClick('101013006')}>아이성장발달</button>
        <button onClick={() => handleThemeClick('101013007')}>아이두뇌발달</button>
        <button onClick={() => handleThemeClick('101013008')}>아이장튼튼</button>
        <button onClick={() => handleThemeClick('101013009')}>아이간식</button>
        <button onClick={() => handleThemeClick('101013010')}>이유식 초기</button>
        <button onClick={() => handleThemeClick('101013011')}>이유식 중기</button>
        <button onClick={() => handleThemeClick('101013012')}>이유식 후기</button>
        <button onClick={() => handleThemeClick('101013013')}>이유식 완료기</button>
        <button onClick={() => handleThemeClick('101014001')}>위 건강</button>
        <button onClick={() => handleThemeClick('101014002')}>장 건강</button>
        <button onClick={() => handleThemeClick('101014003')}>스트레스 해소</button>
        <button onClick={() => handleThemeClick('101014004')}>피로회복</button>
        <button onClick={() => handleThemeClick('101014005')}>혈액순환</button>
        <button onClick={() => handleThemeClick('101014006')}>호흡기 건강</button>
        <button onClick={() => handleThemeClick('101014007')}>혈당조절</button>
        <button onClick={() => handleThemeClick('101014008')}>노화방지</button>
        <button onClick={() => handleThemeClick('101014009')}>암 예방</button>
        <button onClick={() => handleThemeClick('101014010')}>간 건강</button>
        <button onClick={() => handleThemeClick('101014011')}>치매 예방</button>
        <button onClick={() => handleThemeClick('101010001')}>봄</button>
        <button onClick={() => handleThemeClick('101010002')}>여름</button>
        <button onClick={() => handleThemeClick('101010003')}>가을</button>
        <button onClick={() => handleThemeClick('101010004')}>겨울</button>
        {/* 필요한 만큼 추가 */}
      </div>

      {loading && <p>로딩 중...</p>}
      {!loading && results.length > 0 && (
        <p className="result-count">🔎 총 {results.length}개의 레시피가 검색되었습니다.</p>
      )}

      <div className="recipe-grid">
        {results.map((r, i) => (
          <div key={i} className="recipe-card">
            <img src={r.image} alt={r.title} />
            <h3>{r.title}</h3>
            <a href={r.link} target="_blank" rel="noopener noreferrer">레시피 보기</a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RandomRecipePage;