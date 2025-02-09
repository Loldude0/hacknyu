import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
  Warning,
  CheckCircle,
  Plus,
  X,
  Coins,
  AddressBook,
  Shield,
} from "@phosphor-icons/react";

const SmartContractSetup = () => {
  const navigate = useNavigate();
  const { publicKey, connected } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    transaction_limit: "",
    daily_transaction_limit: "",
    whitelisted_coins: ["SOL", "USDC"], // Default coins
    whitelisted_addresses: [],
  });

  // State for new inputs
  const [newCoin, setNewCoin] = useState("");
  const [newAddress, setNewAddress] = useState("");

  const handleAddCoin = () => {
    if (newCoin && !formData.whitelisted_coins.includes(newCoin)) {
      setFormData({
        ...formData,
        whitelisted_coins: [...formData.whitelisted_coins, newCoin],
      });
      setNewCoin("");
    }
  };

  const handleRemoveCoin = (coin) => {
    setFormData({
      ...formData,
      whitelisted_coins: formData.whitelisted_coins.filter((c) => c !== coin),
    });
  };

  const handleAddAddress = () => {
    if (newAddress && !formData.whitelisted_addresses.includes(newAddress)) {
      setFormData({
        ...formData,
        whitelisted_addresses: [...formData.whitelisted_addresses, newAddress],
      });
      setNewAddress("");
    }
  };

  const handleRemoveAddress = (address) => {
    setFormData({
      ...formData,
      whitelisted_addresses: formData.whitelisted_addresses.filter(
        (a) => a !== address
      ),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!publicKey) {
      setError("Please connect your wallet first");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(false);

      const response = await fetch("http://127.0.0.1:5000/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          public_address: publicKey.toString(),
          ...formData,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setSuccess(true);
      // Wait for 1 second to show success message before redirecting
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error("Error saving wallet settings:", error);
      setError(error.message || "Failed to save wallet settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation with Wallet Button */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-purple-600">VoiceSol</h1>
            </div>
            <div className="flex items-center">
              <WalletMultiButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {!connected ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 mb-8">
              Please connect your Phantom wallet using the button in the top
              right to continue.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-6 shadow-xl border border-gray-200">
            <h2 className="text-2xl font-bold mb-6">Smart Contract Setup</h2>

            {/* Connected Wallet Display */}
            <div className="mb-8 p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-700">Connected Wallet</p>
              <p className="mt-1 font-mono text-sm">{publicKey.toString()}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Transaction Limits */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Limit (SOL)
                </label>
                <input
                  type="number"
                  value={formData.transaction_limit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      transaction_limit: e.target.value,
                    })
                  }
                  placeholder="Enter maximum transaction amount"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Transaction Limit (SOL)
                </label>
                <input
                  type="number"
                  value={formData.daily_transaction_limit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      daily_transaction_limit: e.target.value,
                    })
                  }
                  placeholder="Enter daily transaction limit"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              {/* Whitelisted Coins */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Whitelisted Coins
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newCoin}
                    onChange={(e) => setNewCoin(e.target.value)}
                    placeholder="Enter coin symbol"
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCoin}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.whitelisted_coins.map((coin) => (
                    <div
                      key={coin}
                      className="flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-600 rounded-full"
                    >
                      <Coins size={16} />
                      <span>{coin}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCoin(coin)}
                        className="hover:text-purple-800"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Whitelisted Addresses */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Whitelisted Addresses
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Enter Solana address"
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddAddress}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.whitelisted_addresses.map((address) => (
                    <div
                      key={address}
                      className="flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-600 rounded-full"
                    >
                      <AddressBook size={16} />
                      <span>
                        {address.slice(0, 4)}...{address.slice(-4)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAddress(address)}
                        className="hover:text-purple-800"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error and Success Messages */}
              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center">
                  <Warning size={20} className="mr-2 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 text-green-700 rounded-lg flex items-center">
                  <CheckCircle size={20} className="mr-2 flex-shrink-0" />
                  <p className="text-sm">Wallet settings saved successfully!</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Shield size={20} />
                    <span>Save Smart Contract Settings</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartContractSetup;
