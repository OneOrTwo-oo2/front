import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RecipeListPage.css';
import qs from 'qs';

function RecipeListPage() {
  const [ingredients, setIngredients] = useState('');
  const [kind, setKind] = useState('');
  const [situation, setSituation] = useState('');
  const [method, setMethod] = useState('');
  const [theme, setTheme] = useState('');
  const [results, setResults] = useState([]);
  const [wtableMatches, setWtableMatches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ing = params.get('ingredients');
    const k = params.get('kind');
    const s = params.get('situation');
    const m = params.get('method');
    const t = params.get('theme');

    if (ing) {
      setIngredients(ing);
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
          ingredients: ing.split(',').map(i => i.trim()),
          ...(k && { kind: k }),
          ...(s && { situation: s }),
          ...(m && { method: m }),
          ...(t && { theme: t })
        },
        paramsSerializer: params => qs.stringify(params, { arrayFormat: 'repeat' })
      });

      setResults(res.data.results);
      setWtableMatches(res.data.wtable_matches || []);
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
      ...(method && { method }),
      ...(theme && { theme })
    });
    window.history.pushState(null, '', `/recipes?${query}`);
    fetchRecipes(ingredients, kind, situation, method, theme);
  };

  return (
    <div className="recipe-list-page">
      <h2>재료 기반 레시피 검색</h2>

      <div className="search-bar">
        <input type="text" value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder="예: 감자, 김치" className="input-field" />
        <div className="dropdown-group">
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="">종류별</option>
            <option value="63">밑반찬</option>
            <option value="56">메인반찬</option>
            <option value="54">국/탕</option>
            <option value="55">찌개</option>
            <option value="60">디저트</option>
            <option value="53">면/만두</option>
            <option value="52">밥/죽/떡</option>
            <option value="61">퓨전</option>
            <option value="57">김치/젓갈/장류</option>
            <option value="58">양념/소스/잼</option>
            <option value="65">양식</option>
            <option value="64">샐러드</option>
            <option value="68">스프</option>
            <option value="66">빵</option>
            <option value="69">과자</option>
            <option value="59">차/음료/술</option>
            <option value="62">기타</option>
          </select>

          <select value={situation} onChange={(e) => setSituation(e.target.value)}>
            <option value="">상황별</option>
            <option value="12">일상</option>
            <option value="18">초스피드</option>
            <option value="13">손님접대</option>
            <option value="19">술안주</option>
            <option value="21">다이어트</option>
            <option value="15">도시락</option>
            <option value="43">영양식</option>
            <option value="17">간식</option>
            <option value="45">야식</option>
            <option value="20">푸드스타일링</option>
            <option value="46">해장</option>
            <option value="44">명절</option>
            <option value="14">이유식</option>
            <option value="22">기타</option>
          </select>

          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="">방법별</option>
            <option value="6">볶음</option>
            <option value="1">끓이기</option>
            <option value="7">부침</option>
            <option value="36">조림</option>
            <option value="41">무침</option>
            <option value="42">비빔</option>
            <option value="8">찜</option>
            <option value="10">절임</option>
            <option value="9">튀김</option>
            <option value="38">삶기</option>
            <option value="67">굽기</option>
            <option value="39">데치기</option>
            <option value="37">회</option>
            <option value="11">기타</option>
          </select>

          <select value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option value="">테마별</option>
            <option value="101012001">저칼로리 다이어트</option>
            <option value="101012002">머슬업 다이어트</option>
            <option value="101012003">디톡스 다이어트</option>
            <option value="101012004">변비</option>
            <option value="101012005">피부미용</option>
            <option value="101012006">두피-모발</option>
            <option value="101012007">빈혈예방</option>
            <option value="101012008">골다공증</option>
            <option value="101012009">갱년기건강</option>
            <option value="101012010">생리불순</option>
          </select>
        </div>

        <button onClick={handleSearch}>검색</button>
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

      {wtableMatches.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h3>Wtable에서 재료와 일치하는 레시피</h3>
          <ul>
            {wtableMatches.map((item, idx) => (
              <li key={idx}>
                <a href={item.link} target="_blank" rel="noopener noreferrer">{item.title}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default RecipeListPage;
