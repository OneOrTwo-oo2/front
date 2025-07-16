import React, { useEffect, useState } from 'react';
import qs from 'qs';
import './RecipeListPage.css'; // 동일한 스타일 재사용
import apiClient from '../api/apiClient'; // ✅ axios 인스턴스
import { fetchWithAutoRefresh } from '../utils/fetchWithAuth';
import { useNavigate , useLocation } from 'react-router-dom';

function RandomRecipePage() {
  const [theme, setTheme] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookmarkedState, setBookmarkedState] = useState(new Map());
  const [ingredients, setIngredients] = useState('');
  const [kind, setKind] = useState('');
  const [situation, setSituation] = useState('');
  const [method, setMethod] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
      const params = new URLSearchParams(location.search);
      const t = params.get('theme');
      if (t) {
        setTheme(t);
        setSelectedTheme(t);
        fetchRecipes(t);
      }
  }, [location.search]);

  const themes = [
  { label: "저칼로리", code: "101012001" },
  { label: "디톡스", code: "101012003" },
  { label: "변비", code: "101012004" },
  { label: "피부미용", code: "101012005" },
  { label: "두피-모발", code: "101012006" },
  { label: "빈혈예방", code: "101012007" },
  { label: "골다공증", code: "101012008" },
  { label: "갱년기건강", code: "101012009" },
  { label: "생리불순", code: "101012010" },
  { label: "임신준비", code: "101013001" },
  { label: "입덧", code: "101013002" },
  { label: "태교음식", code: "101013003" },
  { label: "수유", code: "101013004" },
  { label: "산후조리", code: "101013002" },
  { label: "아이성장발달", code: "101013006" },
  { label: "아이두뇌발달", code: "101013007" },
  { label: "아이장튼튼", code: "101013008" },
  { label: "아이간식", code: "101013009" },
  { label: "이유식 초기", code: "101013010" },
  { label: "이유식 중기", code: "101013011" },
  { label: "이유식 후기", code: "101013012" },
  { label: "이유식 완료기", code: "101013013" },
  { label: "위 건강", code: "101014001" },
  { label: "장 건강", code: "101014002" },
  { label: "스트레스 해소", code: "101014003" },
  { label: "피로회복", code: "101014004" },
  { label: "혈액순환", code: "101014005" },
  { label: "호흡기 건강", code: "101014006" },
  { label: "혈당조절", code: "101014007" },
  { label: "노화방지", code: "101014008" },
  { label: "암 예방", code: "101014009" },
  { label: "간 건강", code: "101014010" },
  { label: "치매 예방", code: "101014011" },
  { label: "봄", code: "101010001" },
  { label: "여름", code: "101010002" },
  { label: "가을", code: "101010003" },
  { label: "겨울", code: "101010004" },
  ];

  const handleCardClick = (recipe) => {
      navigate("/recipes/detail", {
        state: {
          link: recipe.link,
//          recommendation_reason: recipe.recommendation_reason,
//          dietary_tips: dietaryTips,
          isWatson: recipe.isWatson || false,
        }
      });
    };

  const fetchRecipes = async (themeCode) => {
    console.log('📡 fetchRecipes 호출됨:', themeCode);
    setLoading(true);
    try {
      const res = await apiClient.get('/recipes', {
        params: { theme: themeCode },
        paramsSerializer: params => qs.stringify(params),
      });
      console.log('📥 받은 결과:', res.data);
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

    useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ing = params.get('ingredients');
    const k = params.get('kind');
    const s = params.get('situation');
    const m = params.get('method');
    const t = params.get('theme');

    if (ing || t) {
      setIngredients(ing || '');
      setKind(k || '');
      setSituation(s || '');
      setMethod(m || '');
      setTheme(t || '');
      fetchRecipes(ing, k, s, m, t);
    }

    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const res = await fetchWithAutoRefresh("/api/bookmarks", {
        method: "GET"
      });
      const data = await res.data;
      const bookmarkedIds = new Map();
      data.forEach((recipe) => {
        bookmarkedIds.set(Number(recipe.id), true);
      });
      setBookmarkedState(bookmarkedIds);
    } catch (err) {
      console.error("❌ 북마크 상태 불러오기 실패:", err);
    }
  };

   const handleAddToBookmark = async (recipe) => {
   const recipeId = Number(recipe.id);
    if (bookmarkedState.has(recipeId)) {
      alert("이미 추가된 레시피입니다!");
      return;
    }

    try {
      const res = await fetchWithAutoRefresh("/api/bookmark-with-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: recipe.title,
          image: recipe.image,
          summary: recipe.summary || "",
          link: recipe.link
        })
      });

      const data = await res.data;
      const newRecipeId = Number(data.recipe_id);
      setBookmarkedState((prev) => {
        const updated = new Map(prev);
        updated.set(newRecipeId, true);
        return updated;
      });

      alert("✅ 북마크에 저장되었습니다!");
    } catch (err) {
      console.error("❌ 북마크 실패:", err);
      alert("북마크 중 오류 발생");
    }
  };
  return (
    <div className="recipe-list-page">
      <h2>💡테마별 추천</h2>

    <div className="theme-buttons">
      {themes.map((theme) => (
        <button
          key={theme.code}
          className={selectedTheme === theme.code ? 'active' : ''}
          onClick={() => {
            setSelectedTheme(theme.code);
            handleThemeClick(theme.code);
          }}
        >
          {theme.label}
        </button>
      ))}
    </div>


      {loading && <p>로딩 중...</p>}
      {!loading && results.length > 0 && (
        <p className="result-count">🔎 총 {results.length}개의 레시피가 검색되었습니다.</p>
      )}

      <div className="recipe-grid">
        {results.map((r, i) => (
          <div key={i} className="recipe-card" onClick={() => handleCardClick(r)}>
            <img src={r.image} alt={r.title} />
            <h3>{r.title}</h3>
            <button onClick={(e) => { e.stopPropagation(); handleAddToBookmark(r); }}>
              {bookmarkedState.has(Number(r.id)) ? "✅ 저장됨" : "북마크"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RandomRecipePage;