import Header from './components/Header';
import { Outlet } from 'react-router-dom';

function Layout() {
  return (
    <>
      <Header />
      <main className="page-content">
        <Outlet />
      </main>
    </>
  );
}

export default Layout;
