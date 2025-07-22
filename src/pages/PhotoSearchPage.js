import React, { useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './PhotoSearchPage.css';
import LoadingAnimation from '../components/loading_api';
import aiClient from '../api/aiClient.js';

// 디버깅용 시각화 컴포넌트 및 토글 버튼, 관련 코드 전체 삭제

function PhotoSearchPage() {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(() => sessionStorage.getItem('uploadedImageUrl'));
  const [showPreview, setShowPreview] = useState(false); // 미리보기 토글 상태
  const [showResult, setShowResult] = useState(false); // 결과 보여주기 상태
  const [showDebug, setShowDebug] = useState(false); // 디버깅 토글
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleSearchSuccess = (ingredients, url) => {
    setIsLoading(false);
    navigate('/ingredient-search', { state: { ingredients, previewUrl: url } });
  };

  const processFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    sessionStorage.setItem('uploadedImageUrl', url);

    const formData = new FormData();
    formData.append('file', file);

    setIsLoading(true);

    aiClient.post('/ingredients', formData)
      .then((res) => {
        console.log(res.data.ingredients);
        handleSearchSuccess(res.data.ingredients, url); // url을 명시적으로 넘김
      })
      .catch((error) => {
        console.error('검색 실패:', error);
        setSearchResults([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  // 정확도에 따른 색상 결정 함수
  const getIngredientStyle = (confidence) => {
    const confidencePercent = confidence * 100;
    
    if (confidencePercent >= 70) {
      return {
        background: '#4CAF50', // 초록색 (높은 정확도: 70% 이상)
        color: 'white',
        borderRadius: 12,
        padding: '4px 12px',
        fontSize: '1rem',
        border: '1px solid #45a049'
      };
    } else if (confidencePercent >= 20) {
      return {
        background: '#ff9800', // 주황색 (중간 정확도: 20~70%)
        color: 'white',
        borderRadius: 12,
        padding: '4px 12px',
        fontSize: '1rem',
        border: '1px solid #e68900'
      };
    } else {
      return {
        background: '#f44336', // 빨간색 (낮은 정확도: 20% 미만)
        color: 'white',
        borderRadius: 12,
        padding: '4px 12px',
        fontSize: '1rem',
        border: '1px solid #d32f2f'
      };
    }
  };

  // 업로드한 사진이 없는 경우
  const hasPrevImage = !!previewUrl;

  return (
    <div className="photo-upload-page">
      <div className="styled-drop">
        {/* 결과 화면 */}
        {/* 분석 결과가 오면 바로 ingredient-search 페이지로 이동 */}
        {isLoading && (
          <>
            {previewUrl && (
              <div style={{ marginBottom: 16 }}>
                <img src={previewUrl} alt="업로드 이미지" style={{ maxWidth: 120, borderRadius: 8, boxShadow: '0 2px 8px #0001', background: '#fff', display: 'block', margin: '0 auto' }} />
                <div style={{ fontSize: '0.9rem', color: '#888', textAlign: 'center', marginTop: 4 }}>업로드한 사진</div>
              </div>
            )}
            <LoadingAnimation />
            <div style={{ marginTop: '18px', color: '#888', fontSize: '0.98rem', textAlign: 'center' }}>
              검색 중입니다...<br />
              <span style={{ fontSize: '0.93rem', color: '#aaa' }}>
                혹시나 누락되거나 잘못된 재료가 있다면 이후 화면에서 수정해주세요
              </span>
            </div>
          </>
        )}
        {/* 분석 결과가 오면 바로 ingredient-search 페이지로 이동 */}
        {!isLoading && (
          <>
            <div className="upload-icon">📷</div>
            <h2 className="upload-title">사진을 끌어다 놓으세요</h2>
            <h2 className="upload-title">또는</h2>
            <button
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              PC에서 불러오기
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            {/* 미리보기 이미지는 업로드한 사진이 있을 때만 */}
            {hasPrevImage && (
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                <img src={previewUrl} alt="업로드 이미지" style={{ maxWidth: 120, borderRadius: 8, boxShadow: '0 2px 8px #0001', background: '#fff', display: 'block', margin: '0 auto' }} />
                <div style={{ fontSize: '0.9rem', color: '#888', textAlign: 'center', marginTop: 4 }}>
                  전에 선택한 사진
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default PhotoSearchPage;