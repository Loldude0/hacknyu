import React, { useState } from "react";
import { List } from "@phosphor-icons/react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import NewsAndInsights from "../components/NewsAndInsights";
import Payments from "../components/Payments";
import Trading from "../components/Trading";
import TaxCalculator from "../components/TaxCalculator";
import Navbar from "../components/Navbar";
import Portfolio from "../components/Portfolio";
import SmartContractSetup from "../components/SmartContractSetup";
import TransactionHistory from "../components/TransactionHistory";

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");

  // Update active tab and navigate
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "history") {
      navigate("/dashboard/history");
    } else {
      navigate("/dashboard");
    }
  };

  // Helper function to render the active content
  const renderContent = () => {
    switch (activeTab) {
      case "portfolio":
        return <Portfolio />;
      case "trading":
        return <Trading />;
      case "news":
        return <NewsAndInsights />;
      case "payments":
        return <Payments />;
      case "tax":
        return <TaxCalculator />;
      case "history":
        return <TransactionHistory />;
      default:
        return <Portfolio />;
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
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
        <div className="p-8">{renderContent()}</div>
      </div>

      {/* Modal positioned relative to viewport */}
      {isModalOpen && (
        <SmartContractSetup
          walletAddress={walletAddress}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
