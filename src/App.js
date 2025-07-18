// src/App.jsx //
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './utils/AuthContext';
import PrivacyPage from './components/PrivacyPage'; //추가
import HelpPage from './pages/HelpPage'; //추가

// pages
import MainPage from './pages/MainPage';
import IngredientSearchPage from './pages/IngredientSearchPage';
import PhotoSearchPage from './pages/PhotoSearchPage';
import MyInfo from './pages/MyinfoPage';
import RecipeListPage from './pages/RecipeListPage';
import RandomRecipePage from './pages/RandomRecipePage';
import LoginPage from './pages/LoginPage';
import RecipeDetailPage from './pages/RecipeDetailPage';

// onboarding components
import PreferenceToggleSection from './components/PreferenceToggleSection';
import ConditionPage from './components/ConditionPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 로그인 페이지는 누구나 접근 가능 */}
          <Route path="/login" element={<LoginPage />} />

          {/* 온보딩 관련 페이지도 보호 안 함 */}
          <Route path="/preference" element={<PreferenceToggleSection />} />
          <Route path="/condition" element={<ConditionPage />} />

          {/* 공통 레이아웃 아래 보호된 페이지들 */}
          <Route element={<Layout />}>
            <Route path="/" element={<ProtectedRoute element={<MainPage />} />} />
            <Route path="/main" element={<ProtectedRoute element={<MainPage />} />} />
            <Route path="/ingredient-search" element={<ProtectedRoute element={<IngredientSearchPage />} />} />
            <Route path="/photo-search" element={<ProtectedRoute element={<PhotoSearchPage />} />} />
            <Route path="/myinfo" element={<ProtectedRoute element={<MyInfo />} />} />
            <Route path="/recipes" element={<ProtectedRoute element={<RecipeListPage />} />} />
            <Route path="/theme" element={<RandomRecipePage />} />
            <Route path="/theme/*" element={<ProtectedRoute element={<RandomRecipePage />} />} />
            <Route path="/recipes/detail" element={<RecipeDetailPage />} /> {/* ❗비보호 라우트 */}
            <Route path="/privacy" element={<PrivacyPage />} /> //추가
            <Route path="/help" element={<HelpPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}


export default App;