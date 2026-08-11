import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, Settings } from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Reports", icon: FileText, path: "/reports" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <aside className="fixed bottom-0 w-full md:sticky md:top-0 md:w-64 md:h-screen bg-glass-navy backdrop-blur-md border-t md:border-r md:border-t-0 border-navy-lightest shadow-glass z-50 flex flex-col justify-between">
      <div className="flex md:flex-col items-center md:items-start w-full justify-around md:justify-start p-3 md:p-6 gap-2 md:gap-4">
        {/* Logo Area - Desktop ke liye */}
        <div
          className="hidden md:flex items-center gap-3 mb-8 w-full cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <div className="w-10 h-10 rounded-xl bg-mint shadow-mint-glow flex items-center justify-center">
            <span className="text-navy font-extrabold text-lg">AI</span>
          </div>
          <h1 className="text-white font-bold text-xl tracking-wider">
            MediLab
          </h1>
        </div>

        {/* Menu Items */}
        <div className="flex md:flex-col w-full justify-around md:justify-start gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-center md:justify-start gap-3 w-auto md:w-full p-3 md:px-4 md:py-3 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-mint-tint text-mint border border-mint/20 shadow-mint-glow"
                      : "text-gray-400 hover:text-white hover:bg-navy-light"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={22}
                      className={`${isActive ? "animate-pulse" : ""}`}
                    />
                    <span className="hidden md:block font-medium">
                      {item.name}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
