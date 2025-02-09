import React, { useState } from "react";
import { FunnelSimple, MagnifyingGlass } from "@phosphor-icons/react";
import NewsCard from "./NewsCard";
import { sampleNews } from "../data/sampleData";

const NewsAndInsights = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", "DeFi", "Market Analysis", "NFTs", "Security"];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">News & Insights</h2>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
            <FunnelSimple size={20} />
            <span>Filter</span>
          </button>
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
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 w-full md:w-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                selectedCategory === category
                  ? "bg-purple-500 text-white"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sampleNews.map((news) => (
          <NewsCard key={news.id} news={news} />
        ))}
      </div>
    </div>
  );
};

export default NewsAndInsights;
