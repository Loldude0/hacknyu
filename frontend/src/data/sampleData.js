export const sampleTransactions = [
  {
    id: "1",
    txHash: "5KtQ9...7Ypx",
    amount: "2.5 SOL",
    timestamp: "2024-02-17 14:30",
    status: "success",
    sender: "8xzt...9Kpq",
    receiver: "3Nmt...2Wsx",
    fee: "0.000005 SOL",
  },
  {
    id: "2",
    txHash: "8Pnm2...4Rtz",
    amount: "1.8 SOL",
    timestamp: "2024-02-17 13:15",
    status: "pending",
    sender: "5Yxc...7Lpk",
    receiver: "9Qws...4Mnb",
    fee: "0.000005 SOL",
  },
  {
    id: "3",
    txHash: "2Wsx4...9Kpq",
    amount: "0.5 SOL",
    timestamp: "2024-02-17 12:45",
    status: "failed",
    sender: "7Hnm...1Rty",
    receiver: "4Fgh...8Jkl",
    fee: "0.000005 SOL",
  },
];

export const sampleNews = [
  {
    id: 1,
    title: "Solana DeFi Protocol Launches New Staking Platform",
    description:
      "A major Solana-based DeFi protocol has announced the launch of a new staking platform, promising higher yields and improved security features for users. The platform will support multiple tokens and offer flexible staking periods.",
    timestamp: "2024-02-17 15:30",
    sentiment: "positive",
    category: "DeFi",
    source: "Solana News",
  },
  {
    id: 2,
    title: "Market Analysis: SOL Price Movement Shows Bearish Trend",
    description:
      "Technical analysis suggests SOL might face resistance at current levels. Trading volume has decreased by 15% in the last 24 hours, indicating potential market uncertainty.",
    timestamp: "2024-02-17 14:45",
    sentiment: "negative",
    category: "Market Analysis",
    source: "Crypto Analytics",
  },
  {
    id: 3,
    title: "New NFT Marketplace Gains Traction on Solana",
    description:
      "A newly launched NFT marketplace on Solana has seen significant growth, with trading volume exceeding 100,000 SOL in its first week. The platform offers unique features including AI-powered price predictions.",
    timestamp: "2024-02-17 13:20",
    sentiment: "positive",
    category: "NFTs",
    source: "NFT Weekly",
  },
  {
    id: 4,
    title: "Security Vulnerability Patched in Popular Solana Wallet",
    description:
      "Developers have successfully patched a minor security vulnerability in a widely-used Solana wallet. Users are advised to update to the latest version, though no funds were reported at risk.",
    timestamp: "2024-02-17 12:15",
    sentiment: "negative",
    category: "Security",
    source: "Blockchain Security",
  },
];

export const sampleContacts = [
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

export const sampleTweetData = {
  tweets: {
    elonmusk: [
      {
        id: "tweet_1",
        text: "Solana's transaction speed is truly impressive. The future of DeFi looks promising! 🚀",
        created_at: "2024-02-20T15:30:00Z",
        likes: 45000,
        retweets: 12000,
        replies: 3500,
        views: 1500000,
        quotes: 2000,
        language: "en",
        analysis: {
          is_crypto_related: true,
          relevance_score: 0.92,
          topics: ["solana", "defi", "technology"],
          sentiment: "positive",
          market_impact_potential: "high",
        },
      },
    ],
    VitalikButerin: [
      {
        id: "tweet_2",
        text: "Layer 2 scaling solutions are showing great progress. Excited to see more innovations in the crypto space.",
        created_at: "2024-02-20T14:15:00Z",
        likes: 32000,
        retweets: 8000,
        replies: 2100,
        views: 900000,
        quotes: 1500,
        language: "en",
        analysis: {
          is_crypto_related: true,
          relevance_score: 0.88,
          topics: ["ethereum", "scaling", "layer2"],
          sentiment: "positive",
          market_impact_potential: "medium",
        },
      },
    ],
    SBF_FTX: [
      {
        id: "tweet_3",
        text: "Market volatility continues as global events impact crypto prices. Stay informed and trade responsibly.",
        created_at: "2024-02-20T13:45:00Z",
        likes: 15000,
        retweets: 4000,
        replies: 1200,
        views: 500000,
        quotes: 800,
        language: "en",
        analysis: {
          is_crypto_related: true,
          relevance_score: 0.85,
          topics: ["market", "trading", "analysis"],
          sentiment: "neutral",
          market_impact_potential: "medium",
        },
      },
    ],
    cz_binance: [
      {
        id: "tweet_4",
        text: "New regulations could significantly impact the crypto market. We're working closely with regulators.",
        created_at: "2024-02-20T12:30:00Z",
        likes: 28000,
        retweets: 7000,
        replies: 1800,
        views: 800000,
        quotes: 1200,
        language: "en",
        analysis: {
          is_crypto_related: true,
          relevance_score: 0.95,
          topics: ["regulation", "compliance", "market"],
          sentiment: "neutral",
          market_impact_potential: "high",
        },
      },
    ],
    cryptoanalyst: [
      {
        id: "tweet_5",
        text: "Just had an amazing lunch at this new restaurant! The pasta was incredible. 🍝",
        created_at: "2024-02-20T11:15:00Z",
        likes: 500,
        retweets: 50,
        replies: 30,
        views: 10000,
        quotes: 5,
        language: "en",
        analysis: {
          is_crypto_related: false,
          relevance_score: 0.1,
          topics: ["food", "lifestyle"],
          sentiment: "positive",
          market_impact_potential: "low",
        },
      },
    ],
  },
  last_processed_ids: {
    elonmusk: "tweet_1",
    VitalikButerin: "tweet_2",
    SBF_FTX: "tweet_3",
    cz_binance: "tweet_4",
    cryptoanalyst: "tweet_5",
  },
};
