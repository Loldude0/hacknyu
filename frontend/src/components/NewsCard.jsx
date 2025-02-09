import React, { useState } from "react";
import { ArrowUp, ArrowDown, Bookmark, Share } from "@phosphor-icons/react";

const NewsCard = ({ news }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const getSentimentColor = (sentiment) => {
    return sentiment === "positive"
      ? "text-green-500 bg-green-50 border-green-100"
      : "text-red-500 bg-red-50 border-red-100";
  };

  const getSentimentIcon = (sentiment) => {
    return sentiment === "positive" ? (
      <ArrowUp size={16} weight="bold" />
    ) : (
      <ArrowDown size={16} weight="bold" />
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md">
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-gray-500">
                {news.category}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">{news.source}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {news.title}
            </h3>
          </div>
          <div
            className={`flex items-center px-2 py-1 rounded-full border ${getSentimentColor(
              news.sentiment
            )}`}
          >
            {getSentimentIcon(news.sentiment)}
            <span className="ml-1 text-xs font-medium capitalize">
              {news.sentiment}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          {news.description}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500">{news.timestamp}</span>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className={`p-2 rounded-full transition-colors duration-200 ${
                isBookmarked
                  ? "text-purple-500 bg-purple-50"
                  : "text-gray-400 hover:text-purple-500 hover:bg-purple-50"
              }`}
            >
              <Bookmark size={20} weight={isBookmarked ? "fill" : "regular"} />
            </button>
            <button className="p-2 rounded-full text-gray-400 hover:text-purple-500 hover:bg-purple-50 transition-colors duration-200">
              <Share size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
