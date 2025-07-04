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
  const [bookmarkedState, setBookmarkedState] = useState(new Map()); // 각 레시피 카드의 북마크 상태 관리

  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(null);

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
  }, []);

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
      setResults(res.data.results);
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

  const getUserIdFromSession = () => {
    return 1; // 실제로 로그인한 사용자 ID를 사용
  };

  const handleAddToBookmark = async (recipe) => {
    const userId = getUserIdFromSession();
    try {
      // 이미 북마크된 레시피인지 확인
      if (bookmarkedState.has(recipe.id)) {
        alert("이미 추가된 레시피입니다!");
        return;  // 이미 추가된 레시피일 경우 추가하지 않음
      }

      // 북마크를 추가하는 API 요청
      await axios.post("http://localhost:8000/api/bookmark-with-recipe", {
        user_id: userId,
        title: recipe.title,
        image: recipe.image,
        summary: recipe.summary || "",
        link: recipe.link,
      });

      // 북마크 상태 업데이트 (각 레시피의 상태만 업데이트)
      setBookmarkedState((prevState) => {
        const updatedState = new Map(prevState);  // Map을 복사하여 상태 업데이트
        updatedState.set(recipe.id, true);  // 새로 북마크 추가
        return updatedState;
      });

      alert("✅ 북마크에 저장되었습니다!");
    } catch (err) {
      console.error("❌ 북마크 실패:", err);
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
              {bookmarkedState.has(r.id) ? "✅ 저장됨" : "북마크"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecipeListPage;
