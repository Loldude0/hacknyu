import React, { useState, useEffect } from "react";
import {
  CaretDown,
  MagnifyingGlass,
  ArrowsDownUp,
  Lightning,
  Bell,
  Clock,
  Gear,
  Wallet,
  TrendUp,
  ArrowsVertical,
  ArrowsLeftRight,
  Warning,
} from "@phosphor-icons/react";
import { currencies } from "../data/currencies";
import tokenMetadata from "/src/data/token_metadata.json";

const CurrencySelector = ({ selected, onSelect, type }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCurrencies = currencies.filter(
    (currency) =>
      currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currency.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-gray-900/5 dark:bg-white/5 rounded-lg hover:bg-gray-900/10 dark:hover:bg-white/10 transition-colors"
      >
        <span className="text-xl">{selected.icon}</span>
        <span className="font-medium">{selected.symbol}</span>
        <CaretDown
          size={16}
          className={`ml-auto transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="p-2">
            <div className="relative mb-2">
              <MagnifyingGlass
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search currency"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm focus:outline-none"
              />
            </div>
            <div className="max-h-60 overflow-y-auto">
              {filteredCurrencies.map((currency) => (
                <button
                  key={currency.symbol}
                  onClick={() => {
                    onSelect(currency);
                    setIsOpen(false);
                    setSearchQuery("");
                  }}
                  className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span className="text-xl">{currency.icon}</span>
                  <div className="text-left">
                    <div className="font-medium">{currency.symbol}</div>
                    <div className="text-xs text-gray-500">{currency.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Trading = () => {
  const [amount, setAmount] = useState("");
  const [fromToken, setFromToken] = useState("SOL");
  const [toToken, setToToken] = useState("USDC");
  const [slippage, setSlippage] = useState("0.5");
  const [isLoading, setIsLoading] = useState(false);
  const [estimatedOutput, setEstimatedOutput] = useState(null);
  const [transactionCost, setTransactionCost] = useState(0.00001); // SOL
  const [priceChange, setPriceChange] = useState({});
  const [selectedToken, setSelectedToken] = useState("SOL");
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapError, setSwapError] = useState(null);

  const tokens = [
    { symbol: "SOL", name: "Solana", balance: "12.5", color: "#8B5CF6" },
    { symbol: "USDC", name: "USD Coin", balance: "1250.00", color: "#2563EB" },
    { symbol: "BONK", name: "Bonk", balance: "1000000", color: "#F59E0B" },
    { symbol: "JUP", name: "Jupiter", balance: "500", color: "#10B981" },
  ];

  const mockPrices = {
    SOL: 95.42,
    USDC: 1.0,
    BONK: 0.00001,
    JUP: 0.85,
  };

  // Generate mock price changes
  useEffect(() => {
    const changes = {};
    tokens.forEach((token) => {
      changes[token.symbol] = (Math.random() * 10 - 5).toFixed(2);
    });
    setPriceChange(changes);
  }, []);

  useEffect(() => {
    if (amount && fromToken && toToken) {
      const fromPrice = mockPrices[fromToken];
      const toPrice = mockPrices[toToken];
      const output = (amount * fromPrice) / toPrice;
      setEstimatedOutput(output.toFixed(6));
    }
  }, [amount, fromToken, toToken]);

  const handleSwap = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  const calculateTotalCost = () => {
    return (parseFloat(amount) * mockPrices[fromToken]).toFixed(2);
  };

  const handleTokenSelect = (token) => {
    setSelectedToken(token);
    setFromToken(token);
  };

  const getSelectedTokenColor = () => {
    return tokens.find((t) => t.symbol === selectedToken)?.color || "#8B5CF6";
  };

  const handleSwapSubmit = async () => {
    try {
      setIsSwapping(true);
      setSwapError(null);

      const response = await fetch(
        `http://127.0.0.1:5000/swap-coin?input_coin=${fromToken}&output_coin=${toToken}&amount=${amount}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Reset form and show success
      setAmount("");
      setEstimatedOutput(null);
      // You might want to refresh balances here
    } catch (error) {
      console.error("Error swapping tokens:", error);
      setSwapError(error.message || "Failed to swap tokens. Please try again.");
    } finally {
      setIsSwapping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Swap Interface */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Swap Tokens</h2>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <Lightning size={20} className="text-yellow-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <ArrowsVertical size={20} className="text-blue-500" />
                </button>
              </div>
            </div>

            {/* From Token */}
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500">From</span>
                  <span className="text-sm text-gray-500">
                    Balance:{" "}
                    {tokens.find((t) => t.symbol === fromToken)?.balance}{" "}
                    {fromToken}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="flex-1 bg-transparent text-2xl font-medium focus:outline-none"
                  />
                  <select
                    value={fromToken}
                    onChange={(e) => setFromToken(e.target.value)}
                    className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    {tokens.map((token) => (
                      <option key={token.symbol} value={token.symbol}>
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  ≈ ${calculateTotalCost()} USD
                </div>
              </div>

              {/* Swap Button */}
              <button
                onClick={handleSwap}
                className="mx-auto block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <ArrowsLeftRight size={24} />
              </button>

              {/* To Token */}
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500">To</span>
                  <span className="text-sm text-gray-500">
                    Balance: {tokens.find((t) => t.symbol === toToken)?.balance}{" "}
                    {toToken}
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={estimatedOutput || ""}
                    readOnly
                    placeholder="0.00"
                    className="flex-1 bg-transparent text-2xl font-medium focus:outline-none"
                  />
                  <select
                    value={toToken}
                    onChange={(e) => setToToken(e.target.value)}
                    className="bg-white dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    {tokens.map((token) => (
                      <option key={token.symbol} value={token.symbol}>
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Rate</span>
                <span>
                  1 {fromToken} ={" "}
                  {(mockPrices[fromToken] / mockPrices[toToken]).toFixed(6)}{" "}
                  {toToken}
                </span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Network Fee</span>
                <span>{transactionCost} SOL</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Slippage Tolerance</span>
                <select
                  value={slippage}
                  onChange={(e) => setSlippage(e.target.value)}
                  className="bg-transparent"
                >
                  <option value="0.5">0.5%</option>
                  <option value="1">1.0%</option>
                  <option value="2">2.0%</option>
                </select>
              </div>
            </div>

            {swapError && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center">
                <Warning size={20} className="mr-2 flex-shrink-0" />
                <p className="text-sm">{swapError}</p>
              </div>
            )}

            <button
              onClick={handleSwapSubmit}
              disabled={!amount || isSwapping || !fromToken || !toToken}
              className="w-full mt-6 py-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSwapping ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" />
                  <span>Swapping...</span>
                </div>
              ) : (
                "Swap Tokens"
              )}
            </button>
          </div>
        </div>

        {/* Right Column - Market Info */}
        <div className="space-y-6">
          {/* Quick Swap Pairs */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Quick Swap Pairs</h3>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <Lightning size={20} className="text-yellow-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <ArrowsVertical size={20} className="text-blue-500" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {[
                {
                  from: "SOL",
                  to: "USDC",
                  rate: "95.42",
                  volume: "12.5M",
                  change: "+2.5",
                },
                {
                  from: "BONK",
                  to: "SOL",
                  rate: "0.0000123",
                  volume: "8.2M",
                  change: "-1.2",
                },
                {
                  from: "JUP",
                  to: "USDC",
                  rate: "0.85",
                  volume: "5.1M",
                  change: "+4.8",
                },
                {
                  from: "SOL",
                  to: "BONK",
                  rate: "81235.67",
                  volume: "3.9M",
                  change: "-0.7",
                },
                {
                  from: "USDC",
                  to: "JUP",
                  rate: "1.18",
                  volume: "2.7M",
                  change: "+3.2",
                },
              ].map((pair, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => {
                    setFromToken(pair.from);
                    setToToken(pair.to);
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-300 font-medium">
                        {pair.from[0]}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-medium -ml-2">
                        {pair.to[0]}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">
                        {pair.from}/{pair.to}
                      </div>
                      <div className="text-sm text-gray-500">
                        24h Vol: ${pair.volume}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{pair.rate}</div>
                    <div
                      className={`text-sm ${
                        parseFloat(pair.change) > 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {parseFloat(pair.change) > 0 ? "+" : ""}
                      {pair.change}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Market Stats</h3>
            <div className="space-y-4">
              {tokens.map((token) => (
                <button
                  key={token.symbol}
                  onClick={() => handleTokenSelect(token.symbol)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    selectedToken === token.symbol
                      ? "bg-gray-50 dark:bg-gray-700"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: `${token.color}20`,
                        color: token.color,
                      }}
                    >
                      {token.symbol[0]}
                    </div>
                    <div className="text-left">
                      <span className="font-medium">{token.symbol}</span>
                      <p className="text-xs text-gray-500">{token.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      ${mockPrices[token.symbol].toFixed(2)}
                    </div>
                    <div
                      className={`text-sm ${
                        priceChange[token.symbol] > 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {priceChange[token.symbol] > 0 ? "+" : ""}
                      {priceChange[token.symbol]}%
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trading;
