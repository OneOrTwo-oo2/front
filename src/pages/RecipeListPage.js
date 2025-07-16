// ✅ 수정: axios 제거 + fetchWithAutoRefresh 사용
import React, { useState, useEffect } from 'react';
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
  //const [theme, setTheme] = useState('');
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
  const location = useLocation();

  const getOptionValue = (options, label) => {
  const match = options.find(opt => opt.label === label);
  return match ? match.value : label;
  };

  // ✅ label → value 변환
  const kindValue = getOptionValue(kindOptions, kind);
  const [userPreferences, setUserPreferences] = useState({ allergies: [], diseases: [] });

  useEffect(() => {
  // 페이지가 로드되면 사용자의 알러지/질병 정보를 미리 가져온다.
    const fetchUserPreferences = async () => {
     try {
        const response = await apiClient.get("/api/preferences", { withCredentials: true });
        setUserPreferences(response.data);
        console.log("✅ 사용자 정보 로딩 성공:" , response.data);
        } catch (error) {
        console.error("❌ 사용자 정보를 가져오지 못했습니다. 로그인 상태를 확인하세요.", error);
        }
      };
      fetchUserPreferences();
     },[]);

  // 이전 캐시 데이터 가져오기
  useEffect(() => {
    const saved = sessionStorage.getItem("searchInputs");

    if (saved) {
      const { ingredients, preference, kind, level } = JSON.parse(saved);
      console.log("✅ 복원된 검색조건:", { ingredients, preference, kind, level });

      setIngredients(ingredients || '');
      setPreference(preference || '');
      setKind(kind || '');
      setLevel(level || '');

      fetchRecipes(ingredients, kind, preference, level);
    } else {
      console.log("❌ 세션스토리지에 저장된 검색 정보가 없습니다.");
    }

    fetchBookmarks();
  }, []);


  useEffect(() => {
  // 쿼리스트링이 바뀌면 Watson 캐시를 삭제
  const params = new URLSearchParams(window.location.search);
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
  // 쿼리스트링이 바뀌면 Watson 캐시를 삭제
  const params = new URLSearchParams(window.location.search);
  const ingredients = params.get('ingredients');
  const kind = params.get('kind');
  const situation = params.get('situation');
  const method = params.get('method');

  const currentQuery = JSON.stringify({ ingredients, kind, situation, method });
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
        setDietaryTips(parsed.dietary_tips || "");
        setIsWatsonLoading(false); // 안전하게 로딩 꺼두기
        return;
      }

      // ✅ 캐시가 없을 때만 Watson 호출
      const fetchWatsonRecommendations = async () => {
        if (!ingredients || ingredients.length === 0) return;

        setIsWatsonLoading(true);
        try {
          const allergies = userPreferences.allergies;
          const diseases = userPreferences.diseases;
          const res = await aiClient.post("/recommend", { ingredients, preference, kind, level, allergies, diseases  });
          const data = res.data;

          console.log("data:",ingredients, preference, kind, level, allergies, diseases )

          setWatsonRecommendations(data.result.recommended_recipes || []);
          setDietaryTips(data.result.dietary_tips || "");

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
}, [ingredients, kind, preference, level]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ing = params.get('ingredients');
    const k = params.get('kind');
    const p = params.get('preference');
    const l = params.get('level');
    //const t = params.get('theme');

    //if (ing || t) {
      setIngredients(ing || '');
      setKind(k || '');
      setPreference(p || '');
      setLevel(l || '');
      //setSituation(s || '');
      //setMethod(m || '');
      //setTheme(t || '');
      fetchRecipes(ing, k, p, l);
    //}

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

  const fetchRecipes = async (ing, k, p, l) => {
    setIsRecipeLoading(true);
    try {
      const queryParams = {
        ...(ing && { ingredients: ing.split(',').map(i => i.trim()) }),
        ...(k && { kindValue }),
        //...(t && { theme: t })
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
    const query = qs.stringify({
      ingredients,
      ...(kind && { kindValue }),
    });
    window.history.pushState(null, '', `/recipes?${query}`);
    fetchRecipes(ingredients, kindValue);
  };

 const handleCardClick = (recipe) => {
      navigate("/recipes/detail", {
        state: {
          link: recipe.link,
          recommendation_reason: recipe.recommendation_reason,
          dietary_tips: dietaryTips,
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
      <h2>🔍레시피 검색</h2>
      <div className="search-bar">
        <input type="text" value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder="예: 김치, 감자" />
        <button onClick={handleSearch}>검색</button>
      </div>
       {isLoading && (
          <div className="loading-container">
            <p className="loading-text">🤖 AI 추천 레시피를 검색 중입니다. 잠시만 기다려주세요!</p>
            <LoadingAnimation />
          </div>
       )}
      {!isLoading && results.length > 0 && (<p className="result-count">🔎 총 {results.length}개의 레시피가 검색되었습니다.</p>)}

      {watsonRecommendations.length > 0 && (
        <div className="watson-section">
          <h3>🤖 Watson AI 추천 레시피 3종</h3>
          <div className="recipe-grid">
            {watsonRecommendations.map((r, i) => (
              <div key={`watson-${i}`} className="recipe-card watson-card" onClick={() => handleCardClick({r,...r, link: r.url,isWatson: true })}>
                <img src={r.image} alt={r["제목"]} />
                <h3>{r["제목"]}</h3>
                 {/* <p>{r.dietary_tips}</p> */}
                <button>추천 레시피</button>
              </div>
            ))}
          </div>
        </div>
      )}
        <h3> 일반 검색 레시피</h3>
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
