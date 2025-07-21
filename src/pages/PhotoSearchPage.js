import React, { useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './PhotoSearchPage.css';
import LoadingAnimation from '../components/loading_api';
import aiClient from '../api/aiClient.js';

function PhotoSearchPage() {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(() => sessionStorage.getItem('uploadedImageUrl'));
  const [showPreview, setShowPreview] = useState(false); // 미리보기 토글 상태
  const [showResult, setShowResult] = useState(false); // 결과 보여주기 상태
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5); // 정확도 임계값
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleSearchSuccess = (ingredients) => {
    setSearchResults(ingredients); // 결과 저장
    setShowResult(true); // 결과 보여주기
    setIsLoading(false);
    // 1.5초 후 자동 이동
    setTimeout(() => {
      navigate('/ingredient-search', { state: { ingredients, previewUrl, confidenceThreshold } });
    }, 1500);
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
        handleSearchSuccess(res.data.ingredients);
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

  return (
    <div className="photo-upload-page">
      <div className="styled-drop">
        {/* 결과 화면 */}
        {showResult ? (
          <div className="result-section" style={{ textAlign: 'center', padding: '32px 0' }}>
            <div style={{ marginBottom: 16 }}>
              {previewUrl && (
                <img src={previewUrl} alt="미리보기" style={{ maxWidth: 180, borderRadius: 8, boxShadow: '0 2px 8px #0001' }} />
              )}
            </div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>추출된 재료</div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
              {searchResults && searchResults.length > 0 ? (
                searchResults.map((item, idx) => (
                  <span 
                    key={idx} 
                    style={getIngredientStyle(item.confidence)}
                    title={`정확도: ${(item.confidence * 100).toFixed(1)}%`}
                  >
                    {item.label}
                  </span>
                ))
              ) : (
                <span style={{ color: '#aaa' }}>재료 없음</span>
              )}
            </div>
            <div style={{ color: '#888', fontSize: '0.97rem', marginTop: 10 }}>
              초록색: 높은 정확도, 주황색: 중간 정확도, 빨간색: 낮은 정확도. 1.5초 후 재료 선택 화면으로 이동합니다
            </div>
          </div>
        ) : (
          <>
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
                
                {/* 정확도 임계값 설정 - 사진 검색 전에 표시 */}
                <div style={{ 
                  marginTop: 24, 
                  padding: '16px 20px', 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: 12, 
                  border: '1px solid #e9ecef',
                  maxWidth: 400,
                  margin: '24px auto 0'
                }}>
                  <div style={{ 
                    fontSize: '0.95rem', 
                    fontWeight: 600, 
                    color: '#495057', 
                    marginBottom: 12,
                    textAlign: 'center'
                  }}>
                    🔍 정확도 임계값 설정
                  </div>
                  <div style={{ 
                    fontSize: '0.9rem', 
                    color: '#6c757d', 
                    marginBottom: 16,
                    textAlign: 'center'
                  }}>
                    초록색: 70% 이상, 주황색: 20~70%, 빨간색: 20% 미만
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 12,
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '0.85rem', color: '#6c757d', minWidth: 40 }}>10%</span>
                    <input
                      type="range"
                      min="0.1"
                      max="0.9"
                      step="0.1"
                      value={confidenceThreshold}
                      onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                      style={{ 
                        flex: 1, 
                        height: 6, 
                        borderRadius: 3,
                        background: '#dee2e6',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ fontSize: '0.85rem', color: '#6c757d', minWidth: 40 }}>90%</span>
                  </div>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: '#868e96', 
                    marginTop: 8,
                    textAlign: 'center'
                  }}>
                    낮게 설정하면 더 많은 재료가 감지되지만 정확도가 낮을 수 있습니다
                  </div>
                </div>
                
                {/* 미리보기 이미지는 항상 보여줌 */}
                {previewUrl && (
                  <div style={{ marginTop: 16, textAlign: 'center' }}>
                    <img src={previewUrl} alt="업로드 이미지" style={{ maxWidth: 120, borderRadius: 8, boxShadow: '0 2px 8px #0001', background: '#fff', display: 'block', margin: '0 auto' }} />
                    <div style={{ fontSize: '0.9rem', color: '#888', textAlign: 'center', marginTop: 4 }}>업로드한 사진</div>
                  </div>
                )}
              </>
            )}
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
          </>
        )}
      </div>
    </div>
  );
}

export default PhotoSearchPage;