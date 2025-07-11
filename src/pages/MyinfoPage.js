import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import confetti from 'canvas-confetti';
import './MyinfoPage.css';
import { useNavigate, Link } from 'react-router-dom';
import { fetchWithAutoRefresh } from '../utils/fetchWithAuth';

Modal.setAppElement('#root');

function MyinfoPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [folderRecipes, setFolderRecipes] = useState({});
  const [bookmarks, setBookmarks] = useState([]);
  const [activeTab, setActiveTab] = useState('bookmark');

  const navigate = useNavigate();

  useEffect(() => {
    fetchBookmarks();
    fetchFolders();

    if (window.location.state?.isNewUser) {
      setIsOpen(true);
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 1.0 },
        angle: 90,
        startVelocity: 45,
      });
    }
  }, []);

  const fetchBookmarks = async () => {
    try {
      const res = await fetchWithAutoRefresh("/api/bookmarks", { method: "GET" });
      const data = res.data;
      setBookmarks(data);
    } catch (err) {
      console.error("북마크 불러오기 실패:", err);
    }
  };

  const fetchFolders = async () => {
    try {
      const res = await fetchWithAutoRefresh("/api/folders", { method: "GET" });
      const data = res.data;
      setFolders(data);
    } catch (err) {
      console.error("폴더 목록 불러오기 실패:", err);
    }
  };

  const handleCardClick = (recipe) => {
    navigate("/recipes/detail", { state: { link: recipe.link } });
  };

  const handleCreateFolder = async () => {
    let folderName = prompt("새 폴더 이름을 입력하세요:");
    if (folderName === null) return;
    folderName = String(folderName).trim();
    if (folderName === "") return alert("올바른 폴더 이름을 입력하세요.");

    try {
      const res = await fetchWithAutoRefresh("/api/folders", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: folderName })
      });
      const data = res.data;
      setFolders(prev => [...prev, data]);
      setSelectedFolder(data.name);
    } catch (err) {
      console.error("폴더 생성 실패:", err);
    }
  };

  const handleFolderChange = async (folderName) => {
    setSelectedFolder(folderName);
    const folder = folders.find(f => f.name === folderName);
    if (!folder) return;

    try {
      const res = await fetchWithAutoRefresh(`/api/folders/${folder.id}/recipes`);
      const data = res.data;
      setFolderRecipes(prev => ({ ...prev, [folderName]: data }));
    } catch (err) {
      console.error("폴더 레시피 조회 실패:", err);
    }
  };

  const handleAddToFolder = async (recipeId) => {
    if (!bookmarks.some(b => b.id === recipeId)) return alert("북마크 먼저 해주세요!");
    const folder = folders.find(f => f.name === selectedFolder);
    if (!folder) return alert("폴더를 먼저 선택해주세요.");

    try {
      const res = await fetchWithAutoRefresh(`/api/folders/${folder.id}/recipes`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipe_id: recipeId })
      });

      if (!res.status || res.status >= 400) {
        const error = res.data;
        alert(error.detail || "이미 추가된 레시피입니다.");
        return;
      }

      const recipeToAdd = bookmarks.find(r => r.id === recipeId);
      setFolderRecipes(prev => {
        const updated = { ...prev };
        updated[selectedFolder] = [...(updated[selectedFolder] || []), recipeToAdd];
        return updated;
      });
    } catch (err) {
      console.error("폴더에 추가 실패:", err);
    }
  };

  const handleRemoveRecipeFromFolder = async (recipeId) => {
    const folder = folders.find(f => f.name === selectedFolder);
    if (!folder) return;

    try {
      await fetchWithAutoRefresh(`/api/folders/${folder.id}/recipes/${recipeId}`, {
        method: "DELETE"
      });

      setFolderRecipes(prev => {
        const updated = { ...prev };
        updated[selectedFolder] = updated[selectedFolder].filter(r => r.id !== recipeId);
        return updated;
      });
    } catch (err) {
      console.error("폴더에서 제거 실패:", err);
    }
  };

  const handleRemoveBookmark = async (recipeId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await fetchWithAutoRefresh(`/api/bookmark?recipeId=${recipeId}`, {
        method: "DELETE"
      });

      setBookmarks(prev => prev.filter(r => r.id !== recipeId));

      setFolderRecipes(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(folderName => {
          updated[folderName] = updated[folderName].filter(r => r.id !== recipeId);
        });
        return updated;
      });

    } catch (err) {
      console.error("북마크 삭제 실패:", err);
    }
  };

  const handleDeleteFolder = async (folderName) => {
    const folder = folders.find(f => f.name === folderName);
    if (!folder || !window.confirm(`${folderName} 폴더를 삭제할까요?`)) return;

    try {
      await fetchWithAutoRefresh(`/api/folders/${folder.id}`, {
        method: "DELETE"
      });
      setFolders(folders.filter(f => f.name !== folderName));
      const updated = { ...folderRecipes };
      delete updated[folderName];
      setFolderRecipes(updated);
      if (selectedFolder === folderName) setSelectedFolder('');
    } catch (err) {
      console.error("폴더 삭제 실패:", err);
    }
  };

  const getRecipesInFolder = (folderName) => folderRecipes[folderName] || [];
  const filteredRecipes = bookmarks.filter(recipe => recipe.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="myinfo-page">
      {isOpen && (
        <Modal isOpen={isOpen} onRequestClose={() => setIsOpen(false)}
          style={{ content: { width: '400px', height: '200px', margin: 'auto', textAlign: 'center', borderRadius: '12px', paddingTop: '40px' } }}>
          <h2 style={{ fontSize: '28px' }}>🎉 프로필 설정 완료!</h2>
          <p style={{ fontSize: '20px' }}>이제 추천 레시피를 만나보세요.</p>
          <button onClick={() => setIsOpen(false)} style={{ marginTop: '20px' }}>닫기</button>
        </Modal>
      )}

      <div className="tab-buttons">
        <button className={activeTab === 'bookmark' ? 'active' : ''} onClick={() => setActiveTab('bookmark')}>전체</button>
        <button className={activeTab === 'folder' ? 'active' : ''} onClick={() => setActiveTab('folder')}>폴더</button>
      </div>

      <div className="myinfo-content">
        {activeTab === 'bookmark' && (
          <>
            <div className="myinfo-header">
              <h2 className="section-title">북마크된 모든 레시피</h2>
              <Link to="/preference">
                <button className="edit-preference-btn">질병 편집</button>
              </Link>
            </div>

            <input className="search-input" type="text" placeholder="레시피 검색"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />

            <div className="recipe-grid">
              {bookmarks.length > 0 ? (
                filteredRecipes.map(recipe => (
                  <div key={recipe.id} className="recipe-card" onClick={() => handleCardClick(recipe)}>
                    <img src={recipe.image} alt={recipe.title} className="recipe-img" />
                    <div className="recipe-info">
                      <h4>{recipe.title}</h4>
                      <p>{recipe.summary}</p>
                      <button onClick={(e) => { e.stopPropagation(); handleAddToFolder(recipe.id); }}>폴더에 추가</button>
                      <button onClick={(e) => { e.stopPropagation(); handleRemoveBookmark(recipe.id); }}>삭제</button>
                    </div>
                  </div>
                ))
              ) : (
                <p>북마크된 레시피가 없습니다.</p>
              )}
            </div>
          </>
        )}

        {activeTab === 'folder' && (
          <>
            <div className="folder-management">
              <button onClick={handleCreateFolder}>새 폴더 만들기</button>
              {folders.length > 0 && (
                <select onChange={(e) => handleFolderChange(e.target.value)} value={selectedFolder}>
                  <option value="">폴더 선택</option>
                  {folders.map((f, i) => <option key={i} value={f.name}>{f.name}</option>)}
                </select>
              )}
            </div>

            {selectedFolder && (
              <div>
                <div className="folder-title-container">
                  <h3 className="folder-title">{selectedFolder} 폴더에 저장된 레시피</h3>
                  <button className="delete-folder-btn" onClick={() => handleDeleteFolder(selectedFolder)}>폴더 삭제</button>
                </div>
                <div className="recipe-grid">
                  {getRecipesInFolder(selectedFolder).map(recipe => (
                    <div key={recipe.id} className="recipe-card" onClick={() => handleCardClick(recipe)}>
                      <img src={recipe.image} alt={recipe.title} className="recipe-img" />
                      <div className="recipe-info">
                        <h4>{recipe.title}</h4>
                        <p>{recipe.summary}</p>
                        <button onClick={(e) => { e.stopPropagation(); handleRemoveRecipeFromFolder(recipe.id); }}>폴더에서 제거</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MyinfoPage;
