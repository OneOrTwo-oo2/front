// ✅ 수정: axios 제거 + fetchWithAutoRefresh 사용
import React, { useState, useEffect, useRef } from 'react';
import qs from 'qs';
import './RecipeListPage.css';
import DropdownSelector from '../components/DropdownSelector';
import { useNavigate, useLocation } from 'react-router-dom';
import { kindOptions, levelOptions, preferOptions } from '../components/options';
import { fetchWithAutoRefresh } from '../utils/fetchWithAuth';
import LoadingAnimation from '../components/loading_api';
import apiClient from '../api/apiClient';
import aiClient from '../api/aiClient';

function RecipeListPage() {
  const [ingredients, setIngredients] = useState('');
  const [kind, setKind] = useState('');
  const [preference, setPreference] = useState('');
  const [level, setLevel] = useState('');

  const [results, setResults] = useState([]);
  const [bookmarkedState, setBookmarkedState] = useState(new Map());
  const [watsonRecommendations, setWatsonRecommendations] = useState([]);  // 새로추가
  const [dietaryTips, setDietaryTips] = useState("");   //새로추가
  const [isRecipeLoading, setIsRecipeLoading] = useState(false);
  const [isWatsonLoading, setIsWatsonLoading] = useState(false);
  const isLoading = isRecipeLoading || isWatsonLoading;
  const location = useLocation();

  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(null);

  const getOptionValue = (options, label) => {
  const match = options.find(opt => opt.label === label);
  return match ? match.value : label;
  };

    const [userPreferences, setUserPreferences] = useState({ allergies: [], diseases: [] });
    // cursor 수정 - 중복 호출 방지 ref 사용
    const isInitializedRef = useRef(false);
    // 선호도, 사용자 정보 로딩 후 recommend로 전달 (중복 useEffect 병합)
    useEffect(() => {
      // cursor 수정 - 중복 실행 방지
      if (isInitializedRef.current) return;
      
      const initializePage = async () => {
        try {
          // 사용자 정보 로딩
          const response = await apiClient.get("/preferences", { withCredentials: true });
          const preferences = response.data;
          setUserPreferences(preferences);  // ✅ 상태 저장
          console.log("✅ 사용자 정보 로딩 성공:", preferences);

          // URL 파라미터 읽기
          const params = new URLSearchParams(window.location.search);
          const ing = params.get('ingredients');
          const k = params.get('kind');
          const p = params.get('preference');
          const l = params.get('level');

          // 세션스토리지에서 복원 또는 URL 파라미터 사용
          const saved = sessionStorage.getItem("searchInputs");
          if (saved) {
            const { ingredients, preference, kind, level } = JSON.parse(saved);
            console.log("✅ 복원된 검색조건:", { ingredients, preference, kind, level });

            setIngredients(ingredients || '');
            setPreference(preference || '');
            setKind(kind || '');
            setLevel(level || '');
            fetchRecipes(ingredients, kind, preference, level);
          } else if (ing || k || p || l) {
            // URL 파라미터가 있으면 사용
            setIngredients(ing || '');
            setKind(k || '');
            setPreference(p || '');
            setLevel(l || '');
            fetchRecipes(ing, k, p, l);
          } else {
            console.log("❌ 세션스토리지 없음");
          }

          // 북마크 로딩
          fetchBookmarks();
          
          // cursor 수정 - 초기화 완료 플래그 설정
          isInitializedRef.current = true;
        } catch (err) {
          console.error("❌ 초기 데이터 로딩 실패:", err);
          isInitializedRef.current = true;
        }
      };

      initializePage();
    }, []);


    useEffect(() => {
      // 쿼리스트링이 바뀌면 Watson 캐시를 삭제
      const params = new URLSearchParams(location.search);
      const ingredients = params.get('ingredients');
      const preference = params.get('preference');
      const kind = params.get('kind');
      const level = params.get('level');

      const currentQuery = JSON.stringify({ ingredients, preference, kind, level });
      const previousQuery = sessionStorage.getItem("lastQuery");

      if (currentQuery !== previousQuery) {
        // ✅ 쿼리 바뀐 경우에만 Watson 캐시 삭제
        sessionStorage.removeItem("watsonRecommendations");
        sessionStorage.setItem("lastQuery", currentQuery);
      }
    }, [location.search]);

    useEffect(() => {
      const cached = sessionStorage.getItem("watsonRecommendations");
      if (cached) {
        // ✅ Watson 캐시가 있으면 상태만 복원, 로딩은 아예 건너뜀
        const parsed = JSON.parse(cached);
        setWatsonRecommendations(parsed.recommended_recipes || []);
        //setDietaryTips(parsed.dietary_tips || "");
        setIsWatsonLoading(false); // 안전하게 로딩 꺼두기
        return;
      }
      // ✅ 캐시가 없을 때만 Watson 호출
      const fetchWatsonRecommendations = async () => {
        if (!ingredients || ingredients.length === 0) return;

        setIsWatsonLoading(true);
        try {
          // cursor 수정 - Watson API 호출 시 모든 정보 포함
          const res = await aiClient.post("/recommend", { 
            ingredients,
            preference,
            kind,
            level,
            allergies: userPreferences.allergies,
            diseases: userPreferences.diseases
          });
          const data = res.data;

          setWatsonRecommendations(data.result.recommended_recipes || []);

          sessionStorage.setItem(
            "watsonRecommendations",
            JSON.stringify(data.result)
          );
        } catch (err) {
          console.error("❌ Watson 추천 실패:", err);
        } finally {
          setIsWatsonLoading(false);
        }
      };

      fetchWatsonRecommendations();
    }, [ingredients, kind, level, preference, userPreferences]);


  const fetchBookmarks = async () => {
    try {
      const res = await fetchWithAutoRefresh("/bookmarks", {
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

  const fetchRecipes = async (ing, k, p, l) => {
    const kindValue = getOptionValue(kindOptions, kind);
    setIsRecipeLoading(true);
    try {
      const queryParams = {
      ...(ing && {
        ingredients: Array.isArray(ing)
          ? ing
          : ing.split(',').map(i => i.trim())
      }),
        ...(k && { kind: kindValue }),
      };

      const query = qs.stringify(queryParams, { arrayFormat: 'repeat' });
      const res = await apiClient.get(`/recipes?${query}`);
      const data = res.data;

      const processed = data.results.map((r, idx) => ({
        ...r,
        id: Number(r.id) || idx
      }));

      setResults(processed);
    } catch (err) {
      console.error("❌ 레시피 불러오기 실패:", err);
    } finally {
      setIsRecipeLoading(false);
    }
  };

  const handleSearch = () => {
    sessionStorage.removeItem("watsonRecommendations");

    const kindValue = getOptionValue(kindOptions, kind);
    const query = qs.stringify({
      ingredients,
      ...(kind && { kind: kindValue }),
    });
    window.history.pushState(null, '', `/recipes?${query}`);
    fetchRecipes(ingredients, kindValue);
  };

 const handleCardClick = (recipe) => {
      navigate('/recipes/detail', {
        state: {
          title: recipe.title,
          image: recipe.image,
          summary: recipe.summary,
          link: recipe.link,
          recommendation_reason: recipe.recommendation_reason,
          dietary_tips: recipe.dietary_tips,
          //dietary_tips: dietaryTips,
          isWatson: recipe.isWatson || false,
        }
      });
    };

  const handleToggle = (key) => {
    setOpenDropdown(openDropdown === key ? null : key);
  };

  const handleSelect = (key, opt) => {
    if (key === 'kind') setKind(opt.value);
    if (key === 'level') setLevel(opt.value);
    setOpenDropdown(null);
  };

  const handleAddToBookmark = async (recipe) => {
    const recipeId = Number(recipe.id);
    if (bookmarkedState.has(recipeId)) {
      alert("이미 추가된 레시피입니다!");
      return;
    }

    try {
      // cursor 수정 - Watson 레시피와 일반 레시피 데이터 구조 통합 처리
      const bookmarkData = {
        title: recipe.title || recipe["제목"] || recipe.title,
        image: recipe.image,
        summary: recipe.summary || recipe.dietary_tips || "",
        link: recipe.link || recipe.url || ""
      };

      console.log("✅ 북마크 데이터:", bookmarkData);

      const res = await fetchWithAutoRefresh("/bookmark-with-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bookmarkData)
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
      {/* cursor 수정 - 검색 박스 제거하고 정보 표시 박스로 변경 */}
      <div className="search-info-box">
        <h2>🔍 레시피 검색</h2>
        
        {/* 선택된 정보 표시 박스 */}
        <div className="selected-info-container">
          <div className="info-row">
            <span className="info-label">선택된 재료:</span>
            <span className="info-value">
              {Array.isArray(ingredients)
                ? ingredients.join(', ')
                : (ingredients ? ingredients.split(',').map(i => i.trim()).join(', ') : '')}
            </span>
          </div>
          
          {userPreferences.diseases && userPreferences.diseases.length > 0&& (
            <div className="info-row">             <span className="info-label">사용자 질병정보:</span>
              <span className="info-value">{userPreferences.diseases.join(', ')}</span>
            </div>
          )}
          
          {userPreferences.allergies && userPreferences.allergies.length > 0&& (
            <div className="info-row">             <span className="info-label">사용자 알러지정보:</span>
              <span className="info-value">{userPreferences.allergies.join(', ')}</span>
            </div>
          )}
          
          {preference && (
            <div className="info-row">             <span className="info-label">사용자 선호도:</span>
              <span className="info-value">{preference}</span>
            </div>
          )}
          
          {kind && (
            <div className="info-row">             <span className="info-label">선택된 종류:</span>
              <span className="info-value">{kind}</span>
            </div>
          )}
          
          {level && (
            <div className="info-row">             <span className="info-label">선택된 난이도:</span>
              <span className="info-value">{level}</span>
            </div>
          )}
          
          {/* 재료 수정 버튼 */}
          <div className="edit-button-container">
            <button 
              className="edit-ingredients-btn"
              onClick={() => {
                sessionStorage.setItem("fromEditButton", "true");
                navigate('/ingredient-search');
              }}
            >
              📝 재료 수정
            </button>
          </div>
        </div>
      </div>

      {/* 검색 결과 개수 표시 */}
      <div className="search-results-count">
        총 {results.length}개의 레시피가 검색되었습니다.
      </div>
       {isLoading && (
          <div className="loading-container">
            <p className="loading-text"> AI 추천 레시피를 검색 중입니다. 잠시만 기다려주세요!</p>
            <LoadingAnimation />
          </div>
       )}
      {!isLoading && results.length > 0 && (<p className="result-count">🔎 총 {results.length}개의 레시피가 검색되었습니다.</p>)}

      {watsonRecommendations.length > 0 && (
        <div className="watson-section">
          <h3>🤖 Watson AI 추천 레시피3종</h3>
          <div className="recipe-grid">
            {watsonRecommendations.map((r, i) => (
              <div key={`watson-${i}`} className="recipe-card watson-card" onClick={() => handleCardClick({...r, link: r.url, isWatson: true })}>
                <img src={r.image} alt={r["제목"]} />
                <h3>{r["제목"]}</h3>
                {/* <p>{r.dietary_tips}</p> */}
                <button onClick={(e) => { e.stopPropagation(); handleAddToBookmark({...r, id: r.id || `watson-${i}`}); }}>
                  {bookmarkedState.has(Number(r.id)) ? "✅ 저장됨" : "북마크"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
        <h3>검색 레시피</h3>
      <div className="recipe-grid">
        {results.map((r, i) => (
          <div key={i} className="recipe-card" onClick={() => handleCardClick(r)}>
            <img src={r.image} alt={r.title} />
            <h3>{r.title}</h3>
            <p>{r.summary}</p>
            <button onClick={(e) => { e.stopPropagation(); handleAddToBookmark(r); }}>
              {bookmarkedState.has(Number(r.id)) ? "✅ 저장됨" : "북마크"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecipeListPage;