import React, { useState } from "react";
import {
  House,
  ChartLine,
  Microphone,
  Calculator,
  Newspaper,
  CurrencyCircleDollar,
  List,
} from "@phosphor-icons/react";

const SidebarContent = ({ onClose }) => {
  const menuItems = [
    { icon: House, label: "Home" },
    { icon: Microphone, label: "Voice Commands" },
    { icon: ChartLine, label: "Trading" },
    { icon: Calculator, label: "Tax Calculator" },
    { icon: Newspaper, label: "News & Insights" },
    { icon: CurrencyCircleDollar, label: "Payments" },
  ];

  return (
    <div className="fixed w-60 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      <div className="h-20 mx-8 flex items-center justify-between">
        <span className="text-2xl font-bold text-purple-500">VoiceSol</span>
      </div>
      {menuItems.map((item) => (
        <div
          key={item.label}
          className="mx-4 p-4 flex items-center rounded-lg cursor-pointer hover:bg-purple-400 hover:text-white transition-colors duration-200"
        >
          <item.icon size={20} />
          <span className="ml-4">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

const Dashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("0.00");

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <SidebarContent />
      </div>

      {/* Mobile nav */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="p-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
        >
          <List size={24} />
        </button>
      </div>

      {/* Mobile sidebar */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-black bg-opacity-25"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-full max-w-xs">
            <SidebarContent onClose={() => setIsOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="md:ml-60 p-4">
        {/* Currency Conversion Box */}
        <div className="max-w-xl mx-auto bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl">
          <div className="space-y-6">
            {/* Selling Section */}
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Selling
              </span>
              <div className="flex gap-4 mt-2">
                <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <img
                    src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"
                    className="w-5 h-5 rounded-full"
                    alt="USDC"
                  />
                  <span>USDC</span>
                </button>
                <input
                  type="text"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-grow text-right text-2xl font-bold bg-transparent border rounded-lg px-4"
                />
              </div>
            </div>

            {/* Swap Icon */}
            <div className="text-center">
              <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600">
                <CurrencyCircleDollar size={24} />
              </button>
            </div>

            {/* Buying Section */}
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Buying
              </span>
              <div className="flex gap-4 mt-2">
                <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  <img
                    src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png"
                    className="w-5 h-5 rounded-full"
                    alt="SOL"
                  />
                  <span>SOL</span>
                </button>
                <input
                  type="text"
                  value={(parseFloat(amount) * 0.05).toFixed(2)}
                  readOnly
                  className="flex-grow text-right text-2xl font-bold bg-transparent border rounded-lg px-4"
                />
              </div>
            </div>

            {/* Action Button */}
            <button className="w-full py-4 bg-purple-600 text-white rounded-lg text-lg font-medium hover:bg-purple-700 transition-colors duration-200">
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
