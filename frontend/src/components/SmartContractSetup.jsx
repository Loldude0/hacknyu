import React, { useState, useEffect } from "react";
import { X, Plus, Minus, Warning, Spinner } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

const SmartContractSetup = ({ walletAddress, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    maxCurrency: "",
    maxTransactionsPerDay: "",
    waitlistedAddresses: [],
    whitelistedCurrencies: [],
  });

  const [errors, setErrors] = useState({});
  const [newAddress, setNewAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const availableCurrencies = [
    { value: "SOL", label: "Solana (SOL)" },
    { value: "USDC", label: "USD Coin (USDC)" },
    { value: "USDT", label: "Tether (USDT)" },
    { value: "ETH", label: "Ethereum (ETH)" },
    { value: "BTC", label: "Bitcoin (BTC)" },
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.maxCurrency) {
      newErrors.maxCurrency = "Maximum currency is required";
    } else if (isNaN(formData.maxCurrency) || formData.maxCurrency <= 0) {
      newErrors.maxCurrency = "Please enter a valid positive number";
    }

    if (
      formData.maxTransactionsPerDay &&
      (isNaN(formData.maxTransactionsPerDay) ||
        formData.maxTransactionsPerDay <= 0)
    ) {
      newErrors.maxTransactionsPerDay = "Please enter a valid positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setIsLoading(true);
        setApiError(""); // Clear any previous errors

        const response = await fetch(
          "http://127.0.0.1:5000/api/smart-contract",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              walletAddress,
              ...formData,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to setup smart contract");
        }

        if (data.success) {
          // Navigate to dashboard after successful setup
          navigate("/dashboard");
        } else {
          throw new Error(data.message || "Failed to setup smart contract");
        }
      } catch (error) {
        console.error("Error setting up smart contract:", error);
        setApiError(
          error.message || "Failed to setup smart contract. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddAddress = () => {
    if (newAddress && !formData.waitlistedAddresses.includes(newAddress)) {
      setFormData({
        ...formData,
        waitlistedAddresses: [...formData.waitlistedAddresses, newAddress],
      });
      setNewAddress("");
    }
  };

  const handleRemoveAddress = (address) => {
    setFormData({
      ...formData,
      waitlistedAddresses: formData.waitlistedAddresses.filter(
        (addr) => addr !== address
      ),
    });
  };

  const handleCurrencyToggle = (currency) => {
    const updatedCurrencies = formData.whitelistedCurrencies.includes(currency)
      ? formData.whitelistedCurrencies.filter((c) => c !== currency)
      : [...formData.whitelistedCurrencies, currency];

    setFormData({
      ...formData,
      whitelistedCurrencies: updatedCurrencies,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0" style={{ zIndex: 99999 }}>
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div className="fixed inset-0 flex items-start justify-center p-4 overflow-y-auto">
        <div className="relative w-full max-w-2xl mt-16 bg-white dark:bg-gray-800 rounded-xl shadow-xl">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Smart Contract Setup
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Configure your smart contract parameters to set up transaction
              limits and security settings.
            </p>
          </div>

          <div className="p-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Connected Wallet Display */}
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Connected Wallet
                </p>
                <p className="mt-1 font-mono text-sm">{walletAddress}</p>
              </div>

              {/* Maximum Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maximum Currency (SOL) *
                </label>
                <input
                  type="number"
                  value={formData.maxCurrency}
                  onChange={(e) =>
                    setFormData({ ...formData, maxCurrency: e.target.value })
                  }
                  className={`w-full px-4 py-2 border ${
                    errors.maxCurrency
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-200 focus:ring-purple-500"
                  } rounded-lg focus:outline-none focus:ring-2 transition-colors`}
                  placeholder="Enter maximum currency amount"
                />
                {errors.maxCurrency && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <Warning size={16} className="mr-1" />
                    {errors.maxCurrency}
                  </p>
                )}
              </div>

              {/* Maximum Transactions per Day */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maximum Transactions per Day
                </label>
                <input
                  type="number"
                  value={formData.maxTransactionsPerDay}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxTransactionsPerDay: e.target.value,
                    })
                  }
                  className={`w-full px-4 py-2 border ${
                    errors.maxTransactionsPerDay
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-200 focus:ring-purple-500"
                  } rounded-lg focus:outline-none focus:ring-2 transition-colors`}
                  placeholder="Enter maximum daily transactions"
                />
                {errors.maxTransactionsPerDay && (
                  <p className="mt-1 text-sm text-red-500 flex items-center">
                    <Warning size={16} className="mr-1" />
                    {errors.maxTransactionsPerDay}
                  </p>
                )}
              </div>

              {/* Waitlisted Addresses */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Waitlisted Addresses
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                    placeholder="Enter wallet address"
                  />
                  <button
                    type="button"
                    onClick={handleAddAddress}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center"
                  >
                    <Plus size={20} className="mr-1" />
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.waitlistedAddresses.map((address) => (
                    <div
                      key={address}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <code className="text-sm">{address}</code>
                      <button
                        type="button"
                        onClick={() => handleRemoveAddress(address)}
                        className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Whitelisted Currencies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Whitelisted Currencies
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableCurrencies.map((currency) => (
                    <button
                      key={currency.value}
                      type="button"
                      onClick={() => handleCurrencyToggle(currency.value)}
                      className={`p-3 rounded-lg border ${
                        formData.whitelistedCurrencies.includes(currency.value)
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-200 hover:border-purple-500 hover:bg-purple-50"
                      } transition-all duration-200`}
                    >
                      <p className="text-sm font-medium">{currency.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* API Error Display */}
              {apiError && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600 flex items-center">
                    <Warning size={16} className="mr-1" />
                    {apiError}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Spinner size={20} className="animate-spin" />
                      <span>Setting up Smart Contract...</span>
                    </>
                  ) : (
                    <span>Configure Smart Contract</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartContractSetup;
