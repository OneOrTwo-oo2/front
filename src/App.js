// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './utils/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AuthLoader from './utils/AuthLoader'; // ✅ 인증 로딩 처리
import Layout from './Layout';

// pages
import MainPage from './pages/MainPage';
import IngredientSearchPage from './pages/IngredientSearchPage';
import PhotoSearchPage from './pages/PhotoSearchPage';
import MyInfo from './pages/MyinfoPage';
import RecipeListPage from './pages/RecipeListPage';
import RandomRecipePage from './pages/RandomRecipePage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import LoginPage from './pages/LoginPage';
import HelpPage from './pages/HelpPage';
import PrivacyPage from './components/PrivacyPage';
import PreferenceToggleSection from './components/PreferenceToggleSection';
import ConditionPage from './components/ConditionPage';

function App() {
  return (
    <AuthProvider>
      <AuthLoader>
        <Router>
          <Routes>
            {/* ❗ 비보호 라우트 */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/preference" element={<PreferenceToggleSection />} />
            <Route path="/condition" element={<ConditionPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/help" element={<HelpPage />} />

            {/* ✅ 보호된 라우트: 공통 Layout 포함 */}
            <Route element={<Layout />}>
              <Route path="/" element={<ProtectedRoute element={<MainPage />} />} />
              <Route path="/main" element={<ProtectedRoute element={<MainPage />} />} />
              <Route path="/ingredient-search" element={<ProtectedRoute element={<IngredientSearchPage />} />} />
              <Route path="/photo-search" element={<ProtectedRoute element={<PhotoSearchPage />} />} />
              <Route path="/myinfo" element={<ProtectedRoute element={<MyInfo />} />} />
              <Route path="/recipes" element={<ProtectedRoute element={<RecipeListPage />} />} />
              <Route path="/theme" element={<ProtectedRoute element={<RandomRecipePage />} />} />
              <Route path="/theme/*" element={<ProtectedRoute element={<RandomRecipePage />} />} />
              <Route path="/recipes/detail" element={<ProtectedRoute element={<RecipeDetailPage />} />} />
            </Route>
          </Routes>
        </Router>
      </AuthLoader>
    </AuthProvider>
  );
}

export default App;
