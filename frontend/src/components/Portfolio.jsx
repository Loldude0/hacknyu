import React, { useState, useEffect } from "react";
import {
  Wallet,
  TrendUp,
  TrendDown,
  Clock,
  ArrowRight,
} from "@phosphor-icons/react";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchRecentTransactions } from "../utils/transactionService";

const SOLANA_RPC_URL =
  "https://cold-methodical-valley.solana-mainnet.quiknode.pro/5f68d0b807c87c2f09e2990ff988acb552c709f6";
const solanaConnection = new Connection(SOLANA_RPC_URL);
const solanaPublicKey = "FUCK3XiQyAPrtMKxU6Mk7bht2psruHTcBb2zWCynjjLz";

const Portfolio = ({ setActiveTab }) => {
  // State variables
  const [solBalance, setSolBalance] = useState(0);
  const [solPrice, setSolPrice] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [priceData, setPriceData] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const [isLoading, setIsLoading] = useState(true);
  const [percentChange24h, setPercentChange24h] = useState(0);
  const [percentChange7d, setPercentChange7d] = useState(0);

  const timeframes = [
    { label: "1D", days: 1 },
    { label: "7D", days: 7 },
    { label: "1M", days: 30 },
    { label: "3M", days: 90 },
    { label: "1Y", days: 365 },
  ];

  useEffect(() => {
    fetchSolBalance();
    fetchSolPrice();
    loadRecentTransactions();
    fetchPriceData(selectedTimeframe);
  }, [selectedTimeframe]);

  const fetchSolBalance = async () => {
    try {
      const balanceLamports = await solanaConnection.getBalance(
        new PublicKey(solanaPublicKey)
      );
      setSolBalance(balanceLamports / 1e9);
    } catch (error) {
      console.error("Error fetching SOL balance:", error);
    }
  };

  const fetchSolPrice = async () => {
    try {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/solana"
      );
      const data = await response.json();
      setSolPrice(data.market_data.current_price.usd);
      setPercentChange24h(data.market_data.price_change_percentage_24h);
      setPercentChange7d(data.market_data.price_change_percentage_7d);
    } catch (error) {
      console.error("Error fetching SOL price:", error);
    }
  };

  const loadRecentTransactions = async () => {
    try {
      const transactions = await fetchRecentTransactions(solanaPublicKey);
      setTransactions(transactions);
    } catch (error) {
      console.error("Error loading transactions:", error);
      setTransactions([]); // Set empty array on error
    }
  };

  const fetchPriceData = async (timeframe) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/solana/market_chart?vs_currency=usd&days=${
          timeframes.find((t) => t.label === timeframe).days
        }`
      );
      const data = await response.json();

      const formattedData = data.prices.map(([timestamp, price]) => ({
        timestamp: new Date(timestamp).toLocaleDateString(),
        price: price,
      }));

      setPriceData(formattedData);
    } catch (error) {
      console.error("Error fetching price data:", error);
      // Fallback to generated data if API fails
      setPriceData(generateSamplePriceData());
    } finally {
      setIsLoading(false);
    }
  };

  const generateSamplePriceData = () => {
    const data = [];
    const basePrice = solPrice || 95;
    for (let i = 0; i < 30; i++) {
      data.push({
        timestamp: new Date(
          Date.now() - i * 24 * 60 * 60 * 1000
        ).toLocaleDateString(),
        price: basePrice + Math.random() * 10 - 5,
      });
    }
    return data.reverse();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-gray-500">{label}</p>
          <p className="font-semibold">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Portfolio</h2>
          <p className="text-sm text-gray-500 mt-1">
            Your Solana wallet overview
          </p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
          <Wallet size={20} />
          <span>Connect Wallet</span>
        </button>
      </div>

      {/* Main Balance Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left side - Balance */}
          <div>
            <span className="text-sm text-gray-500">Total Balance</span>
            <div className="mt-2 space-y-1">
              <h3 className="text-3xl font-bold">
                {formatNumber(solBalance)} SOL
              </h3>
              <p className="text-lg text-gray-500">
                {formatCurrency(solBalance * solPrice)}
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center space-x-1">
                {percentChange24h >= 0 ? (
                  <TrendUp size={16} className="text-green-500" />
                ) : (
                  <TrendDown size={16} className="text-red-500" />
                )}
                <span
                  className={`text-sm ${
                    percentChange24h >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {percentChange24h?.toFixed(2)}% (24h)
                </span>
              </div>
              <div className="flex items-center space-x-1">
                {percentChange7d >= 0 ? (
                  <TrendUp size={16} className="text-green-500" />
                ) : (
                  <TrendDown size={16} className="text-red-500" />
                )}
                <span
                  className={`text-sm ${
                    percentChange7d >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {percentChange7d?.toFixed(2)}% (7d)
                </span>
              </div>
            </div>
          </div>

          {/* Right side - Price Chart */}
          <div className="flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">SOL Price</span>
              <div className="flex items-center space-x-2">
                {timeframes.map(({ label }) => (
                  <button
                    key={label}
                    onClick={() => setSelectedTimeframe(label)}
                    className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors ${
                      selectedTimeframe === label
                        ? "bg-purple-100 text-purple-600"
                        : "text-gray-500 hover:text-purple-500 hover:bg-purple-50"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-48 mt-4">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={priceData}>
                    <defs>
                      <linearGradient
                        id="colorPrice"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#8B5CF6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8B5CF6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis
                      dataKey="timestamp"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value.toFixed(2)}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="price"
                      stroke="#8B5CF6"
                      fillOpacity={1}
                      fill="url(#colorPrice)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <button
            onClick={() => setActiveTab("history")}
            className="text-sm text-purple-500 hover:text-purple-600 font-medium flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight size={16} />
          </button>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${
                      tx.type === "receive"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {tx.type === "receive" ? (
                      <TrendUp size={20} />
                    ) : (
                      <TrendDown size={20} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {tx.type === "receive" ? "Received" : "Sent"} {tx.amount}
                    </p>
                    <p className="text-sm text-gray-500">
                      {tx.type === "receive" ? "From" : "To"} {tx.to}
                    </p>
                  </div>
                </div>
                <div className="text-right flex items-center space-x-2">
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-500">{tx.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
