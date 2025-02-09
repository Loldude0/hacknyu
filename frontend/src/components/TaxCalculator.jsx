import React, { useState } from "react";
import {
  Calculator,
  CaretDown,
  ArrowRight,
  Download,
  DotsThree,
  TrendUp,
  TrendDown,
  Clock,
} from "@phosphor-icons/react";

// Sample data - this would come from your backend
const sampleTaxData = {
  summary: {
    totalGains: 12450.75,
    totalLosses: -3280.5,
    netGain: 9170.25,
    estimatedTax: 1375.54,
    totalTransactions: 48,
  },
  monthlyData: [
    { month: "Jan", gains: 1200, losses: -300 },
    { month: "Feb", gains: 2100, losses: -450 },
    { month: "Mar", gains: 1800, losses: -600 },
    { month: "Apr", gains: 950, losses: -200 },
    { month: "May", gains: 1600, losses: -380 },
    { month: "Jun", gains: 800, losses: -150 },
    { month: "Jul", gains: 1400, losses: -420 },
    { month: "Aug", gains: 750, losses: -180 },
    { month: "Sep", gains: 950, losses: -250 },
    { month: "Oct", gains: 400, losses: -150 },
    { month: "Nov", gains: 300, losses: -100 },
    { month: "Dec", gains: 200, losses: -100 },
  ],
  transactions: [
    {
      id: 1,
      type: "buy",
      amount: "5.2 SOL",
      price: "$120.45",
      date: "2024-02-15",
      status: "completed",
      gainLoss: "+$250.30",
    },
    {
      id: 2,
      type: "sell",
      amount: "2.8 SOL",
      price: "$118.30",
      date: "2024-02-14",
      status: "completed",
      gainLoss: "-$85.20",
    },
    {
      id: 3,
      type: "buy",
      amount: "1.5 SOL",
      price: "$119.75",
      date: "2024-02-13",
      status: "completed",
      gainLoss: "+$120.45",
    },
  ],
};

const TaxCalculator = () => {
  const [selectedYear, setSelectedYear] = useState("2024");
  const [showTransactions, setShowTransactions] = useState(false);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tax Calculator</h2>
          <p className="text-sm text-gray-500 mt-1">
            Calculate your crypto tax liability
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
            <Download size={20} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Total Gains</span>
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendUp size={20} className="text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-500">
            {formatCurrency(sampleTaxData.summary.totalGains)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Total Losses</span>
            <div className="p-2 bg-red-50 rounded-lg">
              <TrendDown size={20} className="text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-500">
            {formatCurrency(sampleTaxData.summary.totalLosses)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Net Gain/Loss</span>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Calculator size={20} className="text-purple-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-500">
            {formatCurrency(sampleTaxData.summary.netGain)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Estimated Tax</span>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Clock size={20} className="text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-500">
            {formatCurrency(sampleTaxData.summary.estimatedTax)}
          </p>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-6">Monthly Overview</h3>
        <div className="h-64 flex items-end space-x-4">
          {sampleTaxData.monthlyData.map((data) => (
            <div key={data.month} className="flex-1 flex flex-col items-center">
              <div className="w-full space-y-1">
                <div
                  className="w-full bg-green-100 rounded-t"
                  style={{
                    height: `${(data.gains / 2100) * 150}px`,
                  }}
                >
                  <div className="h-full bg-green-500 bg-opacity-20 hover:bg-opacity-40 transition-colors" />
                </div>
                <div
                  className="w-full bg-red-100 rounded-b"
                  style={{
                    height: `${(Math.abs(data.losses) / 600) * 50}px`,
                  }}
                >
                  <div className="h-full bg-red-500 bg-opacity-20 hover:bg-opacity-40 transition-colors" />
                </div>
              </div>
              <span className="text-xs text-gray-500 mt-2">{data.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowTransactions(!showTransactions)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold">Transaction History</h3>
              <span className="text-sm text-gray-500">
                ({sampleTaxData.summary.totalTransactions} transactions)
              </span>
            </div>
            <CaretDown
              size={20}
              className={`text-gray-500 transform transition-transform duration-200 ${
                showTransactions ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
        {showTransactions && (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {sampleTaxData.transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-2 rounded-lg ${
                        tx.type === "buy"
                          ? "bg-green-50 text-green-500"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      {tx.type === "buy" ? (
                        <TrendUp size={20} />
                      ) : (
                        <TrendDown size={20} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {tx.type === "buy" ? "Bought" : "Sold"} {tx.amount}
                      </p>
                      <p className="text-sm text-gray-500">
                        Price: {tx.price} • {tx.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`font-medium ${
                        tx.gainLoss.startsWith("+")
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {tx.gainLoss}
                    </span>
                    <button className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                      <DotsThree size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxCalculator;
