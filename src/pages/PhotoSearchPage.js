import React, { useState } from 'react';
import './PhotoSearchPage.css'; // CSS 파일 따로 분리 추천

function PhotoSearchPage() {
  const [image, setImage] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        handleSearch(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        handleSearch(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = (image) => {
    setSearchResults([
      { title: "레시피 1", description: "설명 1", imageUrl: image },
      { title: "레시피 2", description: "설명 2", imageUrl: image },
    ]);
  };

  return (
    <div className="photo-upload-page">
      <div
        className="drop-area"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <div className="upload-icon">📷</div>
        <h2 className="upload-title">사진을 끌어다 놓으세요</h2>
        <h2 className="upload-title">또는</h2>
        <button
          className="upload-btn"
          onClick={() => document.getElementById('file-upload').click()}
        >
          PC에서 불러오기
        </button>
        <input
          type="file"
          id="file-upload"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
        {image && <img src={image} alt="업로드된 이미지" className="uploaded-image-preview" />}
      </div>

      {searchResults.length > 0 && (
        <div className="results">
          {searchResults.map((result, index) => (
            <div key={index} className="result-item">
              <img src={result.imageUrl} alt={`레시피 ${index + 1}`} />
              <div className="recipe-info">
                <p>{result.title}</p>
                <p>{result.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PhotoSearchPage;
