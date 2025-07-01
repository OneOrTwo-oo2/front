import React, { useState, useEffect } from 'react';
import axios from 'axios';
import qs from 'qs';
import './RecipeListPage.css';
import DropdownSelector from '../components/DropdownSelector.js';

function RecipeListPage() {
  const [ingredients, setIngredients] = useState('');
  const [kind, setKind] = useState('');
  const [situation, setSituation] = useState('');
  const [method, setMethod] = useState('');
  const [theme, setTheme] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openDropdown, setOpenDropdown] = useState(null); // 하나의 드롭다운만 열리도록 수정

  const kindOptions = [
    { value: '', label: '종류별' },
    { value: '63', label: '밑반찬' },
    { value: '56', label: '메인반찬' },
    { value: '54', label: '국/탕' },
    { value: '55', label: '찌개' },
    { value: '60', label: '디저트' },
    { value: '53', label: '면/만두' },
    { value: '52', label: '밥/죽/떡' },
    { value: '61', label: '퓨전' },
    { value: '57', label: '김치/젓갈/장류' },
    { value: '58', label: '양념/소스/잼' },
    { value: '65', label: '양식' },
    { value: '64', label: '샐러드' },
    { value: '68', label: '스프' },
    { value: '66', label: '빵' },
    { value: '69', label: '과자' },
    { value: '59', label: '차/음료/술' },
    { value: '62', label: '기타' }
  ];

  const situationOptions = [
    { value: '', label: '상황별' },
    { value: '12', label: '일상' },
    { value: '18', label: '초스피드' },
    { value: '13', label: '손님접대' },
    { value: '19', label: '술안주' },
    { value: '21', label: '다이어트' },
    { value: '15', label: '도시락' },
    { value: '43', label: '영양식' },
    { value: '17', label: '간식' },
    { value: '45', label: '야식' },
    { value: '20', label: '푸드스타일링' },
    { value: '46', label: '해장' },
    { value: '44', label: '명절' },
    { value: '14', label: '이유식' },
    { value: '22', label: '기타' }
  ];

  const methodOptions = [
    { value: '', label: '방법별' },
    { value: '6', label: '볶음' },
    { value: '1', label: '끓이기' },
    { value: '7', label: '부침' },
    { value: '36', label: '조림' },
    { value: '41', label: '무침' },
    { value: '42', label: '비빔' },
    { value: '8', label: '찜' },
    { value: '10', label: '절임' },
    { value: '9', label: '튀김' },
    { value: '38', label: '삶기' },
    { value: '67', label: '굽기' },
    { value: '39', label: '데치기' },
    { value: '37', label: '회' },
    { value: '11', label: '기타' }
  ];

  const handleToggle = (key) => {
    // 드롭다운을 하나만 열 수 있도록 설정
        setOpenDropdown(openDropdown === key ? null : key); // 같은 것을 두 번 클릭하면 닫기
  };

  const handleSelect = (key, opt) => {
    if (key === 'kind') setKind(opt.value);
    if (key === 'situation') setSituation(opt.value);
    if (key === 'method') setMethod(opt.value);
    setOpenDropdown(null); // 선택 후 드롭다운 닫기
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
