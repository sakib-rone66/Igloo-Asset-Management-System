import { useState } from "react";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

import "./AppPageLayout.css";

function AppPageLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 900);

  return (
    <div
      className={`app-page-layout ${
        sidebarOpen ? "app-sidebar-open" : "app-sidebar-closed"
      }`}
    >
      {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}

      <div className="app-page-main">
        <Navbar />

        {!sidebarOpen && (
          <button
            type="button"
            className="app-sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            ☰
          </button>
        )}

        {children}
      </div>
    </div>
  );
}

export default AppPageLayout;
