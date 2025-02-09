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
} from "@phosphor-icons/react";
import { currencies } from "../data/currencies";

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
  const [sellCurrency, setSellCurrency] = useState(currencies[0]); // USD
  const [buyCurrency, setBuyCurrency] = useState(currencies[4]); // INR
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("instant");
  const [exchangeRate, setExchangeRate] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch exchange rate when currencies change
  useEffect(() => {
    const fetchExchangeRate = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `https://api.exchangerate-api.com/v4/latest/${sellCurrency.code}`
        );
        const data = await response.json();
        setExchangeRate(data.rates[buyCurrency.code]);
      } catch (error) {
        console.error("Failed to fetch exchange rate:", error);
      }
      setLoading(false);
    };

    fetchExchangeRate();
  }, [sellCurrency.code, buyCurrency.code]);

  // Calculate the converted amount
  const convertedAmount = amount
    ? (parseFloat(amount) * (exchangeRate || 0)).toFixed(2)
    : "";

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Mode Selection */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setMode("instant")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "instant"
              ? "bg-purple-500 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Lightning size={18} weight="fill" />
          Instant
        </button>
        <button
          onClick={() => setMode("trigger")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "trigger"
              ? "bg-purple-500 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <TrendUp size={18} weight="fill" />
          Rate Alert
        </button>
        <button
          onClick={() => setMode("recurring")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "recurring"
              ? "bg-purple-500 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Clock size={18} weight="fill" />
          Recurring
        </button>
        <button className="ml-auto p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <ChartLine size={20} />
        </button>
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <Gear size={20} />
        </button>
      </div>

      {/* Trading Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="space-y-6">
          {/* Selling Section */}
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">
              You Send
            </span>
            <div className="flex gap-4">
              <CurrencySelector
                selected={sellCurrency}
                onSelect={setSellCurrency}
                type="sell"
              />
              <input
                type="text"
                value={amount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || /^\d*\.?\d*$/.test(value)) {
                    setAmount(value);
                  }
                }}
                placeholder="0.00"
                className="flex-grow text-right text-2xl font-medium bg-transparent focus:outline-none"
              />
            </div>
            <div className="mt-1 text-right text-sm text-gray-500">
              Balance: {formatNumber(10000)} {sellCurrency.symbol}
            </div>
          </div>

          {/* Swap Button */}
          <div className="relative">
            <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <button
                onClick={() => {
                  const temp = sellCurrency;
                  setSellCurrency(buyCurrency);
                  setBuyCurrency(temp);
                }}
                className="p-2 rounded-full bg-purple-100 hover:bg-purple-200 dark:bg-purple-900 dark:hover:bg-purple-800 transition-colors"
              >
                <ArrowsDownUp
                  size={20}
                  className="text-purple-500 dark:text-purple-300"
                  weight="bold"
                />
              </button>
            </div>
            <div className="h-px bg-gray-100 dark:bg-gray-700" />
          </div>

          {/* Buying Section */}
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">
              You Get
            </span>
            <div className="flex gap-4">
              <CurrencySelector
                selected={buyCurrency}
                onSelect={setBuyCurrency}
                type="buy"
              />
              <input
                type="text"
                value={loading ? "Loading..." : convertedAmount}
                readOnly
                placeholder="0.00"
                className="flex-grow text-right text-2xl font-medium bg-transparent"
              />
            </div>
            <div className="mt-1 text-right text-sm text-gray-500">
              Balance: {formatNumber(50000)} {buyCurrency.symbol}
            </div>
          </div>

          {/* Exchange Rate */}
          <div className="py-4 border-y border-gray-100 dark:border-gray-700">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Exchange Rate</span>
              <span>
                1 {sellCurrency.symbol} = {loading ? "..." : exchangeRate}{" "}
                {buyCurrency.symbol}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            disabled={!amount || loading}
            className="w-full py-4 bg-purple-600 text-white rounded-lg text-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Wallet size={20} />
            Connect Wallet
          </button>
        </div>
      </div>
    </div>
  );
};

export default Trading;
