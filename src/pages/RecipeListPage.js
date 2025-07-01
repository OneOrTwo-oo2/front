import React, { useState, useEffect } from 'react';
import axios from 'axios';
import qs from 'qs';
import './RecipeListPage.css';

function RecipeListPage() {
  const [ingredients, setIngredients] = useState('');
  const [kind, setKind] = useState('');
  const [situation, setSituation] = useState('');
  const [method, setMethod] = useState('');
  const [theme, setTheme] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const handleThemeClick = (themeCode) => {
    setTheme(themeCode);
    setIngredients('');
    setKind('');
    setSituation('');
    setMethod('');
    const query = qs.stringify({ theme: themeCode });
    window.history.pushState(null, '', `/recipes?${query}`);
    fetchRecipes(null, '', '', '', themeCode);
  };

  return (
    <div className="recipe-list-page">


      <div className="theme-buttons">
        <h3>테마별 추천</h3>
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

        {/* 원하는 만큼 버튼 추가 가능 */}
      </div>
        <h2>레시피 검색</h2>
      <div className="search-bar">
        <input
          type="text"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          placeholder="예: 김치, 감자"
        />

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
    </div>
  );
}

export default RecipeListPage;
