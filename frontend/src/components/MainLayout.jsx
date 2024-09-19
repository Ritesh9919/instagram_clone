import React from "react";
import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <div>
      Sidebar
      <div>
        <Outlet />
      </div>
    </div>
  );
}

export default MainLayout;
