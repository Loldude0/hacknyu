import React, { useState, useMemo, useEffect } from "react";
import { Export, FunnelSimple, MagnifyingGlass } from "@phosphor-icons/react";
import TransactionCard from "./TransactionCard";
import transactionData from "/src/data/transactions_20250208_222941.json";
import tokenMetadata from "/src/data/token_metadata.json";

// Replace the existing tokenMap and fetchTokenList with this:
const tokenMap = new Map(
  tokenMetadata.tokens.map((token) => [
    token.address.toLowerCase(),
    {
      symbol: token.symbol,
      name: token.name !== "Unknown Token" ? token.name : undefined, // Only include name if it's not "Unknown Token"
      decimals: token.decimals,
      logoURI: token.logoURI,
    },
  ])
);

// Remove the fetchTokenList function since we're using local data

// Update the getTokenInfo function:
const getTokenInfo = (mint) => {
  if (!mint) return null;

  // Normalize the mint address
  const normalizedMint = mint.toLowerCase();
  const tokenInfo = tokenMap.get(normalizedMint);

  if (!tokenInfo) {
    return {
      symbol: `${mint.slice(0, 4)}...${mint.slice(-4)}`,
      decimals: 9,
      logoURI: `https://api.dicebear.com/7.x/identicon/svg?seed=${mint}`,
    };
  }

  return tokenInfo;
};

const findTokenAccount = (mint, preTokenBalances, postTokenBalances) => {
  // Normalize the mint address for consistent comparison
  const normalizedMint = mint.toLowerCase();

  // Search in preTokenBalances
  const preTokenAccount = preTokenBalances.find(
    (balance) => balance.mint.toLowerCase() === normalizedMint
  );

  // Search in postTokenBalances if not found in preTokenBalances
  const postTokenAccount = postTokenBalances.find(
    (balance) => balance.mint.toLowerCase() === normalizedMint
  );

  // Return the first found token account (prefer preTokenBalances)
  return preTokenAccount || postTokenAccount || null;
};

const parseTransaction = (transaction) => {
  try {
    // Extract all necessary data
    const {
      blockTime,
      slot,
      version,
      meta: {
        computeUnitsConsumed,
        err,
        fee,
        innerInstructions = [],
        loadedAddresses = {},
        logMessages = [],
        postBalances = [],
        postTokenBalances = [],
        preBalances = [],
        preTokenBalances = [],
        rewards = [],
        status,
      },
      transaction: {
        signatures,
        message: {
          accountKeys,
          addressTableLookups = [],
          header,
          instructions,
          recentBlockhash,
        },
      },
    } = transaction;

    if (!instructions || !accountKeys) {
      throw new Error("Missing required transaction data");
    }

    // Calculate SOL changes for each account
    const accountChanges = accountKeys.map((address, index) => ({
      address,
      preSol: (preBalances[index] || 0) / 1e9,
      postSol: (postBalances[index] || 0) / 1e9,
      change: ((postBalances[index] || 0) - (preBalances[index] || 0)) / 1e9,
    }));

    // Process token transfers
    const tokenChanges = {
      pre: (preTokenBalances || []).map((balance) => ({
        accountIndex: balance.accountIndex,
        mint: balance.mint,
        owner: balance.owner,
        amount: balance.uiTokenAmount?.uiAmount || 0,
        tokenInfo: getTokenInfo(balance.mint),
      })),
      post: (postTokenBalances || []).map((balance) => ({
        accountIndex: balance.accountIndex,
        mint: balance.mint,
        owner: balance.owner,
        amount: balance.uiTokenAmount?.uiAmount || 0,
        tokenInfo: getTokenInfo(balance.mint),
      })),
    };

    // Find source and destination tokens by comparing pre and post balances
    let sourceToken = null;
    let destinationToken = null;

    // Compare pre and post balances to find significant changes
    tokenChanges.pre.forEach((preBalance) => {
      const postBalance = tokenChanges.post.find(
        (p) => p.mint === preBalance.mint
      );
      if (postBalance) {
        const change = postBalance.amount - preBalance.amount;
        if (change < 0) {
          // Token was spent
          sourceToken = {
            mint: preBalance.mint,
            amount: Math.abs(change),
            tokenInfo: preBalance.tokenInfo,
          };
        } else if (change > 0) {
          // Token was received
          destinationToken = {
            mint: preBalance.mint,
            amount: change,
            tokenInfo: preBalance.tokenInfo,
          };
        }
      }
    });

    // Check for new tokens in post that weren't in pre
    tokenChanges.post.forEach((postBalance) => {
      const preBalance = tokenChanges.pre.find(
        (p) => p.mint === postBalance.mint
      );
      if (!preBalance && postBalance.amount > 0) {
        destinationToken = {
          mint: postBalance.mint,
          amount: postBalance.amount,
          tokenInfo: postBalance.tokenInfo,
        };
      }
    });

    // Calculate primary amount based on transfer type
    let primaryAmount = "0 SOL";
    let txType = "unknown";

    if (sourceToken && destinationToken) {
      primaryAmount = `${sourceToken.amount} ${
        sourceToken.tokenInfo?.symbol || "tokens"
      } to ${destinationToken.amount} ${
        destinationToken.tokenInfo?.symbol || "tokens"
      }`;
      txType = "swap";
    } else if (sourceToken || destinationToken) {
      txType = "transfer";
      primaryAmount = sourceToken
        ? `${sourceToken.amount} ${sourceToken.tokenInfo?.symbol || "tokens"}`
        : `${destinationToken.amount} ${
            destinationToken.tokenInfo?.symbol || "tokens"
          }`;
    } else {
      txType = determineTransactionType(logMessages, instructions, accountKeys);
      primaryAmount = tokenChanges.pre[0]
        ? `${Math.abs(tokenChanges.pre[0].amount)} ${
            tokenChanges.pre[0].tokenInfo?.symbol || "tokens"
          }`
        : "0 SOL";
    }

    return {
      id: signatures[0],
      txHash: signatures[0],
      timestamp: new Date(blockTime * 1000).toLocaleString(),
      blockTime,
      slot,
      version,
      recentBlockhash,
      type: txType,
      status: err === null ? "success" : "failed",
      computeUnits: computeUnitsConsumed,
      fee: fee / 1e9,
      sender: accountKeys[0],
      receiver: sourceToken
        ? accountKeys[accountKeys.length - 1]
        : destinationToken
        ? accountKeys[accountKeys.length - 1]
        : accountKeys[1],
      amount: primaryAmount,
      accountChanges,
      tokenChanges,
      logMessages,
      instructions: instructions.map((instruction) => ({
        programId: accountKeys[instruction.programIdIndex],
        accounts: instruction.accounts.map((idx) => accountKeys[idx]),
        data: instruction.data,
      })),
      innerInstructions,
      raw: {
        loadedAddresses,
        header,
        addressTableLookups,
        rewards,
      },
      source: sourceToken,
      destination: destinationToken,
    };
  } catch (error) {
    console.error("Error parsing transaction:", error);
    return null;
  }
};

const determineTransactionType = (logMessages, instructions, accountKeys) => {
  if (!instructions || !instructions[0] || !accountKeys) {
    return "unknown";
  }

  // Check for known program IDs
  const programTypes = {
    "9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdap3VQ": "swap", // Orca
    SSwpkEEcbUqx4vtoEByFjSkhKdCT862DNVb52nZg1UZ: "swap", // Serum
    TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: "token",
  };

  const programId = accountKeys[instructions[0].programIdIndex];
  return programTypes[programId] || "transfer";
};

const TransactionHistory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("time");
  const [sortOrder, setSortOrder] = useState("desc");
  const [timeFilter, setTimeFilter] = useState("all");
  const [rawTransactions, setRawTransactions] = useState([]);

  // Fetch transaction data
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        console.log("Loading transactions...");
        setRawTransactions(transactionData);
        console.log("Loaded transactions:", transactionData.length);
      } catch (error) {
        console.error("Error loading transactions:", error);
        setRawTransactions([]);
      }
    };

    fetchTransactions();
  }, []);

  const transactions = useMemo(() => {
    if (!rawTransactions || rawTransactions.length === 0) {
      console.log("No raw transactions to process");
      return [];
    }

    try {
      console.log("Parsing transactions...");
      // Parse each transaction
      const parsedTransactions = rawTransactions
        .map((tx) => {
          try {
            return parseTransaction(tx);
          } catch (error) {
            console.error("Error parsing transaction:", error);
            return null;
          }
        })
        .filter((tx) => tx !== null);

      console.log(
        "Successfully parsed transactions:",
        parsedTransactions.length
      );

      // Apply search filter
      let filtered = parsedTransactions;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (tx) =>
            tx.txHash.toLowerCase().includes(query) ||
            tx.sender.toLowerCase().includes(query) ||
            tx.receiver.toLowerCase().includes(query)
        );
      }

      // Apply time filter
      if (timeFilter !== "all") {
        const now = new Date();
        const filterDate = new Date();
        switch (timeFilter) {
          case "day":
            filterDate.setDate(now.getDate() - 1);
            break;
          case "week":
            filterDate.setDate(now.getDate() - 7);
            break;
          case "month":
            filterDate.setMonth(now.getMonth() - 1);
            break;
          default:
            break;
        }
        filtered = filtered.filter(
          (tx) => new Date(tx.timestamp) >= filterDate
        );
      }

      // Apply sorting
      return filtered.sort((a, b) => {
        if (sortBy === "amount") {
          const amountA = parseFloat(a.amount);
          const amountB = parseFloat(b.amount);
          return sortOrder === "desc" ? amountB - amountA : amountA - amountB;
        }
        // Sort by time
        const dateA = new Date(a.timestamp);
        const dateB = new Date(b.timestamp);
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
      });
    } catch (error) {
      console.error("Error processing transactions:", error);
      return [];
    }
  }, [searchQuery, sortBy, sortOrder, timeFilter, rawTransactions]);

  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
            <Export size={20} />
            <span>Export</span>
          </button>
          <div className="relative">
            <button
              onClick={() => handleSort("amount")}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              <FunnelSimple size={20} />
              <span>Sort by {sortBy === "amount" ? "Time" : "Amount"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="flex-1 relative">
          <MagnifyingGlass
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search by transaction ID or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <select
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
        >
          <option value="all">All Time</option>
          <option value="day">Last 24h</option>
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
        </select>
      </div>

      <div className="space-y-4">
        {transactions.map((transaction) => (
          <TransactionCard key={transaction.id} transaction={transaction} />
        ))}
      </div>
    </div>
  );
};

export default TransactionHistory;
