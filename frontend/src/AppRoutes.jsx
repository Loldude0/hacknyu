import React from "react";
import { Routes, Route } from "react-router-dom";
import SmartContractSetup from "./components/SmartContractSetup";
import Dashboard from "./pages/Dashboard";
import LandingPage from "./pages/LandingPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/setup" element={<SmartContractSetup />} />
      <Route path="/dashboard/*" element={<Dashboard />} />
    </Routes>
  );
};

export default AppRoutes;
