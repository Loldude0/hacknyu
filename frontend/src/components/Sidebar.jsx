import React from "react";
import {
  House,
  Microphone,
  ChartLine,
  Calculator,
  Newspaper,
  CurrencyCircleDollar,
  ClockCounterClockwise,
  Wallet,
} from "@phosphor-icons/react";

const menuItems = [
  { icon: Wallet, label: "Portfolio", id: "portfolio" },
  { icon: Microphone, label: "Voice Commands", id: "voice" },
  { icon: ChartLine, label: "Trading", id: "trading" },
  { icon: Calculator, label: "Tax Calculator", id: "tax" },
  { icon: Newspaper, label: "News & Insights", id: "news" },
  { icon: CurrencyCircleDollar, label: "Payments", id: "payments" },
  { icon: ClockCounterClockwise, label: "Transaction History", id: "history" },
];

const Sidebar = ({ onClose, activeTab, setActiveTab }) => {
  return (
    <div className="fixed w-64 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      <div className="h-16 px-6 flex items-center justify-between border-b border-gray-200">
        <span className="text-xl font-bold text-purple-500">VoiceSol</span>
      </div>
      <div className="p-4">
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-400 uppercase mb-2">
            Main
          </p>
          {menuItems.slice(0, 4).map((item) => (
            <div
              key={item.label}
              onClick={() => {
                setActiveTab(item.id);
                if (onClose) onClose();
              }}
              className={`mb-1 px-3 py-2 flex items-center rounded-lg cursor-pointer transition-colors duration-200 ${
                activeTab === item.id
                  ? "bg-purple-50 text-purple-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon size={20} />
              <span className="ml-3 text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase mb-2">
            Features
          </p>
          {menuItems.slice(4).map((item) => (
            <div
              key={item.label}
              onClick={() => {
                setActiveTab(item.id);
                if (onClose) onClose();
              }}
              className={`mb-1 px-3 py-2 flex items-center rounded-lg cursor-pointer transition-colors duration-200 ${
                activeTab === item.id
                  ? "bg-purple-50 text-purple-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon size={20} />
              <span className="ml-3 text-sm font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
export { menuItems };
