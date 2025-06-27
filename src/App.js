import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout';

// page import
import LoginPage from './pages/LoginPage'; // ✅ 새로 추가한 로그인 페이지
import MainPage from './pages/MainPage';
import IngredientSearchPage from './pages/IngredientSearchPage';
import PhotoSearchPage from './pages/PhotoSearchPage';
import Home from './pages/Home';
import MyInfo from './pages/MyinfoPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ 로그인 페이지는 Layout 없이 보여줌 */}
        <Route path="/" element={<LoginPage />} />

        {/* ✅ 나머지는 Layout이 공통으로 적용됨 */}
        <Route element={<Layout />}>
          <Route path="/main" element={<MainPage />} />
          <Route path="/ingredient-search" element={<IngredientSearchPage />} />
          <Route path="/photo-search" element={<PhotoSearchPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/myinfo" element={<MyInfo />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
