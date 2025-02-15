import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  ArrowLeft,
  QrCode,
  Copy,
  AddressBook,
  Plus,
  Warning,
  Clock,
  CheckCircle,
  CurrencyCircleDollar,
} from "@phosphor-icons/react";
import TransactionCard from "./TransactionCard";

// Sample data (you might want to move this to a separate data file)
const sampleContacts = [
  {
    id: 1,
    name: "John Doe",
    address: "8xzt...9Kpq",
    avatar: "JD",
  },
  {
    id: 2,
    name: "Alice Smith",
    address: "3Nmt...2Wsx",
    avatar: "AS",
  },
  {
    id: 3,
    name: "Bob Wilson",
    address: "5Yxc...7Lpk",
    avatar: "BW",
  },
];

const Payments = () => {
  const [activeView, setActiveView] = useState("send");
  const [amount, setAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [note, setNote] = useState("");
  const [showAddressBook, setShowAddressBook] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const solanaPublicKey = "HEmpRb9etVX6oivUmGvhxYzc171mBYKgQ79wTeqvRpa7";
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const myWalletAddress = "7Hnm...1Rty";

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "http://127.0.0.1:5000/get-recent-transactions"
      );
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Transform the transactions to match our UI format
      const formattedTransactions = data.map((tx) => ({
        id: tx.signature,
        type: tx.description.toLowerCase().includes("receive")
          ? "receive"
          : "send",
        amount: tx.amount,
        to: tx.destination || "Unknown",
        timestamp: tx.timestamp,
        status: tx.status,
      }));

      setTransactions(formattedTransactions);
      setError(null);
    } catch (err) {
      setError("Failed to load transactions");
      console.error("Error loading transactions:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendSol = async () => {
    try {
      setIsSending(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(
        `http://127.0.0.1:5000/send-sol?reciever=${recipientAddress}&amount=${amount}`,
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

      setSuccess(true);
      setAmount("");
      setRecipientAddress("");
    } catch (error) {
      console.error("Error sending SOL:", error);
      setError(error.message || "Failed to send SOL. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Payments</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveView("send")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${
              activeView === "send"
                ? "bg-purple-500 text-white"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <ArrowRight size={20} />
            <span>Send</span>
          </button>
          <button
            onClick={() => setActiveView("receive")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2 ${
              activeView === "receive"
                ? "bg-purple-500 text-white"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <ArrowLeft size={20} />
            <span>Receive</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100">
        {activeView === "send" ? (
          <div className="space-y-6">
            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Amount (SOL)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                  SOL
                </span>
              </div>
            </div>

            {/* Recipient Address */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recipient Address
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="Enter Solana address"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setShowAddressBook(!showAddressBook)}
                  className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <AddressBook size={20} />
                </button>
              </div>

              {/* Address Book Dropdown */}
              {showAddressBook && (
                <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100">
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-700">
                        Recent Recipients
                      </h3>
                      <button className="text-purple-500 hover:text-purple-600 transition-colors duration-200">
                        <Plus size={20} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {sampleContacts.map((contact) => (
                        <div
                          key={contact.id}
                          onClick={() => {
                            setRecipientAddress(contact.address);
                            setShowAddressBook(false);
                          }}
                          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-500 flex items-center justify-center text-sm font-medium">
                            {contact.avatar}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {contact.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {contact.address}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Note (optional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What's this payment for?"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Transaction Details */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Network Fee</span>
                <span className="font-medium">0.000005 SOL</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Amount</span>
                <span className="font-medium">
                  {amount ? (Number(amount) + 0.000005).toFixed(6) : "0.000005"}{" "}
                  SOL
                </span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-center">
                <Warning size={20} className="mr-2 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-3 bg-green-50 text-green-700 rounded-lg flex items-center">
                <CheckCircle size={20} className="mr-2 flex-shrink-0" />
                <p className="text-sm">Successfully sent SOL!</p>
              </div>
            )}

            {/* Send Button */}
            <button
              onClick={handleSendSol}
              disabled={!amount || !recipientAddress || isSending}
              className="w-full py-4 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <div className="flex items-center justify-center space-x-2">
                  <Clock size={20} className="animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>Send SOL</span>
                  <ArrowRight size={20} />
                </div>
              )}
            </button>
          </div>
        ) : (
          // Receive View
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <QrCode
                size={160}
                weight="thin"
                className="text-gray-800 dark:text-white mb-4"
              />
              <p className="text-sm text-gray-500 mb-2">Your Solana Address</p>
              <div className="flex items-center space-x-2">
                <code className="text-sm bg-white dark:bg-gray-800 px-3 py-1 rounded-lg">
                  {myWalletAddress}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(myWalletAddress)}
                  className="p-2 text-gray-400 hover:text-purple-500 transition-colors duration-200"
                >
                  <Copy size={20} />
                </button>
              </div>
            </div>
            <p className="text-center text-sm text-gray-500">
              Share this address to receive SOL payments
            </p>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-2 rounded-lg ${
                      tx.type === "receive"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {tx.type === "receive" ? "↓" : "↑"}
                  </div>
                  <div>
                    <p className="font-medium">
                      {tx.type === "receive" ? "Received" : "Sent"} {tx.amount}
                    </p>
                    <p className="text-sm text-gray-500">
                      {tx.type === "receive" ? "From" : "To"}: {tx.to}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{tx.timestamp}</p>
                  <p className="text-xs text-gray-400">{tx.status}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Payments;
