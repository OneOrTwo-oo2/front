import React, { useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './PhotoSearchPage.css';
import LoadingAnimation from '../components/loading_api';
import aiClient from '../api/aiClient.js';

function PhotoSearchPage() {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  const handleSearchSuccess = (labels) => {
    setSearchResults(labels);       // 현재 페이지 상태에도 저장
    navigate('/ingredient-search', { state: { labels } }); // 다음 페이지로 전달
  };

  const processFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;

    setPreviewUrl(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append('file', file);

    setIsLoading(true);

    aiClient.post('/ingredients', formData)
      .then((res) => {
        console.log(res.data.labels);
        handleSearchSuccess(res.data.labels);
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

  return (
    <div className="photo-upload-page">
      <div className="styled-drop">
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
          </>
        )}

        {previewUrl && (
          <img src={previewUrl} alt="미리보기" className="uploaded-image-preview" />
        )}

        {isLoading && (
          <LoadingAnimation />
        )}
      </div>
    </div>
  );
}

export default PhotoSearchPage;