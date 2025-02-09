import React, { useState } from "react";
import {
  TrendUp,
  TrendDown,
  ArrowRight,
  Clock,
  Warning,
  Lightning,
} from "@phosphor-icons/react";
import newsData from "../../../data/news.json";

const NewsAndInsights = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Filter and sort news items
  const filteredNews = newsData.news_items
    .filter((item) => {
      if (selectedCategory === "all") return true;
      if (selectedCategory === "positive") return item.sentiment === "positive";
      if (selectedCategory === "negative") return item.sentiment === "negative";
      return true;
    })
    .sort((a, b) => new Date(b.time) - new Date(a.time));

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">News & Insights</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === "all"
                ? "bg-purple-500 text-white"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedCategory("positive")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === "positive"
                ? "bg-green-500 text-white"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            Bullish
          </button>
          <button
            onClick={() => setSelectedCategory("negative")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === "negative"
                ? "bg-red-500 text-white"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            Bearish
          </button>
        </div>
      </div>

      {/* News Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredNews.map((news, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {news.market_impact_potential === "high" && (
                    <Lightning
                      size={20}
                      className="text-yellow-500"
                      weight="fill"
                    />
                  )}
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      news.sentiment === "positive"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {news.sentiment === "positive" ? (
                      <div className="flex items-center">
                        <TrendUp size={14} className="mr-1" />
                        Bullish
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <TrendDown size={14} className="mr-1" />
                        Bearish
                      </div>
                    )}
                  </div>
                  {news.related_cryptocurrency.map((crypto, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium"
                    >
                      {crypto}
                    </span>
                  ))}
                </div>
                <h3 className="text-lg font-semibold mb-2">{news.headline}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {news.summary}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock size={16} className="mr-1" />
                    {formatDate(news.time)}
                  </div>
                  <a
                    href={news.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-purple-500 hover:text-purple-600 text-sm font-medium"
                  >
                    Read More
                    <ArrowRight size={16} className="ml-1" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Last Updated */}
      <div className="mt-4 text-center text-sm text-gray-500">
        Last updated: {formatDate(newsData.last_updated)}
      </div>
    </div>
  );
};

export default NewsAndInsights;
