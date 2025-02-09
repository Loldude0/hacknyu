import os
from datetime import datetime, timedelta
from newsapi import NewsApiClient
from google import genai
from dotenv import load_dotenv
import json
from pydantic import BaseModel
from typing import List, Literal
from pathlib import Path
from pydantic import ValidationError
import time

# Load environment variables
load_dotenv()

# Initialize APIs
newsapi = NewsApiClient(api_key=os.getenv('NEWS_API_KEY'))
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Create data directory if it doesn't exist
DATA_DIR = Path(__file__).parent.parent / 'data'
DATA_DIR.mkdir(exist_ok=True)
NEWS_FILE = DATA_DIR / 'news.json'

# Define the schema for AI analysis
class NewsAnalysis(BaseModel):
    summary: str
    related_cryptocurrency: List[str]
    sentiment: Literal["positive", "negative"]
    market_impact_potential: Literal["low", "medium", "high"]

def analyze_news_with_ai(title, description):
    """Analyze news content using Gemini AI with structured output."""
    prompt = f"""
    Analyze this crypto news:
    Title: {title}
    Description: {description}
    
    Provide a detailed analysis of this crypto news article.
    """
    time.sleep(10)
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
        config={
            'response_mime_type': 'application/json',
            'response_schema': NewsAnalysis.schema(),
            'temperature': 0.1,
        }
    )
    return response.parsed

def save_news_to_file(news_data):
    """Save news data to JSON file with timestamp."""
    try:
        # Add timestamp to the data
        data_to_save = {
            'last_updated': datetime.now().isoformat(),
            'news_items': news_data
        }
        
        with open(NEWS_FILE, 'w', encoding='utf-8') as f:
            json.dump(data_to_save, f, indent=2, ensure_ascii=False)
        print(f"News data saved to {NEWS_FILE}")
    except Exception as e:
        print(f"Error saving news data: {e}")

def get_crypto_news():
    """Fetch and analyze crypto news articles."""
    try:
        # Get news from the last 3 days
        from_date = (datetime.now() - timedelta(days=3)).strftime('%Y-%m-%d')
        
        # Fetch news about cryptocurrency
        news = newsapi.get_everything(
            q='cryptocurrency OR bitcoin OR crypto',
            from_param=from_date,
            language='en',
            sort_by='publishedAt',
            page_size=50
        )
        
        analyzed_news = []
        
        for article in news['articles'][:50]:  # Limit to 50 articles
            title = article.get('title', '')
            print(f"Analyzing news: {title}")
            description = article.get('description', '')
            
            if not title or not description:
                continue
                
            ai_analysis = analyze_news_with_ai(title, description)
            
            if not ai_analysis:
                continue
                
            try:
                analysis = NewsAnalysis(**ai_analysis)
            except ValidationError as e:
                print(f"Validation error: {e}")
                continue

            news_item = {
                'time': article.get('publishedAt'),
                'headline': title,
                'url': article.get('url'),
                'summary': analysis.summary,
                'related_cryptocurrency': analysis.related_cryptocurrency,
                'sentiment': analysis.sentiment,
                'market_impact_potential': analysis.market_impact_potential
            }
            
            analyzed_news.append(news_item)
        
        # Save the analyzed news to file
        save_news_to_file(analyzed_news)
            
        return analyzed_news
        
    except Exception as e:
        print(f"Error fetching news: {e}")
        return []

if __name__ == "__main__":
    # Test the function
    news = get_crypto_news()
    print(f"Retrieved {len(news)} news items")
    if news:
        # Print first item as example
        print("\nExample news item:")
        print(json.dumps(news[0], indent=2)) 