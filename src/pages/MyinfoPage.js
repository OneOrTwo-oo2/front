import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import Modal from 'react-modal';
import confetti from 'canvas-confetti';
import './MyinfoPage.css';

Modal.setAppElement('#root');

function MyinfoPage() {
  const location = useLocation();
  const isNewUser = location.state?.isNewUser || false;

  const [isOpen, setIsOpen] = useState(isNewUser);
  const [searchTerm, setSearchTerm] = useState('');
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [folderRecipes, setFolderRecipes] = useState({});
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    if (isNewUser) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 1.0 },
        angle: 90,
        startVelocity: 45,
      });
    }
    fetchBookmarks();
  }, [isNewUser]);

  const getUserIdFromSession = () => {
    return 1;
  };

  const fetchBookmarks = async () => {
    const userId = getUserIdFromSession();
    try {
      const res = await axios.get('http://localhost:8000/api/bookmarks', { params: { userId } });
      setBookmarks(res.data);
    } catch (err) {
      console.error('북마크 조회 실패:', err);
    }
  };

  const handleCreateFolder = () => {
    const folderName = prompt("새 폴더 이름을 입력하세요:");
    if (folderName && !folders.includes(folderName)) {
      setFolders([...folders, folderName]);
      setFolderRecipes(prev => ({ ...prev, [folderName]: [] }));
    } else if (folders.includes(folderName)) {
      alert("이미 존재하는 폴더입니다.");
    }
  };

  const handleFolderChange = (folderName) => {
    setSelectedFolder(folderName);
  };

  const handleDeleteFolder = (folderName) => {
    if (window.confirm(`${folderName} 폴더를 삭제할까요?`)) {
      setFolders(folders.filter(f => f !== folderName));
      const updated = { ...folderRecipes };
      delete updated[folderName];
      setFolderRecipes(updated);
      if (selectedFolder === folderName) setSelectedFolder('');
    }
  };

  const handleAddToFolder = (recipeId) => {
     // 🔐 북마크에 존재하는 레시피인지 확인
    if (!bookmarks.some(b => b.id === recipeId)) {
    alert("해당 레시피는 북마크되지 않았습니다!");
    return;
    }
    if (selectedFolder) {
      setFolderRecipes(prev => {
        const updated = { ...prev };
        updated[selectedFolder].push(recipeId);
        return updated;
      });
    } else {
      alert("폴더를 먼저 선택해주세요.");
    }
  };

  const getRecipesInFolder = (folderName) => {
    return bookmarks.filter(recipe => folderRecipes[folderName]?.includes(recipe.id));
  };

  const handleRemoveRecipeFromFolder = (recipeId) => {
    if (selectedFolder) {
      setFolderRecipes(prev => {
        const updated = { ...prev };
        updated[selectedFolder] = updated[selectedFolder].filter(id => id !== recipeId);
        return updated;
      });
    }
  };

  const handleRemoveBookmark = async (recipeId) => {
    const userId = getUserIdFromSession();
    try {
      await axios.delete("http://localhost:8000/api/bookmark", { params: { userId, recipeId } });
      setBookmarks(bookmarks.filter((recipe) => recipe.id !== recipeId));
      alert("북마크가 삭제되었습니다.");
    } catch (err) {
      console.error("북마크 삭제 실패:", err);
    }
  };

  const filteredRecipes = bookmarks.filter(recipe =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="myinfo-page">
      {isNewUser && (
        <Modal isOpen={isOpen} onRequestClose={() => setIsOpen(false)}
          style={{ content: { width: '400px', height: '200px', margin: 'auto', textAlign: 'center', borderRadius: '12px', paddingTop: '40px' } }}>
          <h2 style={{ fontSize: '28px' }}>🎉 프로필 설정 완료!</h2>
          <p style={{ fontSize: '20px' }}>이제 추천 레시피를 만나보세요.</p>
          <button onClick={() => setIsOpen(false)} style={{ marginTop: '20px' }}>닫기</button>
        </Modal>
      )}

      <div className="myinfo-content">
        <h2 className="section-title">저장된 레시피</h2>
        <input className="search-input" type="text" placeholder="레시피 검색"
          value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />

        <div className="folder-management">
          <h3>모든 레시피</h3>
          <button onClick={handleCreateFolder}>새 폴더 만들기</button>
          {folders.length > 0 && (
            <select onChange={(e) => handleFolderChange(e.target.value)} value={selectedFolder}>
              <option value="">폴더 선택</option>
              {folders.map((f, i) => <option key={i} value={f}>{f}</option>)}
            </select>
          )}
        </div>

        <div className="bookmark-section">
          <h3>북마크된 레시피</h3>
          <div className="recipe-grid">
            {bookmarks.length > 0 ? (
              filteredRecipes.map(recipe => (
                <div key={recipe.id} className="recipe-card">
                  <img src={recipe.image} alt={recipe.title} className="recipe-img" />
                  <div className="recipe-info">
                    <h4>{recipe.title}</h4>
                    <p>{recipe.summary}</p>
                    <button onClick={() => handleAddToFolder(recipe.id)}>폴더에 추가</button>
                    <button onClick={() => handleRemoveBookmark(recipe.id)}>삭제</button>
                  </div>
                </div>
              ))
            ) : (
              <p>북마크된 레시피가 없습니다.</p>
            )}
          </div>
        </div>

        {selectedFolder && (
          <div>
            <h3>{selectedFolder} 폴더에 저장된 레시피</h3>
            <div className="recipe-grid">
              {getRecipesInFolder(selectedFolder).map(recipe => (
                <div key={recipe.id} className="recipe-card">
                  <img src={recipe.image} alt={recipe.title} className="recipe-img" />
                  <div className="recipe-info">
                    <h4>{recipe.title}</h4>
                    <p>{recipe.summary}</p>
                    <button onClick={() => handleRemoveRecipeFromFolder(recipe.id)}>폴더에서 제거</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {folders.length > 0 && (
          <div>
            {folders.map((f, i) => (
              <div key={i} className="folder-item">
                <span>{f}</span>
                <button onClick={() => handleDeleteFolder(f)}>삭제</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyinfoPage;
