import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  CaretDown,
  ChatCircleText,
  X,
  Copy,
  ArrowSquareOut,
  ArrowRight,
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
  const [showFullHash, setShowFullHash] = useState(false);

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

  const formatHash = (hash) => {
    if (showFullHash) return hash;
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Optionally add your toast notification here
  };

  const openInSolscan = (hash) => {
    window.open(`https://solscan.io/tx/${hash}`, "_blank");
  };

  // Updated helper function for normalization.
  // We use a heuristic: if the numeric value of token.amount is greater than or equal to 10^(decimals)
  // we assume it's a raw integer and divide it; otherwise, it's already normalized.
  const normalizeAmount = (token) => {
    const raw = Number(token.amount);
    const decimals = token.tokenInfo?.decimals || 1;
    const factor = Math.pow(10, decimals);
    if (raw >= factor) {
      return raw / factor;
    }
    return raw;
  };

  // Updated display for swap transactions using normalized and aggregated amounts
  const formatTransactionDisplay = () => {
    if (!transaction) return null;
  
    if (transaction.type === "swap" && transaction.source && transaction.destination) {
      // Use the initial source and final destination for the main display
      const sourceToken = transaction.source[0];
      const destinationToken = transaction.destination[0];
  
      return (
        <div className="flex items-center space-x-2">
          {/* Initial Source Token */}
          <div className="flex items-center space-x-1">
            {sourceToken?.tokenInfo?.logoURI && (
              <img
                src={sourceToken.tokenInfo.logoURI}
                alt={sourceToken.tokenInfo.symbol || "Token"}
                className="w-4 h-4 rounded-full"
              />
            )}
            <span className="text-sm font-medium">
              {sourceToken?.amount.toFixed(4)} {sourceToken?.tokenInfo?.symbol || "Token"}
            </span>
          </div>
  
          <ArrowRight size={16} className="text-gray-400" />
  
          {/* Final Destination Token */}
          <div className="flex items-center space-x-1">
            {destinationToken?.tokenInfo?.logoURI && (
              <img
                src={destinationToken.tokenInfo.logoURI}
                alt={destinationToken.tokenInfo.symbol || "Token"}
                className="w-4 h-4 rounded-full"
              />
            )}
            <span className="text-sm font-medium">
              {destinationToken?.amount.toFixed(4)} {destinationToken?.tokenInfo?.symbol || "Token"}
            </span>
          </div>
        </div>
      );
    } else {
      // For transfers or SOL transactions, show the computed primary amount string
      return <span className="text-sm font-medium">{transaction.amount}</span>;
    }
  };

  const renderFullTransactionChain = () => {
    if (!transaction.transactionChain?.length) return null;
    
    return (
      <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Transaction Chain
        </h4>
        <div className="space-y-2">
          {transaction.transactionChain.map((step, stepIndex) => (
            <div key={stepIndex} className="flex items-center space-x-2">
              {/* Source Tokens */}
              <div className="flex items-center space-x-1">
                {step.source.map((sourceToken, tokenIndex) => (
                  <div key={`source-${stepIndex}-${tokenIndex}`} className="flex items-center space-x-1">
                    {sourceToken.tokenInfo?.logoURI && (
                      <img
                        src={sourceToken.tokenInfo.logoURI}
                        alt={sourceToken.tokenInfo?.symbol || "Token"}
                        className="w-4 h-4 rounded-full"
                      />
                    )}
                    <span className="text-sm">
                      {sourceToken.amount.toFixed(4)} {sourceToken.tokenInfo?.symbol || "Token"}
                    </span>
                  </div>
                ))}
              </div>
  
              <ArrowRight size={16} className="text-gray-400" />
  
              {/* Destination Tokens */}
              <div className="flex items-center space-x-1">
                {step.destination.map((destToken, tokenIndex) => (
                  <div key={`dest-${stepIndex}-${tokenIndex}`} className="flex items-center space-x-1">
                    {destToken.tokenInfo?.logoURI && (
                      <img
                        src={destToken.tokenInfo.logoURI}
                        alt={destToken.tokenInfo?.symbol || "Token"}
                        className="w-4 h-4 rounded-full"
                      />
                    )}
                    <span className="text-sm">
                      {destToken.amount.toFixed(4)} {destToken.tokenInfo?.symbol || "Token"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
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
              <div className="group relative">
                <div
                  className="flex items-center space-x-2 text-sm font-medium cursor-pointer hover:text-purple-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    openInSolscan(transaction.txHash);
                  }}
                  onMouseEnter={() => setShowFullHash(true)}
                  onMouseLeave={() => setShowFullHash(false)}
                >
                  <span>{formatHash(transaction.txHash)}</span>
                  <ArrowSquareOut
                    size={14}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
                <div className="absolute right-0 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(transaction.txHash);
                    }}
                    className="p-1 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-purple-500"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
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
          {formatTransactionDisplay()}
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
              <span>{transaction.fee} SOL</span>
            </div>
            {renderFullTransactionChain()}
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