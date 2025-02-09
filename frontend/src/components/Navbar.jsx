import React, { useState, useEffect } from "react";
import { Bell, CaretRight, X, ArrowDown } from "@phosphor-icons/react";
import { sampleNews } from "../data/sampleData";

const Navbar = ({ activeTab, setActiveTab }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const user = {
    name: "Ritesh Thipparthi",
    email: "rthippar@umd.edu",
    avatar: "https://avatars.githubusercontent.com/u/12345678?v=4",
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setShowNotifications(false);
        setShowProfile(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleViewAllNotifications = () => {
    setActiveTab("news");
    setShowNotifications(false);
  };

  return (
    <div className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 flex items-center justify-between">
      {/* Left side - Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <span className="text-gray-500">Dashboard</span>
        <CaretRight size={16} className="text-gray-400" />
        <span className="font-medium text-gray-900 dark:text-white capitalize">
          {activeTab}
        </span>
      </div>

      {/* Right side - Notifications & Profile */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative dropdown-container">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Notifications Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 animate-dropdown">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-medium">Notifications</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {sampleNews.slice(0, 3).map((news) => (
                  <div
                    key={news.id}
                    className="p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-2 h-2 mt-2 rounded-full ${
                          news.sentiment === "positive"
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {news.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {news.timestamp}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 text-center border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleViewAllNotifications}
                  className="text-sm text-purple-500 hover:text-purple-600 font-medium"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative dropdown-container">
          <button
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
            className="flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="font-medium text-sm">{user.name}</span>
            <ArrowDown
              size={16}
              className={`text-gray-500 transform transition-transform duration-200 ${
                showProfile ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Profile Dropdown */}
          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 animate-dropdown">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <div className="p-2">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  Profile Settings
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  Help & Support
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
