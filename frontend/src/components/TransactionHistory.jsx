import React, { useState, useMemo, useEffect } from "react";
import { Export, FunnelSimple, MagnifyingGlass } from "@phosphor-icons/react";
import TransactionCard from "./TransactionCard";
import transactionData from "/src/data/transactions_20250208_222941.json";
import tokenMetadata from "/src/data/token_metadata.json";

// Build tokenMap using local token metadata
const tokenMap = new Map(
  tokenMetadata.tokens.map((token) => [
    token.address.toLowerCase(),
    {
      symbol: token.symbol,
      name: token.name !== "Unknown Token" ? token.name : undefined,
      decimals: token.decimals,
      logoURI: token.logoURI,
    },
  ])
);

const getTokenInfo = (mint) => {
  if (!mint) return null;
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
  const normalizedMint = mint.toLowerCase();
  const preTokenAccount = preTokenBalances.find(
    (balance) => balance.mint.toLowerCase() === normalizedMint
  );
  const postTokenAccount = postTokenBalances.find(
    (balance) => balance.mint.toLowerCase() === normalizedMint
  );
  return preTokenAccount || postTokenAccount || null;
};

const determineTransactionType = (logMessages, instructions, accountKeys) => {
  if (!instructions || !instructions[0] || !accountKeys) {
    return "unknown";
  }

  // Known program IDs for detecting swaps and token operations
  const programTypes = {
    "9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdap3VQ": "swap", // Orca
    SSwpkEEcbUqx4vtoEByFjSkhKdCT862DNVb52nZg1UZ: "swap", // Serum
    TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA: "token",
    JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4: "swap", // Jupiter
  };

  const programId = accountKeys[instructions[0].programIdIndex];
  return programTypes[programId] || "transfer";
};

const parseTransaction = (transaction) => {
  try {
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

    // Calculate SOL changes
    const accountChanges = accountKeys.map((address, index) => ({
      address,
      preSol: (preBalances[index] || 0) / 1e9,
      postSol: (postBalances[index] || 0) / 1e9,
      change: ((postBalances[index] || 0) - (preBalances[index] || 0)) / 1e9,
    }));

    // Process token transfers into pre and post arrays
    const tokenChanges = {
      pre: (preTokenBalances || []).map((balance) => ({
        accountIndex: balance.accountIndex,
        mint: balance.mint,
        owner: balance.owner,
        amount: balance.uiTokenAmount?.uiAmount || 0,
        decimals: balance.uiTokenAmount?.decimals || 0,
        tokenInfo: getTokenInfo(balance.mint),
      })),
      post: (postTokenBalances || []).map((balance) => ({
        accountIndex: balance.accountIndex,
        mint: balance.mint,
        owner: balance.owner,
        amount: balance.uiTokenAmount?.uiAmount || 0,
        decimals: balance.uiTokenAmount?.decimals || 0,
        tokenInfo: getTokenInfo(balance.mint),
      })),
    };

    // Find all unique token accounts that had changes
    const changedAccounts = new Set();
    tokenChanges.pre.forEach((pre) => {
      const post = tokenChanges.post.find(
        (p) => p.accountIndex === pre.accountIndex
      );
      if (post && pre.amount !== post.amount) {
        changedAccounts.add(pre.accountIndex);
      }
    });
    // Also add new accounts that only appear in post balances
    tokenChanges.post.forEach((post) => {
      if (!tokenChanges.pre.find((p) => p.accountIndex === post.accountIndex)) {
        changedAccounts.add(post.accountIndex);
      }
    });

    // -------------------------------
    // Revised logic for building the transaction chain:
    // -------------------------------
    // Group changes by owner.
    // A negative diff (pre > post) is a "source" (tokens sent),
    // while a positive diff (post > pre) is a "destination" (tokens received).
    const changesByOwner = new Map();
    changedAccounts.forEach((accountIndex) => {
      const pre = tokenChanges.pre.find((p) => p.accountIndex === accountIndex);
      const post = tokenChanges.post.find(
        (p) => p.accountIndex === accountIndex
      );

      if (pre || post) {
        const owner = (pre || post).owner;
        if (!changesByOwner.has(owner)) {
          changesByOwner.set(owner, { sources: [], destinations: [] });
        }

        const changes = changesByOwner.get(owner);
        const preAmount = pre?.amount || 0;
        const postAmount = post?.amount || 0;
        const diff = postAmount - preAmount;

        // A negative diff means tokens left (sent) from this owner.
        if (diff < 0) {
          changes.sources.push({
            mint: pre.mint,
            amount: Math.abs(diff),
            tokenInfo: pre.tokenInfo,
            owner: pre.owner,
            decimals: pre.decimals,
          });
        }
        // A positive diff means tokens arrived (received) for this owner.
        else if (diff > 0) {
          changes.destinations.push({
            mint: post.mint,
            amount: diff,
            tokenInfo: post.tokenInfo,
            owner: post.owner,
            decimals: post.decimals,
          });
        }
      }
    });

    // Build the transaction chain by ordering owners as they appear in accountKeys.
    // This guarantees that even one-step chains (i.e. one owner) with both a sending and receiving
    // change hold their changes separately.
    let transactionChain = [];
    const orderedOwners = accountKeys.filter((owner) =>
      changesByOwner.has(owner)
    );
    orderedOwners.forEach((owner) => {
      const changes = changesByOwner.get(owner);
      transactionChain.push({
        owner,
        // Keys are now defined as 'source' and 'destination' (singular)
        source: changes.sources,
        destination: changes.destinations,
      });
    });

    // Determine global endpoints in the chain.
    // For multi-step transactions, the first owner with a sending change is the global sender,
    // and the last owner with a receiving change is the global receiver.
    let firstStep =
      transactionChain.find((step) => step.source.length > 0) ||
      transactionChain[0];
    let lastStep =
      transactionChain
        .slice()
        .reverse()
        .find((step) => step.destination.length > 0) ||
      transactionChain[transactionChain.length - 1];

    // Populate overall token arrays for display.
    const sourceTokens = [];
    const destinationTokens = [];
    if (firstStep) {
      sourceTokens.push(...firstStep.source);
    }
    if (lastStep) {
      destinationTokens.push(...lastStep.destination);
    }

    // -------------------------------
    // End of revised chain construction.
    // -------------------------------

    let primaryAmount = "0 SOL";
    let txType = "unknown";
    let sortValue = 0;

    if (sourceTokens.length > 0 && destinationTokens.length > 0) {
      const firstSource = sourceTokens[0];
      const lastDestination = destinationTokens[destinationTokens.length - 1];
      primaryAmount = `${firstSource.amount.toFixed(4)} ${
        firstSource.tokenInfo?.symbol || "tokens"
      } to ${lastDestination.amount.toFixed(4)} ${
        lastDestination.tokenInfo?.symbol || "tokens"
      }`;
      txType = "swap";
      sortValue = firstSource.amount;
    } else if (sourceTokens.length > 0 || destinationTokens.length > 0) {
      txType = "transfer";
      if (sourceTokens.length > 0) {
        primaryAmount = `${sourceTokens[0].amount.toFixed(4)} ${
          sourceTokens[0].tokenInfo?.symbol || "tokens"
        }`;
        sortValue = sourceTokens[0].amount;
      } else {
        primaryAmount = `${destinationTokens[0].amount.toFixed(4)} ${
          destinationTokens[0].tokenInfo?.symbol || "tokens"
        }`;
        sortValue = destinationTokens[0].amount;
      }
    } else {
      if (accountChanges && accountChanges.length > 0) {
        primaryAmount = `${Math.abs(accountChanges[0].change).toFixed(4)} SOL`;
        sortValue = Math.abs(accountChanges[0].change);
      }
      txType = determineTransactionType(logMessages, instructions, accountKeys);
    }

    const sender =
      sourceTokens.length > 0 ? sourceTokens[0].owner : accountKeys[0];
    const receiver =
      destinationTokens.length > 0
        ? destinationTokens[0].owner
        : accountKeys[1] || accountKeys[0];

    // For swap transactions even in one‐step chains (same owner)
    // the “source” (tokens sent) and “destination” (tokens received) are clearly defined.
    const initialSource = sourceTokens[0];
    const finalDestination = destinationTokens[destinationTokens.length - 1];

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
      sender,
      receiver,
      amount: primaryAmount,
      sortValue,
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
      source: [initialSource],
      destination: [finalDestination],
      transactionChain,
    };
  } catch (error) {
    console.error("Error parsing transaction:", error);
    return null;
  }
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
          const amountA = a.sortValue || 0;
          const amountB = b.sortValue || 0;
          return sortOrder === "desc" ? amountB - amountA : amountA - amountB;
        }
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
