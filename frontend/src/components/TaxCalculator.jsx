import React, { useState, useEffect } from "react";
import {
  Calculator,
  CaretDown,
  ArrowRight,
  Download,
  DotsThree,
  TrendUp,
  TrendDown,
  Clock,
} from "@phosphor-icons/react";
import transactionData from "/src/data/transactions_20250208_222941.json";
import tokenMetadata from "/src/data/token_metadata.json";
import axios from "axios";

// CoinGecko API base URL
const COINGECKO_API_BASE = "/api/coingecko/";

// Token mapping for CoinGecko IDs
const COINGECKO_TOKEN_MAP = {
  "So11111111111111111111111111111111111111112": "solana", // SOL
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": "usd-coin", // USDC
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": "usd-coin", // USDT
  // Add more token mappings as needed
};

// Build tokenMap using local token metadata
const tokenMap = new Map(
  tokenMetadata.tokens.map((token) => [
    token.address.toLowerCase(),
    {
      symbol: token.symbol,
      name: token.name !== "Unknown Token" ? token.name : undefined,
      decimals: token.decimals,
      logoURI: token.logoURI,
      coingeckoId: COINGECKO_TOKEN_MAP[token.address] || null,
    },
  ])
);

const TaxCalculator = () => {
  const [selectedYear, setSelectedYear] = useState("2024");
  const [taxMethod, setTaxMethod] = useState("FIFO");
  const [showTransactions, setShowTransactions] = useState(false);
  const [taxData, setTaxData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [priceData, setPriceData] = useState({});
  const [error, setError] = useState(null);

  // Fetch historical price data from CoinGecko
  const fetchHistoricalPrice = async (coingeckoId, timestamp) => {
    try {
      const date = new Date(timestamp);
      const dateString = date.toISOString().split('T')[0];
      
      const response = await axios.get(
        `${COINGECKO_API_BASE}/coins/${coingeckoId}/history`,
        {
          params: {
            date: dateString,
            localization: false,
          }
        }
      );

      return response.data.market_data?.current_price?.usd || null;
    } catch (error) {
      console.error(`Error fetching price for ${coingeckoId}:`, error);
      return null;
    }
  };

  // Fetch current prices for all relevant tokens
  const fetchCurrentPrices = async (tokenIds) => {
    try {
      const response = await axios.get(
        `${COINGECKO_API_BASE}/simple/price`,
        {
          params: {
            ids: tokenIds.join(','),
            vs_currencies: 'usd',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching current prices:", error);
      return {};
    }
  };

  // Helper function to get token info
  const getTokenInfo = (mint) => {
    if (!mint) return null;
    const normalizedMint = mint.toLowerCase();
    const tokenInfo = tokenMap.get(normalizedMint);
    if (!tokenInfo) {
      return {
        symbol: `${mint.slice(0, 4)}...${mint.slice(-4)}`,
        decimals: 9,
        logoURI: `https://api.dicebear.com/7.x/identicon/svg?seed=${mint}`,
        coingeckoId: null,
      };
    }
    return tokenInfo;
  };

  useEffect(() => {
    const calculateTaxes = async () => {
      try {
        setLoading(true);
        setError(null);

        // Initialize tax tracking
        let shortTermGains = 0;
        let shortTermLosses = 0;
        let longTermGains = 0;
        let longTermLosses = 0;
        let totalFees = 0;
        
        // Holdings tracker for FIFO/LIFO
        const holdings = {};
        const transactions = [];

        // Process transactions chronologically
        const sortedTransactions = [...transactionData].sort((a, b) => a.blockTime - b.blockTime);

        for (const tx of sortedTransactions) {
          if (tx.meta.err !== null) continue;

          const timestamp = tx.blockTime * 1000;
          const date = new Date(timestamp);
          
          // Skip transactions not in selected year
          if (date.getFullYear().toString() !== selectedYear) continue;

          const fee = tx.meta.fee / 1e9;
          totalFees += fee;

          // Process token changes
          const preTokenBalances = tx.meta.preTokenBalances || [];
          const postTokenBalances = tx.meta.postTokenBalances || [];

          for (const [pre, post] of zip(preTokenBalances, postTokenBalances)) {
            if (!pre || !post) continue;

            const tokenInfo = getTokenInfo(pre.mint);
            if (!tokenInfo || !tokenInfo.coingeckoId) continue;

            const preAmount = Number(pre.uiTokenAmount.amount) / Math.pow(10, tokenInfo.decimals);
            const postAmount = Number(post.uiTokenAmount.amount) / Math.pow(10, tokenInfo.decimals);
            const difference = postAmount - preAmount;

            if (difference === 0) continue;

            // Fetch historical price for this transaction
            const price = await fetchHistoricalPrice(tokenInfo.coingeckoId, timestamp);
            if (!price) continue;

            if (difference > 0) {
              // Buy/Receive tokens
              if (!holdings[pre.mint]) holdings[pre.mint] = [];
              holdings[pre.mint].push({
                amount: difference,
                price: price,
                timestamp: timestamp,
              });
            } else {
              // Sell/Send tokens
              const saleAmount = Math.abs(difference);
              let remainingAmount = saleAmount;
              let totalCostBasis = 0;
              
              const lots = taxMethod === 'FIFO' 
                ? holdings[pre.mint] 
                : [...holdings[pre.mint]].reverse();

              while (remainingAmount > 0 && lots.length > 0) {
                const lot = lots[0];
                const amountFromLot = Math.min(remainingAmount, lot.amount);
                
                const gainLoss = (price - lot.price) * amountFromLot;
                const isLongTermHold = isLongTerm(lot.timestamp, timestamp);

                if (gainLoss > 0) {
                  if (isLongTermHold) longTermGains += gainLoss;
                  else shortTermGains += gainLoss;
                } else {
                  if (isLongTermHold) longTermLosses += Math.abs(gainLoss);
                  else shortTermLosses += Math.abs(gainLoss);
                }

                totalCostBasis += lot.price * amountFromLot;
                remainingAmount -= amountFromLot;
                lot.amount -= amountFromLot;

                if (lot.amount === 0) lots.shift();
              }

              transactions.push({
                timestamp,
                type: "SELL",
                symbol: tokenInfo.symbol,
                amount: saleAmount,
                price: price,
                costBasis: totalCostBasis,
                gainLoss: price * saleAmount - totalCostBasis,
              });
            }
          }
        }

        // Calculate tax summary
        const netShortTerm = shortTermGains - shortTermLosses;
        const netLongTerm = longTermGains - longTermLosses;
        
        // Estimate taxes (using simplified rates)
        const estimatedShortTermTax = Math.max(0, netShortTerm * 0.35); // 35% rate
        const estimatedLongTermTax = Math.max(0, netLongTerm * 0.15); // 15% rate

        setTaxData({
          summary: {
            shortTermGains,
            shortTermLosses,
            longTermGains,
            longTermLosses,
            netShortTerm,
            netLongTerm,
            estimatedShortTermTax,
            estimatedLongTermTax,
            totalFees,
          },
          transactions: transactions.sort((a, b) => b.timestamp - a.timestamp),
        });

      } catch (error) {
        console.error("Error calculating taxes:", error);
        setError("Failed to calculate taxes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    calculateTaxes();
  }, [selectedYear, taxMethod]);

  // Helper function to zip arrays
  const zip = (a, b) => {
    return a.map((k, i) => [k, b[i]]);
  };

  // Helper function to format currency
  const formatCurrency = (amount, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);
  };

  // Helper function to determine if transaction is long term
  const isLongTerm = (acquiredTimestamp, soldTimestamp) => {
    const oneYear = 365 * 24 * 60 * 60 * 1000;
    return soldTimestamp - acquiredTimestamp >= oneYear;
  };

  // Export tax report
  const exportTaxReport = () => {
    if (!taxData) return;

    const report = {
      year: selectedYear,
      method: taxMethod,
      summary: taxData.summary,
      transactions: taxData.transactions,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crypto_tax_report_${selectedYear}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Crypto Tax Calculator</h2>
        <div className="flex gap-4 mb-6">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
          <select
            value={taxMethod}
            onChange={(e) => setTaxMethod(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="FIFO">FIFO</option>
            <option value="LIFO">LIFO</option>
          </select>
          <button
            onClick={exportTaxReport}
            disabled={!taxData}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
          >
            <Download size={20} className="inline-block mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center p-12">
          <Clock size={32} className="animate-spin mx-auto mb-4" />
          <p>Calculating taxes...</p>
        </div>
      ) : taxData ? (
        <>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Short Term</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Gains:</span>
                  <span className="text-green-500">
                    {formatCurrency(taxData.summary.shortTermGains)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Losses:</span>
                  <span className="text-red-500">
                    {formatCurrency(taxData.summary.shortTermLosses)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Est. Tax:</span>
                  <span>{formatCurrency(taxData.summary.estimatedShortTermTax)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-2">Long Term</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Gains:</span>
                  <span className="text-green-500">
                    {formatCurrency(taxData.summary.longTermGains)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Losses:</span>
                  <span className="text-red-500">
                    {formatCurrency(taxData.summary.longTermLosses)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Est. Tax:</span>
                  <span>{formatCurrency(taxData.summary.estimatedLongTermTax)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <button
              onClick={() => setShowTransactions(!showTransactions)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <CaretDown
                size={20}
                className={`transform transition-transform ${
                  showTransactions ? "rotate-180" : ""
                }`}
              />
              {showTransactions ? "Hide" : "Show"} Detailed Transactions
            </button>
          </div>

          {showTransactions && (
            <div className="space-y-4">
              {taxData.transactions.map((tx, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-full ${
                          tx.type === "BUY"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {tx.type === "BUY" ? <TrendUp size={20} /> : <TrendDown size={20} />}
                      </div>
                      <div>
                        <p className="font-medium">
                          {tx.type} {tx.symbol}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(tx.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-medium ${
                          tx.gainLoss >= 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {formatCurrency(tx.gainLoss)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Price: {formatCurrency(tx.price)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-gray-500 p-12">
          No tax data available for the selected year
        </div>
      )}
    </div>
  );
};

export default TaxCalculator;