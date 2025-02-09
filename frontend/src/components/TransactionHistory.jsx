import React, { useState } from "react";
import { Export, FunnelSimple, MagnifyingGlass } from "@phosphor-icons/react";
import TransactionCard from "./TransactionCard";
import { sampleTransactions } from "../data/sampleData";

const TransactionHistory = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
            <Export size={20} />
            <span>Export</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
            <FunnelSimple size={20} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex-1 relative">
          <MagnifyingGlass
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <select className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
          <option value="all">All Time</option>
          <option value="day">Last 24h</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
        </select>
      </div>

      <div className="space-y-4">
        {sampleTransactions.map((transaction) => (
          <TransactionCard key={transaction.id} transaction={transaction} />
        ))}
      </div>
    </div>
  );
};

export default TransactionHistory;
