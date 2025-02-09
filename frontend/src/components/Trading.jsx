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
  ChartLine,
  ArrowsVertical,
  ArrowsLeftRight,
  ChartLineUp,
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

  const tokens = [
    { symbol: "SOL", name: "Solana", balance: "12.5" },
    { symbol: "USDC", name: "USD Coin", balance: "1250.00" },
    { symbol: "BONK", name: "Bonk", balance: "1000000" },
    { symbol: "JUP", name: "Jupiter", balance: "500" },
  ];

  const mockPrices = {
    SOL: 95.42,
    USDC: 1.0,
    BONK: 0.00001,
    JUP: 0.85,
  };

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
                  <ChartLineUp size={20} className="text-blue-500" />
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

            <button
              onClick={() => setIsLoading(true)}
              disabled={!amount || isLoading}
              className="w-full mt-6 py-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
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
          {/* Price Chart Placeholder */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Price Chart</h3>
            <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <ChartLineUp size={48} className="text-gray-400" />
            </div>
          </div>

          {/* Market Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4">Market Stats</h3>
            <div className="space-y-4">
              {Object.entries(mockPrices).map(([token, price]) => (
                <div key={token} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      {token[0]}
                    </div>
                    <span>{token}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${price.toFixed(2)}</div>
                    <div className="text-sm text-green-500">+2.5%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trading;
