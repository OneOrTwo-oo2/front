import React, { useState, useEffect } from 'react';
import axios from 'axios';
import qs from 'qs';
import './RecipeListPage.css';
import DropdownSelector from '../components/DropdownSelector';
import { useNavigate } from 'react-router-dom';
import { kindOptions, situationOptions, methodOptions } from '../components/options';

function RecipeListPage() {
  const [ingredients, setIngredients] = useState('');
  const [kind, setKind] = useState('');
  const [situation, setSituation] = useState('');
  const [method, setMethod] = useState('');
  const [theme, setTheme] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookmarkedState, setBookmarkedState] = useState(new Map());

  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(null);

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

    fetchBookmarks(); // ✅ 북마크 상태 불러오기
  }, []);

  const fetchBookmarks = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get("http://localhost:8000/api/bookmarks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const bookmarkedIds = new Map();
      res.data.forEach((recipe) => {
        bookmarkedIds.set(Number(recipe.id), true);
      });
      setBookmarkedState(bookmarkedIds);
    } catch (err) {
      console.error("❌ 북마크 상태 불러오기 실패:", err);
    }
  };

  const fetchRecipes = async (ing, k, s, m, t) => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/recipes', {
        params: {
          ...(ing && { ingredients: ing.split(',').map(i => i.trim()) }),
          ...(k && { kind: k }),
          ...(s && { situation: s }),
          ...(m && { method: m }),
          ...(t && { theme: t })
        },
        paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' })
      });

      const processed = res.data.results.map((r, idx) => ({
        ...r,
        id: Number(r.id) || idx
      }));

      setResults(processed);
    } catch (err) {
      console.error("❌ 에러:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const query = qs.stringify({
      ingredients,
      ...(kind && { kind }),
      ...(situation && { situation }),
      ...(method && { method })
    });
    window.history.pushState(null, '', `/recipes?${query}`);
    fetchRecipes(ingredients, kind, situation, method, '');
  };

  const handleCardClick = (recipe) => {
    navigate("/recipes/detail", { state: { link: recipe.link } });
  };

  const handleToggle = (key) => {
    setOpenDropdown(openDropdown === key ? null : key);
  };

  const handleSelect = (key, opt) => {
    if (key === 'kind') setKind(opt.value);
    if (key === 'situation') setSituation(opt.value);
    if (key === 'method') setMethod(opt.value);
    setOpenDropdown(null);
  };

  const handleAddToBookmark = async (recipe) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다!");
      return;
    }

    const recipeId = Number(recipe.id);

    if (bookmarkedState.has(recipeId)) {
      alert("이미 추가된 레시피입니다!");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:8000/api/bookmark-with-recipe",
        {
          title: recipe.title,
          image: recipe.image,
          summary: recipe.summary || "",
          link: recipe.link,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const newRecipeId = Number(res.data.recipe_id);

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
        <input
          type="text"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="예: 김치, 감자"
        />

        <DropdownSelector
          label="종류별"
          options={kindOptions}
          selected={kind ? kindOptions.find(opt => opt.value === kind)?.label : ''}
          isOpen={openDropdown === 'kind'}
          onToggle={() => handleToggle('kind')}
          onSelect={(value) => handleSelect('kind', value)}
        />

        <DropdownSelector
          label="상황별"
          options={situationOptions}
          selected={situation ? situationOptions.find(opt => opt.value === situation)?.label : ''}
          isOpen={openDropdown === 'situation'}
          onToggle={() => handleToggle('situation')}
          onSelect={(value) => handleSelect('situation', value)}
        />

        <DropdownSelector
          label="방법별"
          options={methodOptions}
          selected={method ? methodOptions.find(opt => opt.value === method)?.label : ''}
          isOpen={openDropdown === 'method'}
          onToggle={() => handleToggle('method')}
          onSelect={(value) => handleSelect('method', value)}
        />

        <button onClick={handleSearch}>검색</button>
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
            <p>{r.summary}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToBookmark(r);
              }}
            >
              {bookmarkedState.has(Number(r.id)) ? "✅ 저장됨" : "북마크"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecipeListPage;
