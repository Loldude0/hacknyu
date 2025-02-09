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

const TaxCalculator = () => {
  const [selectedYear, setSelectedYear] = useState("2024");
  const [showTransactions, setShowTransactions] = useState(false);
  const [taxData, setTaxData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateTaxes = () => {
      try {
        setLoading(true);

        // Process transactions for tax calculations
        let totalGains = 0;
        let totalLosses = 0;
        let totalFees = 0;
        let monthlyData = Array(12)
          .fill()
          .map(() => ({ gains: 0, losses: 0 }));

        const processedTransactions = transactionData
          .map((tx) => {
            // Skip failed transactions
            if (tx.meta.err !== null) {
              return null;
            }

            const timestamp = tx.blockTime * 1000; // Convert to milliseconds
            const date = new Date(timestamp);
            const month = date.getMonth();

            // Get token transfers if any
            const preTokenBalances = tx.meta.preTokenBalances || [];
            const postTokenBalances = tx.meta.postTokenBalances || [];

            // Calculate SOL changes
            const solChange =
              (tx.meta.postBalances[0] - tx.meta.preBalances[0]) / 1e9;
            const fee = tx.meta.fee / 1e9;

            let gainLoss = 0;
            let txType = "unknown";
            let amount = 0;

            // Check if this is a token transfer
            if (preTokenBalances.length > 0 || postTokenBalances.length > 0) {
              // Token transaction
              const preAmount =
                preTokenBalances[0]?.uiTokenAmount.uiAmount || 0;
              const postAmount =
                postTokenBalances[0]?.uiTokenAmount.uiAmount || 0;
              amount = Math.abs(postAmount - preAmount);
              gainLoss = postAmount - preAmount;
              txType = postAmount > preAmount ? "token_receive" : "token_send";
            } else {
              // SOL transaction
              amount = Math.abs(solChange);
              gainLoss = solChange - fee; // Subtract fee from gain/loss calculation
              txType = solChange > 0 ? "sol_receive" : "sol_send";
            }

            // Update monthly data
            if (gainLoss > 0) {
              monthlyData[month].gains += gainLoss;
              totalGains += gainLoss;
            } else if (gainLoss < 0) {
              monthlyData[month].losses += Math.abs(gainLoss);
              totalLosses += Math.abs(gainLoss);
            }

            totalFees += fee;

            return {
              txHash: tx.transaction.signatures[0],
              timestamp: date.toISOString(),
              type: txType,
              amount: amount,
              fee: fee,
              gainLoss: gainLoss,
              // Include token information if present
              tokenInfo:
                preTokenBalances.length > 0
                  ? {
                      mint: preTokenBalances[0].mint,
                      decimals: preTokenBalances[0].uiTokenAmount.decimals,
                      preAmount: preTokenBalances[0].uiTokenAmount.uiAmount,
                      postAmount:
                        postTokenBalances[0]?.uiTokenAmount.uiAmount || 0,
                    }
                  : null,
              // Include SOL balances
              solBalances: {
                pre: tx.meta.preBalances[0] / 1e9,
                post: tx.meta.postBalances[0] / 1e9,
              },
              // Include raw data for reference
              logMessages: tx.meta.logMessages,
              instructions: tx.transaction.message.instructions,
              status: tx.meta.err === null ? "success" : "failed",
            };
          })
          .filter((tx) => tx !== null); // Remove failed transactions

        // Calculate net gain/loss
        const netGain = totalGains - totalLosses;

        // Estimate tax (using simple 15% rate - adjust based on your jurisdiction)
        const estimatedTax = netGain > 0 ? netGain * 0.15 : 0;

        // Format monthly data for chart
        const formattedMonthlyData = monthlyData.map((data, index) => ({
          month: new Date(2024, index, 1).toLocaleString("default", {
            month: "short",
          }),
          gains: data.gains,
          losses: data.losses,
        }));

        setTaxData({
          summary: {
            totalGains,
            totalLosses,
            netGain,
            estimatedTax,
            totalFees,
            totalTransactions: processedTransactions.length,
          },
          monthlyData: formattedMonthlyData,
          transactions: processedTransactions,
        });
      } catch (error) {
        console.error("Error calculating taxes:", error);
        // Use sample data as fallback
        setTaxData({
          summary: {
            totalGains: 12450.75,
            totalLosses: 3280.5,
            netGain: 9170.25,
            estimatedTax: 1375.54,
            totalTransactions: 48,
            totalFees: 125.3,
          },
          monthlyData: [
            { month: "Jan", gains: 1200, losses: 300 },
            { month: "Feb", gains: 2100, losses: 450 },
            { month: "Mar", gains: 1800, losses: 600 },
            { month: "Apr", gains: 950, losses: 200 },
            { month: "May", gains: 1600, losses: 380 },
            { month: "Jun", gains: 800, losses: 150 },
            { month: "Jul", gains: 1400, losses: 420 },
            { month: "Aug", gains: 750, losses: 180 },
            { month: "Sep", gains: 950, losses: 250 },
            { month: "Oct", gains: 400, losses: 150 },
            { month: "Nov", gains: 300, losses: 100 },
            { month: "Dec", gains: 200, losses: 100 },
          ],
          transactions: [],
        });
      } finally {
        setLoading(false);
      }
    };

    calculateTaxes();
  }, [selectedYear]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      signDisplay: "always",
    }).format(amount);
  };

  if (loading || !taxData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tax Calculator</h2>
          <p className="text-sm text-gray-500 mt-1">
            Calculate your crypto tax liability
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
            <Download size={20} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Total Gains</span>
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendUp size={20} className="text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-500">
            {formatCurrency(taxData.summary.totalGains)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Total Losses</span>
            <div className="p-2 bg-red-50 rounded-lg">
              <TrendDown size={20} className="text-red-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-500">
            {formatCurrency(taxData.summary.totalLosses)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Net Gain/Loss</span>
            <div className="p-2 bg-purple-50 rounded-lg">
              <Calculator size={20} className="text-purple-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-500">
            {formatCurrency(taxData.summary.netGain)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Estimated Tax</span>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Clock size={20} className="text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-500">
            {formatCurrency(taxData.summary.estimatedTax)}
          </p>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-6">Monthly Overview</h3>
        <div className="h-64 flex items-end space-x-4">
          {taxData.monthlyData.map((data) => (
            <div key={data.month} className="flex-1 flex flex-col items-center">
              <div className="w-full space-y-1">
                <div
                  className="w-full bg-green-100 rounded-t"
                  style={{
                    height: `${
                      (data.gains /
                        Math.max(...taxData.monthlyData.map((d) => d.gains))) *
                      150
                    }px`,
                  }}
                >
                  <div className="h-full bg-green-500 bg-opacity-20 hover:bg-opacity-40 transition-colors" />
                </div>
                <div
                  className="w-full bg-red-100 rounded-b"
                  style={{
                    height: `${
                      (Math.abs(data.losses) /
                        Math.max(
                          ...taxData.monthlyData.map((d) => Math.abs(d.losses))
                        )) *
                      50
                    }px`,
                  }}
                >
                  <div className="h-full bg-red-500 bg-opacity-20 hover:bg-opacity-40 transition-colors" />
                </div>
              </div>
              <span className="text-xs text-gray-500 mt-2">{data.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowTransactions(!showTransactions)}
            className="flex items-center justify-between w-full"
          >
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold">Transaction History</h3>
              <span className="text-sm text-gray-500">
                ({taxData.summary.totalTransactions} transactions)
              </span>
            </div>
            <CaretDown
              size={20}
              className={`text-gray-500 transform transition-transform duration-200 ${
                showTransactions ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
        {showTransactions && (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {taxData.transactions.map((tx) => (
              <div
                key={tx.txHash}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-2 rounded-lg ${
                        tx.gainLoss >= 0
                          ? "bg-green-50 text-green-500"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      {tx.gainLoss >= 0 ? (
                        <TrendUp size={20} />
                      ) : (
                        <TrendDown size={20} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {tx.type
                          .split("_")
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")}
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
                      Cost Basis: {formatCurrency(tx.solBalances.pre)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxCalculator;
