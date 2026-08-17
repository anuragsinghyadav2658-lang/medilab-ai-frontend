import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, Settings, Menu, X } from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Reports", icon: FileText, path: "/reports" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-glass-navy backdrop-blur-md rounded-xl border border-mint/20 text-mint shadow-mint-glow"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar - Mobile Slide-in & Desktop Fixed */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-glass-navy backdrop-blur-md border-r border-navy-lightest shadow-glass flex flex-col justify-between transform transition-transform duration-300 md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col items-start w-full p-6 gap-6 relative">
          {/* Close Button (Mobile) */}
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden absolute top-4 right-4 text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>

          {/* Logo Area */}
          <div
            className="flex items-center gap-3 mb-4 w-full cursor-pointer"
            onClick={() => {
              navigate("/dashboard");
              setIsOpen(false);
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-mint shadow-mint-glow flex items-center justify-center">
              <span className="text-navy font-extrabold text-lg">AI</span>
            </div>
            <h1 className="text-white font-bold text-xl tracking-wider">
              MediLab
            </h1>
          </div>

          {/* Menu Items */}
          <div className="flex flex-col w-full gap-2 mt-2">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-start gap-3 w-full px-4 py-3 rounded-xl transition-all duration-300 ${
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
                      <span className="block font-medium">{item.name}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
