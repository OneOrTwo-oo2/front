import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import qs from 'qs';
import './IngredientSearchPage.css';
import emojiMap from '../assets/emojiMap_full_ko.js';
import {
  preferOptions,
  kindOptions,
  levelOptions
} from '../components/options.js';
import IngredientCategorySection from '../components/categorys/IngredientCategorySection';

function IngredientSearchPage() {
  const [ingredients, setIngredients] = useState([]);
  const [preference, setPreference] = useState('');
  const [kind, setKind] = useState('');
  const [level, setLevel] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  // cursor 수정 - 사진 검색에서 전달받은 재료 처리 (useMemo로 안정화)
  const labels = useMemo(() => {
    return location.state?.labels || [];
  }, [location.state?.labels]);

  const [isRestored, setIsRestored] = useState(false);
  // cursor 수정 - 이미 처리된 labels 추적
  const processedLabelsRef = useRef(null);

  // cursor 수정 - 페이지 키가 변경될 때마다 상태 초기화
  useEffect(() => {
    setIsRestored(false);
    processedLabelsRef.current = null;
  }, [location.key]);

  const getOptionValue = (options, label) => {
  const match = options.find(opt => opt.label === label);
  return match ? match.value : label;
  };

  // cursor 수정 - 캐시 저장 및 복원 로직 개선 (무한루프 방지)
  useEffect(() => {
    // cursor 수정 - 이미 처리된 labels인지 확인
    if (processedLabelsRef.current === JSON.stringify(labels)) {
      return;
    }

    // cursor 수정 - 사진 검색 결과가 있으면 우선 처리
    if (labels && labels.length > 0) {
      console.log("✅ 사진 검색 결과 로딩:", labels);
      setIngredients(labels);
      setPreference('');
      setKind('');
      setLevel('');
      // 사진 검색 결과가 있으면 sessionStorage 초기화
      sessionStorage.removeItem("searchInputs");
      setIsRestored(true);
      processedLabelsRef.current = JSON.stringify(labels);
      return;
    }

    // cursor 수정 - 재료 수정 버튼으로 들어온 경우에만 세션 유지
    const isFromEditButton = sessionStorage.getItem("fromEditButton");
    if (isFromEditButton === "true") {
      // 재료 수정 버튼으로 들어온 경우 세션 유지
      const saved = sessionStorage.getItem("searchInputs");
      if (saved) {
        const parsed = JSON.parse(saved);
        // cursor 수정 - 한글 이름을 영문 키로 변환
        const convertedIngredients = Array.isArray(parsed.ingredients)
          ? parsed.ingredients.map(koreanName => {
              // 한글 이름으로 영문 키 찾기
              const foundKey = Object.keys(emojiMap).find(key =>
                emojiMap[key]?.name_ko === koreanName
              );
              return foundKey || koreanName;
            })
          : [];
        setIngredients(convertedIngredients);
        setPreference(parsed.preference || '');
        setKind(parsed.kind || '');
        setLevel(parsed.level || '');
      }
    } else { // 다른 경로로 들어온 경우 초기화
      setIngredients([]);
      setPreference('');
      setKind('');
      setLevel('');
      sessionStorage.removeItem("searchInputs");
      sessionStorage.removeItem("watsonRecommendations");
      sessionStorage.removeItem("lastQuery");
    }

    // ✅ 복원 완료 플래그 설정
    setIsRestored(true);
    processedLabelsRef.current = JSON.stringify(labels);
  }, [labels]); // cursor 수정 - 안정화된 labels 사용

  // ✅ 복원이 완료된 경우에만 sessionStorage에 저장 (무한 루프 방지)
  useEffect(() => {
    if (!isRestored) return;
    const ingredientNamesInKorean = ingredients.map((item) => {
      const info = emojiMap[item];
      return info?.name_ko || item.replace(/_/g, ' ');
    });
    const currentData = {
      ingredients: ingredientNamesInKorean,
      preference,
      kind,
      level
    };
    const saved = sessionStorage.getItem("searchInputs");
    const savedData = saved ? JSON.parse(saved) : null;
    if (!savedData || JSON.stringify(savedData) !== JSON.stringify(currentData)) {
      sessionStorage.setItem("searchInputs", JSON.stringify(currentData));
    }
  }, [ingredients, preference, kind, level, isRestored]);

  const handleCategorySelect = (type, value) => {
    if (type === 'preference') setPreference(prev => prev === value ? '' : value);
    if (type === 'kind') setKind(prev => prev === value ? '' : value);
    if (type === 'level') setLevel(prev => prev === value ? '' : value);
  };

  // cursor 수정 - 중복 선택 방지 강화
  const toggleIngredient = (item) => {
    setIngredients((prev) => {
      // 이미 선택된 재료인지 확인
      const isAlreadySelected = prev.includes(item);
      if (isAlreadySelected) {
        // 선택 해제
        return prev.filter((i) => i !== item);
      } else {
        // 중복 체크 후 추가
        return [...prev, item];
      }
    });
  };

  // 고정 박스에 들어갈 항목들만 정리
  const getSelectedMeta = () => {
    const result = [];

    if (preference) result.push({ type: '선호도', value: preference });
    if (kind) result.push({ type: '종류', value: kind });
    if (level) result.push({ type: '난이도', value: level });

    return result;
  };

  // type + value 조합으로 한글 라벨 가져오기
  const getLabelText = (type, value) => {
    const optionMap = {
      선호도: preferOptions,
      종류: kindOptions,
      난이도: levelOptions
    };

    const matched = optionMap[type]?.find((opt) => opt.value === value);
    const label = matched ? matched.label : value;

    return `[${type}] ${label}`;
  };

  // ❌ 버튼 처리
  const handleToggle = (type, value) => {
    if (type === '선호도') setPreference('');
    else if (type === '종류') setKind('');
    else if (type === '난이도') setLevel('');
  };

  const handleSearch = () => {
    const ingredientNamesInKorean = ingredients.map((item) => {
      const info = emojiMap[item];
      return info?.name_ko || item.replace(/_/g, ' ');
    });
    // ✅ label → value 변환
    const kindValue = getOptionValue(kindOptions, kind);

    // cursor 수정 - 저장되는 값들 로그 추가
    const searchData = {
      ingredients: ingredientNamesInKorean,
      preference,
      kind,
      level
    };
    console.log("✅ 저장되는 검색 데이터:", searchData);

    sessionStorage.setItem("searchInputs", JSON.stringify(searchData));

    // cursor 수정 - 검색 시 fromEditButton 플래그 제거
    sessionStorage.removeItem("fromEditButton");

    const query = qs.stringify({
      ingredients: ingredientNamesInKorean.join(','),
      ...(kind && { kind: kindValue }),
      //...(situation && { situation }),
      //...(method && { method }),
    });
    navigate(`/recipes?${query}`);

    console.log("recipe 전달 data:", query)
    };

//  const searchData = {
//    ingredients,
//    kind,
//    preference,
//    level,
//  };
//
//  // 👉 sessionStorage 저장
//  sessionStorage.setItem('recipeSearchState', JSON.stringify(searchData));
//
//  // 👉 location.state로도 함께 전달
//  navigate('/RecipeListPage', { state: searchData });

  const isSearchDisabled = ingredients.length === 0;

  // cursor 수정 - 초기화 함수 개선
  const handleReset = () => {
    // 사진 검색 결과가 있으면 유지, 없으면 완전 초기화
    if (labels && labels.length > 0) {
      // 사진 검색 결과가 있으면 선택된 재료만 초기화
      setIngredients([]);
      setPreference('');
      setKind('');
      setLevel('');
      sessionStorage.removeItem("searchInputs");
      console.log("✅ 선택된 재료만 초기화되었습니다. (사진 검색 결과 유지)");
    } else {
      // 사진 검색 결과가 없으면 완전 초기화
      setIngredients([]);
      setPreference('');
      setKind('');
      setLevel('');
      sessionStorage.removeItem("searchInputs");
      sessionStorage.removeItem("watsonRecommendations");
      sessionStorage.removeItem("lastQuery");
      console.log("✅ 모든 선택사항이 초기화되었습니다.");
    }
  };

  return (
    <div className="ingredient-search-layout">
      {/* 좌측 고정 선택 박스 */}
      <div className="selected-ingredients-fixed">
        <p className="text-prefer">😀 선택된 선호도 또는 타입 </p>
        <div className="selected-ingredients-row buttons">
          {getSelectedMeta().map(({ type, value }) => (
            <button key={type + value} onClick={() => handleToggle(type, value)}>
              <span>{getLabelText(type, value)}</span>
               <span>✖</span>
            </button>
          ))}
        </div>
      </div>
     <div className="ingredient-search-content">
      {/* 재료 */}
      <div className="section">
        <h4>선택된 재료</h4>
        <IngredientCategorySection
          selectedIngredients={ingredients}
          setSelectedIngredients={setIngredients}
          toggleIngredient={toggleIngredient}
        />
      </div>
              {/* 선호도 */}
      <h4>선호도 선택</h4>
      <div className="buttons">
        {preferOptions.map((opt) => (
          <button
            key={opt.value}
            className={preference === opt.label ? 'active' : ''}
            onClick={() => handleCategorySelect('preference', opt.label)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {/* 종류 / 난이도 */}
      <div className="section">
        <h4>종류별</h4>
        <div className="buttons">
          {kindOptions.map((opt) => (
            <button
              key={opt.value}
              className={kind === opt.label ? 'active' : ''}
              onClick={() => handleCategorySelect('kind', opt.label)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <h4>난이도별</h4>
        <div className="buttons">
          {levelOptions.map((opt) => (
            <button
              key={opt.value}
              className={level === opt.label ? 'active' : ''}
              onClick={() => handleCategorySelect('level', opt.label)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
<div className="search-sticky-btn">
        <button
          className="search-btn"
          onClick={handleSearch}
          disabled={isSearchDisabled}
        >
         🔍검색
        </button>
        <button
          className="reset-btn"
          onClick={handleReset}
          style={{
            marginLeft: '10px',
            padding: '10px 20px',
            backgroundColor: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: 5,
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
         🔄초기화
        </button>
      </div>
    </div>
  );
}

export default IngredientSearchPage;
