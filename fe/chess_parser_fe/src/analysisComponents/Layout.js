// Layout.jsx
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import VideoBackground from './VideoBackground';

function Layout() {
  const location = useLocation();
  const showVideo = location.pathname === '/'; // Adjust this condition as needed

  return (
    <>
      {<VideoBackground isVisible={showVideo} />}
      <div className="relative z-10">
        <Outlet />
      </div>
    </>
  );
}

export default Layout;
