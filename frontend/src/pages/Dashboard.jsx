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
import TransactionHistory from "../components/TransactionHistory";
import SmartContractSetup from "../components/SmartContractSetup";

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

  // Render the appropriate component based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case "portfolio":
        return <Portfolio setActiveTab={setActiveTab} />;
      case "payments":
        return <Payments />;
      case "trading":
        return <Trading />;
      case "history":
        return <TransactionHistory />;
      case "tax":
        return <TaxCalculator />;
      case "news":
        return <NewsAndInsights />;
      default:
        return <Portfolio setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />
      <div className="flex">
        <Sidebar
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        <main className="flex-1 p-6 lg:p-8 pt-24">{renderContent()}</main>
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
