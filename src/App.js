import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { useEffect } from 'react';

// page import
import MainPage from './pages/MainPage';
import IngredientSearchPage from './pages/IngredientSearchPage';
import PhotoSearchPage from './pages/PhotoSearchPage';
import Home from './pages/Home';
import MyInfo from './pages/MyinfoPage';
import RecipeListPage from './pages/RecipeListPage';
import RandomRecipePage from './pages/RandomRecipePage';
import LoginPage from './pages/LoginPage';

import PreferenceToggleSection from './components/PreferenceToggleSection';
import ConditionPage from './components/ConditionPage';

function App() {
  // ✅ 앱 시작 시 로그인 상태 확인
  useEffect(() => {
    fetch('http://localhost:5000/auth/user', {
      credentials: 'include', // 세션 쿠키 포함
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.id) {
          localStorage.setItem('token', 'true'); // 단순히 로그인 여부만 저장
        } else {
          localStorage.removeItem('token');
        }
      })
      .catch((err) => {
        console.error('로그인 상태 확인 실패:', err);
        localStorage.removeItem('token');
      });
  }, []);

  return (
    <Router>
      <Routes>
        {/* 로그인은 보호 없이 */}
        <Route path="/login" element={<LoginPage />} />

        {/* 공통 Layout + 보호된 페이지들 */}
        <Route element={<Layout />}>
          <Route path="/" element={<ProtectedRoute element={<MainPage />} />} />
          <Route path="/main" element={<ProtectedRoute element={<MainPage />} />} />
          <Route path="/ingredient-search" element={<ProtectedRoute element={<IngredientSearchPage />} />} />
          <Route path="/photo-search" element={<ProtectedRoute element={<PhotoSearchPage />} />} />
          <Route path="/home" element={<ProtectedRoute element={<Home />} />} />
          <Route path="/myinfo" element={<ProtectedRoute element={<MyInfo />} />} />
          <Route path="/recipes" element={<ProtectedRoute element={<RecipeListPage />} />} />
          <Route path="/Random-recipe" element={<ProtectedRoute element={<RandomRecipePage />} />} />
        </Route>

        {/* 별도 온보딩 페이지 */}
        <Route path="/preference" element={<PreferenceToggleSection />} />
        <Route path="/condition" element={<ConditionPage />} />
      </Routes>
    </Router>
  );
}

export default App;
