import React, { useState, useMemo } from "react";
import {
  FunnelSimple,
  MagnifyingGlass,
  ArrowUp,
  ArrowDown,
  Eye,
  ChatCircle,
  ArrowsClockwise,
  Heart,
  X,
  CaretDown,
} from "@phosphor-icons/react";
import { sampleTweetData } from "../data/sampleData";

const NewsAndInsights = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("time"); // 'time', 'relevance', 'likes'
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' or 'desc'

  // Transform the nested tweet data into a flat array and filter crypto-related tweets
  const tweets = useMemo(() => {
    const allTweets = [];
    Object.entries(sampleTweetData.tweets).forEach(([username, userTweets]) => {
      userTweets.forEach((tweet) => {
        if (tweet.analysis.is_crypto_related) {
          allTweets.push({
            ...tweet,
            username,
          });
        }
      });
    });

    // Filter by search query
    const filteredTweets = searchQuery
      ? allTweets.filter((tweet) =>
          tweet.text.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : allTweets;

    // Apply sorting
    return filteredTweets.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "relevance":
          comparison = b.analysis.relevance_score - a.analysis.relevance_score;
          break;
        case "likes":
          comparison = b.likes - a.likes;
          break;
        case "time":
        default:
          comparison = new Date(b.created_at) - new Date(a.created_at);
          break;
      }
      return sortOrder === "desc" ? comparison : -comparison;
    });
  }, [sortBy, sortOrder, searchQuery]);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getImpactColor = (impact) => {
    switch (impact.toLowerCase()) {
      case "high":
        return "text-red-500 bg-red-50";
      case "medium":
        return "text-yellow-500 bg-yellow-50";
      case "low":
        return "text-green-500 bg-green-50";
      default:
        return "text-gray-500 bg-gray-50";
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return <ArrowUp size={16} className="text-green-500" weight="bold" />;
      case "negative":
        return <ArrowDown size={16} className="text-red-500" weight="bold" />;
      default:
        return (
          <ArrowsClockwise
            size={16}
            className="text-yellow-500"
            weight="bold"
          />
        );
    }
  };

  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      // Toggle sort order if clicking the same sort option
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      // Set new sort option and default to descending order
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">News & Insights</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                showFilters
                  ? "bg-purple-100 text-purple-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <FunnelSimple size={20} />
              <span>Sort By</span>
              <CaretDown
                size={16}
                className={`transform transition-transform duration-200 ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Filter Dropdown */}
            {showFilters && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => handleSort("time")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                      sortBy === "time"
                        ? "bg-purple-50 text-purple-600"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <span>Time</span>
                    {sortBy === "time" && (
                      <ArrowsClockwise
                        size={16}
                        className={`transform ${
                          sortOrder === "asc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>
                  <button
                    onClick={() => handleSort("relevance")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                      sortBy === "relevance"
                        ? "bg-purple-50 text-purple-600"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <span>Relevance</span>
                    {sortBy === "relevance" && (
                      <ArrowsClockwise
                        size={16}
                        className={`transform ${
                          sortOrder === "asc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>
                  <button
                    onClick={() => handleSort("likes")}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                      sortBy === "likes"
                        ? "bg-purple-50 text-purple-600"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <span>Likes</span>
                    {sortBy === "likes" && (
                      <ArrowsClockwise
                        size={16}
                        className={`transform ${
                          sortOrder === "asc" ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-1 relative w-full">
          <MagnifyingGlass
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search tweets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {tweets.map((tweet) => (
          <div
            key={tweet.id}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-purple-500">
                    @{tweet.username}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    {formatDate(tweet.created_at)}
                  </span>
                </div>
                <p className="text-gray-900 dark:text-white">{tweet.text}</p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <div className="flex items-center space-x-2">
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(
                      tweet.analysis.market_impact_potential
                    )}`}
                  >
                    {tweet.analysis.market_impact_potential.toUpperCase()}
                  </div>
                  <div className="flex items-center space-x-1 px-2 py-1 rounded-full bg-gray-50">
                    {getSentimentIcon(tweet.analysis.sentiment)}
                    <span className="text-xs font-medium capitalize">
                      {tweet.analysis.sentiment}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Relevance: {(tweet.analysis.relevance_score * 100).toFixed(0)}
                  %
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-gray-500 text-sm">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Heart size={16} />
                  <span>{formatNumber(tweet.likes)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ArrowsClockwise size={16} />
                  <span>{formatNumber(tweet.retweets)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ChatCircle size={16} />
                  <span>{formatNumber(tweet.replies)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye size={16} />
                  <span>{formatNumber(tweet.views)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsAndInsights;
