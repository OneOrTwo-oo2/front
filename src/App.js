import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout'; // ✅ 추가

// page import
import MainPage from './pages/MainPage';
import IngredientSearchPage from './pages/IngredientSearchPage';
import PhotoSearchPage from './pages/PhotoSearchPage';
import Home from './pages/Home';
import MyInfo from './pages/MyinfoPage';
import RecipeListPage from './pages/RecipeListPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ Layout을 모든 페이지에 공통으로 적용 */}
        <Route element={<Layout />}>
          <Route path="/" element={<MainPage />} />
          <Route path="/ingredient-search" element={<IngredientSearchPage />} />
          <Route path="/photo-search" element={<PhotoSearchPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/myinfo" element={<MyInfo />} />
          <Route path="/recipes" element={<RecipeListPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
