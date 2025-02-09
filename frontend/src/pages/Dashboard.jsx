import React, { useState } from "react";
import { List } from "@phosphor-icons/react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import NewsAndInsights from "../components/NewsAndInsights";
import Payments from "../components/Payments";
import Trading from "../components/Trading";
import TaxCalculator from "../components/TaxCalculator";
import Navbar from "../components/Navbar";
import Portfolio from "../components/Portfolio";

const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Extract the active tab from the current path
  const getActiveTab = () => {
    const path = location.pathname.split("/")[2] || "portfolio";
    return path;
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  // Update active tab and navigate
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "history") {
      navigate("/dashboard/history");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} />
      </div>

      {/* Mobile nav */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <List size={24} />
        </button>
      </div>

      {/* Mobile sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-25"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-full max-w-xs">
            <Sidebar
              onClose={() => setIsOpen(false)}
              activeTab={activeTab}
              setActiveTab={handleTabChange}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="md:ml-64">
        {/* Navbar */}
        <Navbar activeTab={activeTab} setActiveTab={handleTabChange} />

        {/* Content */}
        <div className="p-8">
          {location.pathname === "/dashboard/history" ? (
            <Outlet />
          ) : (
            <>
              {activeTab === "portfolio" && <Portfolio />}
              {activeTab === "trading" && <Trading />}
              {activeTab === "news" && <NewsAndInsights />}
              {activeTab === "payments" && <Payments />}
              {activeTab === "tax" && <TaxCalculator />}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
