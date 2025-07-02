import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout';

// page import
import MainPage from './pages/MainPage';
import IngredientSearchPage from './pages/IngredientSearchPage';
import PhotoSearchPage from './pages/PhotoSearchPage';

import MyInfo from './pages/MyinfoPage';
import RecipeListPage from './pages/RecipeListPage';
import RandomRecipePage from './pages/RandomRecipePage';
import RecipeDetailPage from './pages/RecipeDetailPage';

import PreferenceToggleSection from './components/PreferenceToggleSection';  // PreferenceToggleSection 컴포넌트 추가
// 컴포넌트 경로 수정: src/components/ConditionPage.js
import ConditionPage from './components/ConditionPage';  // 경로 수정

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PreferenceToggleSection />} /> {/* PreferenceToggleSection 페이지로 연결 */}

        {/* 나머지는 Layout이 공통으로 적용됨 */}
        <Route element={<Layout />}>
          <Route path="/main" element={<MainPage />} />
          <Route path="/ingredient-search" element={<IngredientSearchPage />} />
          <Route path="/photo-search" element={<PhotoSearchPage />} />

          <Route path="/myinfo" element={<MyInfo />} />
          <Route path="/recipes" element={<RecipeListPage />} />
          <Route path="/Random-recipe" element={<RandomRecipePage />} />
          <Route path="/recipes/detail" element={<RecipeDetailPage />} />
        </Route>

        {/* ConditionPage 라우트 수정 */}
        <Route path="/condition" element={<ConditionPage />} /> {/* 경로와 컴포넌트 연결 */}
      </Routes>
    </Router>
  );
}

export default App;
