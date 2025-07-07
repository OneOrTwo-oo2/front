import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import confetti from 'canvas-confetti';
import './MyinfoPage.css';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

Modal.setAppElement('#root');

function MyinfoPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('');
  const [folderRecipes, setFolderRecipes] = useState({});
  const [bookmarks, setBookmarks] = useState([]);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
    }

    if (token) {
      const decoded = jwtDecode(token);
      console.log("📌 로그인된 유저 ID:", decoded.user_id);
      fetchBookmarks();
      fetchFolders();
    }

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
      const res = await axios.get("http://localhost:8000/api/bookmarks", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookmarks(res.data);
    } catch (err) {
      console.error("북마크 불러오기 실패:", err);
    }
  };

  const fetchFolders = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/folders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFolders(res.data);
    } catch (err) {
      console.error("폴더 목록 불러오기 실패:", err);
    }
  };

  const handleCardClick = (recipe) => {
    navigate("/recipes/detail", { state: { link: recipe.link } });
  };

     const handleCreateFolder = async () => {
      let folderName = prompt("새 폴더 이름을 입력하세요:");

      // 자동 문자열 변환 + 공백 제거
      if (folderName === null) return; // 사용자가 취소 누름

      folderName = String(folderName).trim();

      if (folderName === "") {
        alert("올바른 폴더 이름을 입력하세요.");
        return;
      }

      try {
        const res = await axios.post("http://localhost:8000/api/folders",
          { name: folderName },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        console.log("📦 폴더 생성 응답:", res.data);  // ✅ 여기!
        setFolders(prev => [...prev, res.data]);
        setSelectedFolder(res.data.name);
        console.log("✅ 선택된 폴더:", res.data.name);  // ✅ 여기!
      } catch (err) {
        console.error("폴더 생성 실패:", err);
        alert("폴더 생성 실패");
      }
    };


  const handleFolderChange = async (folderName) => {
    setSelectedFolder(folderName);

    const folder = folders.find(f => f.name === folderName);
    if (!folder) return;

    try {
      const res = await axios.get(`http://localhost:8000/api/folders/${folder.id}/recipes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFolderRecipes(prev => ({ ...prev, [folderName]: res.data }));
    } catch (err) {
      console.error("폴더 레시피 조회 실패:", err);
    }
  };

  const handleAddToFolder = async (recipeId) => {
    if (!bookmarks.some(b => b.id === recipeId)) {
      alert("해당 레시피는 북마크되지 않았습니다!");
      return;
    }

    const folder = folders.find(f => f.name === selectedFolder);

    if (!folder) return alert("폴더를 먼저 선택해주세요.");

    try {
      await axios.post(`http://localhost:8000/api/folders/${folder.id}/recipes`, {
        recipe_id: recipeId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setFolderRecipes(prev => {
        const updated = { ...prev };
        updated[selectedFolder] = [...(updated[selectedFolder] || []), bookmarks.find(r => r.id === recipeId)];
        return updated;
      });
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "폴더에 추가 실패";
      alert(errorMsg);
      console.error("폴더에 추가 실패:", err);
    }
  };

  const handleRemoveRecipeFromFolder = async (recipeId) => {
    const folder = folders.find(f => f.name === selectedFolder);
    if (!folder) return;

    try {
      await axios.delete(`http://localhost:8000/api/folders/${folder.id}/recipes/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` }
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
    try {
      const decoded = jwtDecode(token);
      const userId = decoded.user_id;

      await axios.delete("http://localhost:8000/api/bookmark", {
        params: { userId, recipeId }
      });

      setBookmarks(bookmarks.filter((recipe) => recipe.id !== recipeId));
      alert("북마크가 삭제되었습니다.");
    } catch (err) {
      console.error("북마크 삭제 실패:", err);
    }
  };

  const handleDeleteFolder = async (folderName) => {
    const folder = folders.find(f => f.name === folderName);
    if (!folder) return;

    if (!window.confirm(`${folderName} 폴더를 삭제할까요?`)) return;

    try {
      await axios.delete(`http://localhost:8000/api/folders/${folder.id}`, {
        headers: { Authorization: `Bearer ${token}` }
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

  const getRecipesInFolder = (folderName) => {
    return folderRecipes[folderName] || [];
  };

  const filteredRecipes = bookmarks.filter(recipe =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              {folders.map((f, i) => <option key={i} value={f.name}>{f.name}</option>)}
            </select>
          )}
        </div>

        <div className="bookmark-section">
          <h3>북마크된 레시피</h3>
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
        </div>

        {selectedFolder && (
          <div>
            <h3>{selectedFolder} 폴더에 저장된 레시피</h3>
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

        {folders.length > 0 && (
          <div>
            {folders.map((f, i) => (
              <div key={i} className="folder-item">
                <span>{f.name}</span>
                <button onClick={() => handleDeleteFolder(f.name)}>삭제</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyinfoPage;