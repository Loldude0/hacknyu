import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import TransactionHistory from "./components/TransactionHistory";
import "./index.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard/*" element={<Dashboard />}>
          <Route path="history" element={<TransactionHistory />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
