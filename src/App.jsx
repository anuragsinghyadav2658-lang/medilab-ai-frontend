import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import DashboardHome from "./pages/DashboardHome";
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login'; 

const AppContent = () => {
  const location = useLocation();
  
  // Check kar rahe hain ki current page login toh nahi hai
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="flex bg-navy min-h-screen text-white font-sans antialiased selection:bg-mint/30 selection:text-mint">
      
      {/* Sidebar Navigation - Login page par hide rahega */}
      {!isLoginPage && <Sidebar />}

      {/* Main Content Area */}
      <main className={`flex-1 ${!isLoginPage ? 'p-4 md:p-8 pb-24 md:pb-8' : ''} overflow-x-hidden relative`}>
        <Routes>
          {/* Default Route redirecting to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          
          {/* Naya Login Route */}
          <Route path="/login" element={<Login />} />
          
          {/* Dashboard Route */}
          <Route path="/dashboard" element={<DashboardHome />} />
          
          {/* Reports List & Detail Route */}
          <Route path="/reports" element={<Reports />} />
          
          {/* Settings Route */}
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
