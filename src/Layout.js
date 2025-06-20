import Header from './components/Header';
import { Outlet } from 'react-router-dom';
import './Layout.css';


function Layout() {
  return (
    <>
      <Header />
      <div className="header-spacer" />
      <main className="page-content">
        <Outlet />
      </main>
    </>
  );
}

export default Layout;
