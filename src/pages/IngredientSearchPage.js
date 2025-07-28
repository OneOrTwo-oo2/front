import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import qs from 'qs';
import './IngredientSearchPage.css';
import emojiMap from '../assets/emojiMap_full_ko.js';
import prefIcon from '../assets/icons/pref_icon.svg';
import searchIcon from '../assets/icons/search_icon.svg';
import { getAiApi } from '../api/base';
import {
  preferOptions,
  kindOptions,
  levelOptions
} from '../components/options.js';
import IngredientCategorySection from '../components/categorys/IngredientCategorySection';

// 디버깅용 시각화 컴포넌트 및 showDebug 관련 코드 전체 삭제

function IngredientSearchPage() {
  const [ingredients, setIngredients] = useState([]);
  const [preference, setPreference] = useState('');
  const [kind, setKind] = useState('');
  const [level, setLevel] = useState('');
  const [activeTab, setActiveTab] = useState('preference'); // 탭 상태 추가
  // 디버깅 토글 삭제
  const [showImageModal, setShowImageModal] = useState(false); // 이미지 모달 토글 상태

  const location = useLocation();
  const navigate = useNavigate();
  const previewUrl = location.state?.previewUrl || sessionStorage.getItem('uploadedImageUrl');
  const bboxImageUrl = location.state?.bboxImageUrl; // bounding box 이미지 URL
  const [showBboxModal, setShowBboxModal] = useState(false); // bounding box 모달 토글 상태
  
  // bounding box 이미지 URL을 올바른 백엔드 서버 URL로 구성
  const fullBboxImageUrl = useMemo(() => {
    if (!bboxImageUrl) return null;
    // 상대 경로인 경우 백엔드 서버 URL과 결합
    if (bboxImageUrl.startsWith('/')) {
      // static 파일은 /ai 경로 없이 직접 접근
      const baseUrl = getAiApi().replace('/ai', ''); // http://localhost:8001
      const fullUrl = `${baseUrl}${bboxImageUrl}`;
      console.log('🔍 Bounding box 이미지 URL:', fullUrl);
      return fullUrl;
    }
    console.log('🔍 Bounding box 이미지 URL:', bboxImageUrl);
    return bboxImageUrl;
  }, [bboxImageUrl]);
  
  // cursor 수정 - 사진 검색에서 전달받은 재료 처리 (useMemo로 안정화)
  const ingredientsFromPhoto = useMemo(() => {
    return location.state?.ingredients || [];
  }, [location.state?.ingredients]);
  
  // 정확도 임계값 받기
  const confidenceThreshold = useMemo(() => {
    return location.state?.confidenceThreshold || 0.5;
  }, [location.state?.confidenceThreshold]);

  // 18% 미만 confidence 필터링 (디버깅/실제 재료 모두 적용)
  const filteredIngredientsFromPhoto = useMemo(() => {
    return (ingredientsFromPhoto || []).filter(item => (typeof item.confidence === 'number' ? item.confidence >= 0.18 : true));
  }, [ingredientsFromPhoto]);

  const [isRestored, setIsRestored] = useState(false);
  // cursor 수정 - 이미 처리된 ingredients 추적
  const processedIngredientsRef = useRef(null);

  // cursor 수정 - 페이지 키가 변경될 때마다 상태 초기화
  useEffect(() => {
    setIsRestored(false);
    processedIngredientsRef.current = null;
  }, [location.key]);

  const getOptionValue = (options, label) => {
  const match = options.find(opt => opt.label === label);
  return match ? match.value : label;
  };

  // bounding box 모달 토글
  const toggleBboxModal = () => {
    setShowBboxModal(!showBboxModal);
  };

  // cursor 수정 - 캐시 저장 및 복원 로직 개선 (무한루프 방지)
  useEffect(() => {
    // cursor 수정 - 이미 처리된 ingredients인지 확인
    if (processedIngredientsRef.current === JSON.stringify(ingredientsFromPhoto)) {
      return;
    }

    // cursor 수정 - 사진 검색 결과가 있으면 우선 처리
    if (ingredientsFromPhoto && ingredientsFromPhoto.length > 0) {
      console.log("✅ 사진 검색 결과 로딩:", ingredientsFromPhoto);
      
      // 새로운 형식: {label, confidence} 객체 배열에서 label만 추출 (0.18 미만 제외)
      const ingredientLabels = (ingredientsFromPhoto || [])
        .filter(item => (typeof item.confidence === 'number' ? item.confidence >= 0.18 : true))
        .map(item => typeof item === 'string' ? item : item.label);
      
      setIngredients(ingredientLabels);
      setPreference('');
      setKind('');
      setLevel('');
      // 사진 검색 결과가 있으면 sessionStorage 초기화
      sessionStorage.removeItem("searchInputs");
      setIsRestored(true);
      processedIngredientsRef.current = JSON.stringify(ingredientsFromPhoto);
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
    processedIngredientsRef.current = JSON.stringify(ingredientsFromPhoto);
  }, [ingredientsFromPhoto]); // cursor 수정 - 안정화된 ingredientsFromPhoto 사용

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
    // 검색 시 업로드 이미지 URL도 제거

    const query = qs.stringify({
      ingredients: ingredientNamesInKorean.join(','),
      ...(kind && { kind: kindValue }),
      //...(situation && { situation }),
      //...(method && { method }),
    });
    navigate(`/recipes?${query}`);

    console.log("recipe 전달 data:", query)
    };

  const isSearchDisabled = ingredients.length === 0;

  // cursor 수정 - 초기화 함수 개선
  const handleReset = () => {
    // 사진 검색 결과가 있으면 유지, 없으면 완전 초기화
    if (ingredientsFromPhoto && ingredientsFromPhoto.length > 0) {
      // 사진 검색 결과가 있으면 선택된 재료만 초기화
      setIngredients([]);
      setPreference('');
      setKind('');
      setLevel('');
      sessionStorage.removeItem("searchInputs");
      console.log("✅ 선택된 재료만 초기화되었습니다. (사진 검색 결과 유지)");
      // 초기화 시 업로드 이미지 URL도 제거 (삭제)
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
      // 초기화 시 업로드 이미지 URL도 제거 (삭제)
    }
  };

  // 이미지 클릭 시 모달 토글
  const toggleImageModal = () => {
    setShowImageModal(!showImageModal);
  };

  return (
    <div className="ingredient-search-layout">
      {/* 디버깅 토글 버튼 및 디버깅 창 */}
      {/* 좌측 고정 선택 박스 */}
      <div className="selected-ingredients-fixed">
        <p className="text-prefer">
          <img src={prefIcon} alt="선호도 아이콘" style={{ width: '1.3em', height: '1.3em', marginRight: '0.1em', verticalAlign: 'middle' }} />
          선호도 & 타입 선택
        </p>
        <div className="selected-ingredients-row buttons">
          {getSelectedMeta().map(({ type, value }) => (
            <button key={type + value} onClick={() => handleToggle(type, value)}>
              <span>{getLabelText(type, value)}</span>
               <span>✖</span>
            </button>
          ))}
        </div>
        
        {/* 탭 네비게이션 */}
        <div className="tab-navigation">
          <button 
            className={`tab-button ${activeTab === 'preference' ? 'active' : ''}`}
            onClick={() => setActiveTab('preference')}
          >
            선호도
          </button>
          <button 
            className={`tab-button ${activeTab === 'kind' ? 'active' : ''}`}
            onClick={() => setActiveTab('kind')}
          >
            종류별
          </button>
          <button 
            className={`tab-button ${activeTab === 'level' ? 'active' : ''}`}
            onClick={() => setActiveTab('level')}
          >
            난이도별
          </button>
        </div>
        
        {/* 탭 콘텐츠 */}
        <div className="tab-content">
          {activeTab === 'preference' && (
            <div className="section">
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
            </div>
          )}
          
          {activeTab === 'kind' && (
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
            </div>
          )}
          
          {activeTab === 'level' && (
            <div className="section">
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
          )}
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
          ingredientsWithConfidence={filteredIngredientsFromPhoto}
          confidenceThreshold={confidenceThreshold}
        />
      </div>
    </div>
      {/* 미리보기 이미지는 현재 위치에 유지 */}
      {previewUrl && (
        <div style={{ marginTop: 18, textAlign: 'center' }}>
          <img 
            src={previewUrl} 
            alt="업로드 이미지" 
            style={{ maxWidth: 140, maxHeight: 140, borderRadius: 10, boxShadow: '0 2px 8px #0002', background: '#fff', display: 'block', margin: '0 auto', cursor: 'pointer', transition: 'transform 0.2s ease' }}
            onClick={toggleImageModal}
            onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.target.style.transform = 'scale(1)'}
          />
          <div style={{ fontSize: '0.93rem', color: '#888', textAlign: 'center', marginTop: 4 }}>업로드한 사진 (클릭하여 확대)</div>
          
          {/* bounding box 이미지 토글 버튼 */}
          {fullBboxImageUrl && (
            <div style={{ marginTop: 12, textAlign: 'center' }}>
              <button
                onClick={toggleBboxModal}
                style={{
                  background: 'linear-gradient(135deg, #ff9800, #f57c00)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '8px 16px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(255, 152, 0, 0.3)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
              >
                🔍 탐지결과 보기
              </button>
            </div>
          )}
        </div>
      )}
      {/* 이미지 모달 */}
      {showImageModal && previewUrl && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            cursor: 'pointer'
          }}
          onClick={toggleImageModal}
        >
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
            <img 
              src={previewUrl} 
              alt="업로드 이미지 확대" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%', 
                borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                cursor: 'default'
              }}
              onClick={e => e.stopPropagation()}
            />
            <button
              onClick={toggleImageModal}
              style={{
                position: 'absolute',
                top: -40,
                right: 0,
                background: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#333'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* bounding box 이미지 모달 */}
      {showBboxModal && fullBboxImageUrl && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            cursor: 'pointer'
          }}
          onClick={toggleBboxModal}
        >
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
            <img 
              src={fullBboxImageUrl} 
              alt="탐지 결과 이미지" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%', 
                borderRadius: 12,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                cursor: 'default'
              }}
              onClick={e => e.stopPropagation()}
            />
            <button
              onClick={toggleBboxModal}
              style={{
                position: 'absolute',
                top: -40,
                right: 0,
                background: 'rgba(255, 255, 255, 0.9)',
                border: 'none',
                borderRadius: '50%',
                width: 32,
                height: 32,
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#333'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {/* 검색/초기화 버튼을 아래쪽 고정 위치로 이동 */}
      <div className="fixed-bottom-buttons">
        <button
          className="search-btn"
          onClick={handleSearch}
          disabled={isSearchDisabled}
        >
         <img src={searchIcon} alt="검색 아이콘" style={{ width: '1.2em', height: '1.2em', marginRight: '0.3em', verticalAlign: 'middle' }} />
         검색
        </button>
        <button
          className="search-btn reset-btn"
          onClick={handleReset}
        >
         초기화
        </button>
      </div>
    </div>
  );
}

export default IngredientSearchPage;
