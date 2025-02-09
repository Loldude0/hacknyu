const API_BASE_URL = "http://127.0.0.1:5000/api";

export const fetchRecentTransactions = async (walletAddress) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/transactions?wallet=${walletAddress}`,
      {
        method: "GET",
        mode: "cors",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch transactions");
    }

    return data.data.map((tx) => ({
      ...tx,
      timestamp: tx.timestamp
        ? new Date(tx.timestamp * 1000).toLocaleString()
        : "Unknown time",
      // Shorten addresses for display
      from: tx.from
        ? `${tx.from.slice(0, 4)}...${tx.from.slice(-4)}`
        : "Unknown",
      to: tx.to ? `${tx.to.slice(0, 4)}...${tx.to.slice(-4)}` : "Unknown",
    }));
  } catch (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }
};
