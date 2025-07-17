import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import confetti from 'canvas-confetti';
import './MyinfoPage.css';
import { useNavigate, Link } from 'react-router-dom';
import { fetchWithAutoRefresh } from '../utils/fetchWithAuth';
import PreferenceToggleSection from '../components/PreferenceToggleSection';

Modal.setAppElement('#root');

function MyinfoPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('전체');
  const [folderRecipes, setFolderRecipes] = useState({});
  const [bookmarks, setBookmarks] = useState([]);
  const [activeTab, setActiveTab] = useState('folder'); // 기본값 'folder'로 변경
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [addToFolderModal, setAddToFolderModal] = useState({ open: false, recipeId: null });
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

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
    if (!newFolderName.trim()) return;
    
    try {
      const res = await fetchWithAutoRefresh("/api/folders", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newFolderName.trim() })
      });
      const data = res.data;
      setFolders(prev => [...prev, data]);
      setSelectedFolder(data.name);
      setNewFolderName('');
      setShowFolderModal(false);
    } catch (err) {
      console.error("폴더 생성 실패:", err);
    }
  };

  const handleFolderChange = async (folderName) => {
    setSelectedFolder(folderName);
    if (folderName === '전체') return;
    
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
    if (selectedFolder === '전체') return alert("폴더를 먼저 선택해주세요.");
    
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
      if (selectedFolder === folderName) setSelectedFolder('전체');
    } catch (err) {
      console.error("폴더 삭제 실패:", err);
    }
  };

  const getRecipesInFolder = (folderName) => {
    if (folderName === '전체') {
      return bookmarks.filter(recipe => recipe.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return (folderRecipes[folderName] || []).filter(recipe => 
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const currentRecipes = getRecipesInFolder(selectedFolder);

  // 폴더에 레시피 추가 모달 열기
  const openAddToFolderModal = (recipeId) => {
    setAddToFolderModal({ open: true, recipeId });
  };
  // 폴더에 레시피 추가 모달 닫기
  const closeAddToFolderModal = () => {
    setAddToFolderModal({ open: false, recipeId: null });
  };

  // 폴더 선택 후 레시피 추가
  const handleAddToFolderWithSelect = async (folderName) => {
    const folder = folders.find(f => f.name === folderName);
    if (!folder) return alert('폴더를 선택해주세요.');
    try {
      const res = await fetchWithAutoRefresh(`/api/folders/${folder.id}/recipes`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipe_id: addToFolderModal.recipeId })
      });
      if (!res.status || res.status >= 400) {
        const error = res.data;
        alert(error.detail || "이미 추가된 레시피입니다.");
        return;
      }
      // 폴더 레시피 새로고침
      await handleFolderChange(folder.name);
      closeAddToFolderModal();
      alert('폴더에 추가되었습니다!');
    } catch (err) {
      console.error("폴더에 추가 실패:", err);
      alert('추가에 실패했습니다.');
    }
  };

  // 북마크 전체 삭제
  const handleDeleteAllBookmarks = async () => {
    try {
      await fetchWithAutoRefresh('/api/bookmarks/all', { method: 'DELETE' });
      setBookmarks([]);
      setFolderRecipes({});
      setShowDeleteAllModal(false);
      alert('모든 북마크가 삭제되었습니다.');
    } catch (err) {
      alert('전체 삭제에 실패했습니다.');
    }
  };

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

      {showFolderModal && (
        <Modal 
          isOpen={showFolderModal} 
          onRequestClose={() => setShowFolderModal(false)}
          className="folder-modal"
          overlayClassName="folder-modal-overlay"
        >
          <div className="folder-modal-content">
            <h3>새 폴더 만들기</h3>
            <input
              type="text"
              placeholder="폴더 이름을 입력하세요"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
            />
            <div className="folder-modal-buttons">
              <button onClick={() => setShowFolderModal(false)}>취소</button>
              <button onClick={handleCreateFolder}>만들기</button>
            </div>
          </div>
        </Modal>
      )}

      {/* 폴더에 추가 모달 */}
      {addToFolderModal.open && (
        <Modal
          isOpen={addToFolderModal.open}
          onRequestClose={closeAddToFolderModal}
          className="folder-modal"
          overlayClassName="folder-modal-overlay"
        >
          <div className="folder-modal-content">
            <h3>폴더 선택</h3>
            <select
              style={{ width: '100%', padding: '12px', fontSize: '16px', borderRadius: '8px', marginBottom: '20px' }}
              defaultValue=""
              onChange={e => handleAddToFolderWithSelect(e.target.value)}
            >
              <option value="" disabled>폴더를 선택하세요</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.name}>{folder.name}</option>
              ))}
            </select>
            <button onClick={closeAddToFolderModal} style={{ padding: '8px 24px', borderRadius: '8px', background: '#6c757d', color: 'white', border: 'none', fontSize: '16px', fontWeight: 500, margin: '0 auto', display: 'block' }}>취소</button>
          </div>
        </Modal>
      )}

      {/* 왼쪽 탭 구조 */}
      <div className="side-tab-bar">
        <button
          className={`side-tab-btn${activeTab === 'folder' ? ' active' : ''}`}
          onClick={() => setActiveTab('folder')}
        >
          폴더
        </button>
        <button
          className={`side-tab-btn${activeTab === 'preference' ? ' active' : ''}`}
          onClick={() => setActiveTab('preference')}
        >
          질병편집
        </button>
      </div>

      <div className="myinfo-content">
        {activeTab === 'folder' && (
          <div className="bookmark-layout">
            <div className="folder-sidebar">
              <div className="folder-list">
                <div 
                  className={`folder-item ${selectedFolder === '전체' ? 'active' : ''}`}
                  onClick={() => handleFolderChange('전체')}
                >
                  <span className="folder-icon">📁</span>
                  <span className="folder-name">전체</span>
                  <span className="folder-count">({bookmarks.length})</span>
                </div>
                {folders.map((folder) => (
                  <div 
                    key={folder.id}
                    className={`folder-item ${selectedFolder === folder.name ? 'active' : ''}`}
                    onClick={() => handleFolderChange(folder.name)}
                  >
                    <span className="folder-icon">📂</span>
                    <span className="folder-name">{folder.name}</span>
                    <span className="folder-count">({getRecipesInFolder(folder.name).length})</span>
                    <button 
                      className="delete-folder-btn-small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFolder(folder.name);
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button 
                className="add-folder-btn"
                onClick={() => setShowFolderModal(true)}
              >
                <span>+</span> 새 폴더
              </button>
            </div>

            <div className="recipe-section">
              <div className="recipe-header">
                <h2 className="section-title">
                  {selectedFolder === '전체' ? '북마크된 모든 레시피' : `${selectedFolder} 폴더`}
                </h2>
                <button className="delete-all-btn" onClick={() => setShowDeleteAllModal(true)}>
                  북마크 전체 삭제
                </button>
              </div>

              <input 
                className="search-input" 
                type="text" 
                placeholder="레시피 검색"
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />

              <div className="recipe-grid">
                {currentRecipes.length > 0 ? (
                  currentRecipes.map(recipe => (
                    <div key={recipe.id} className="recipe-card" onClick={() => handleCardClick(recipe)}>
                      <img src={recipe.image} alt={recipe.title} className="recipe-img" />
                      <div className="recipe-info">
                        <h4>{recipe.title}</h4>
                        <p>{recipe.summary}</p>
                        <div className="recipe-actions">
                          {selectedFolder !== '전체' && (
                            <button 
                              className="action-btn remove-btn"
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleRemoveRecipeFromFolder(recipe.id); 
                              }}
                            >
                              폴더에서 제거
                            </button>
                          )}
                          {selectedFolder === '전체' && (
                            <button 
                              className="action-btn add-btn"
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                openAddToFolderModal(recipe.id); 
                              }}
                            >
                              폴더에 추가
                            </button>
                          )}
                          <button 
                            className="action-btn delete-btn"
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              handleRemoveBookmark(recipe.id); 
                            }}
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>북마크된 레시피가 없습니다.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {activeTab === 'preference' && (
          <div className="preference-section">
            <PreferenceToggleSection />
          </div>
        )}
      </div>
      {/* 북마크 전체 삭제 확인 모달 */}
      {showDeleteAllModal && (
        <Modal
          isOpen={showDeleteAllModal}
          onRequestClose={() => setShowDeleteAllModal(false)}
          className="folder-modal"
          overlayClassName="folder-modal-overlay"
        >
          <div className="folder-modal-content">
            <h3>정말 모든 북마크를 삭제하시겠습니까?</h3>
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => setShowDeleteAllModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#6c757d', color: 'white', border: 'none' }}>취소</button>
              <button onClick={handleDeleteAllBookmarks} style={{ flex: 1, padding: '12px', borderRadius: '8px', background: '#dc3545', color: 'white', border: 'none' }}>전체 삭제</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default MyinfoPage;
