import React, { useState, useEffect } from "react";
import {
  Wallet,
  TrendUp,
  TrendDown,
  ChartLine,
  Clock,
  ArrowRight,
  DotsThree,
} from "@phosphor-icons/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Sample data - this would come from your backend
const samplePortfolioData = {
  summary: {
    totalBalance: 145.82, // in SOL
    solPrice: 95.47, // in USD
    totalValueUSD: 13921.47,
    percentChange24h: 5.23,
    percentChange7d: -2.15,
  },
  recentTransactions: [
    {
      id: 1,
      type: "receive",
      amount: "12.5 SOL",
      from: "8xzt...9Kpq",
      timestamp: "2 hours ago",
      status: "completed",
    },
    {
      id: 2,
      type: "send",
      amount: "5.2 SOL",
      to: "3Nmt...2Wsx",
      timestamp: "5 hours ago",
      status: "completed",
    },
    {
      id: 3,
      type: "receive",
      amount: "8.3 SOL",
      from: "5Yxc...7Lpk",
      timestamp: "1 day ago",
      status: "completed",
    },
  ],
};

const Portfolio = ({ setActiveTab }) => {
  const [priceData, setPriceData] = useState([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const [isLoading, setIsLoading] = useState(true);

  const timeframes = [
    { label: "1D", days: 1 },
    { label: "7D", days: 7 },
    { label: "1M", days: 30 },
    { label: "3M", days: 90 },
    { label: "1Y", days: 365 },
  ];

  useEffect(() => {
    fetchPriceData(selectedTimeframe);
  }, [selectedTimeframe]);

  const fetchPriceData = async (timeframe) => {
    setIsLoading(true);
    try {
      // This is a sample API endpoint - replace with your actual data source
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/solana/market_chart?vs_currency=usd&days=${
          timeframes.find((t) => t.label === timeframe).days
        }`
      );
      const data = await response.json();

      // Transform the data for the chart
      const formattedData = data.prices.map(([timestamp, price]) => ({
        timestamp: new Date(timestamp).toLocaleDateString(),
        price: price,
      }));

      setPriceData(formattedData);
    } catch (error) {
      console.error("Error fetching price data:", error);
      // Use sample data as fallback
      setPriceData(generateSamplePriceData());
    } finally {
      setIsLoading(false);
    }
  };

  const generateSamplePriceData = () => {
    // Generate sample data if API fails
    const data = [];
    const basePrice = 95;
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

  const handleViewAllTransactions = () => {
    setActiveTab("history");
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
                {formatNumber(samplePortfolioData.summary.totalBalance)} SOL
              </h3>
              <p className="text-lg text-gray-500">
                {formatCurrency(samplePortfolioData.summary.totalValueUSD)}
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center space-x-1">
                <TrendUp size={16} className="text-green-500" />
                <span className="text-sm text-green-500">
                  {samplePortfolioData.summary.percentChange24h}% (24h)
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendDown size={16} className="text-red-500" />
                <span className="text-sm text-red-500">
                  {samplePortfolioData.summary.percentChange7d}% (7d)
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
            onClick={handleViewAllTransactions}
            className="text-sm text-purple-500 hover:text-purple-600 font-medium flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight size={16} />
          </button>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {samplePortfolioData.recentTransactions.map((tx) => (
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
                      {tx.type === "receive" ? "From" : "To"}{" "}
                      {tx.type === "receive" ? tx.from : tx.to}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <Clock size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {tx.timestamp}
                    </span>
                  </div>
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
