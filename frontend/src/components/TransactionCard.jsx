import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  CaretDown,
  ChatCircleText,
  X,
} from "@phosphor-icons/react";

const StatusIcon = ({ status }) => {
  switch (status) {
    case "success":
      return <CheckCircle size={20} className="text-green-500" weight="fill" />;
    case "pending":
      return <Clock size={20} className="text-yellow-500" weight="fill" />;
    case "failed":
      return <XCircle size={20} className="text-red-500" weight="fill" />;
    default:
      return null;
  }
};

const TransactionCard = ({ transaction }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "bg-green-50 text-green-700 border-green-100";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-100";
      case "failed":
        return "bg-red-50 text-red-700 border-red-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md">
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-4">
          <StatusIcon status={transaction.status} />
          <div>
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">{transaction.txHash}</p>
              <span
                className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(
                  transaction.status
                )}`}
              >
                {transaction.status}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {transaction.timestamp}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">{transaction.amount}</span>
          <CaretDown
            size={16}
            className={`transform transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Sender</span>
              <span>{transaction.sender}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Receiver</span>
              <span>{transaction.receiver}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Fee</span>
              <span>{transaction.fee}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsChatOpen(true);
              }}
              className="mt-4 w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <ChatCircleText size={20} />
              <span>Chat Support</span>
            </button>
          </div>
        </div>
      )}

      {isChatOpen && (
        <div className="fixed bottom-6 right-6 w-80 h-96 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 z-50">
          <div className="relative h-full">
            <button
              onClick={() => setIsChatOpen(false)}
              className="absolute top-0 right-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
            >
              <X size={20} />
            </button>
            <div className="pt-8 pb-4 h-full flex flex-col">
              <h3 className="text-lg font-semibold mb-4">Chat Support</h3>
              <div className="flex-grow bg-gray-50 dark:bg-gray-700 rounded-lg p-4 overflow-y-auto">
                <p className="text-gray-500 text-sm">
                  How can we help you with this transaction?
                </p>
              </div>
              <div className="mt-4 flex">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-grow p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button className="px-4 py-2 bg-purple-500 text-white rounded-r-lg hover:bg-purple-600 transition-colors duration-200">
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionCard;
