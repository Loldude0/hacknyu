import os
import json
from datetime import datetime, timezone
from dotenv import load_dotenv
import asyncio
import random
from typing import Dict, List, Optional
from pydantic import BaseModel
import enum
from google import genai
import time
from datetime import datetime, timedelta

# Load environment variables
load_dotenv()

# Initialize Gemini
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# List of accounts to scrape (using their IDs as before)
ACCOUNTS_TO_SCRAPE = [
    "elonmusk",
    "realDonaldTrump",
    "VitalikButerin",
    "cz_binance",
    "saylor",
    "jack",
    "BarrySilbert",
    "novogratz",
    "aantonop",
    "CathieDWood",
    "IOHK_Charles",
    "rogerkver",
    "JoelKatz",
    "brian_armstrong",
    "jespow",
    "mcuban",
    "balajis",
    "cdixon",
    "100trillionUSD",
    "CoinDesk",
    "PeterSchiff",
    "jackmallers",
    "NickSzabo4",
    "sama",
    "cobie",
]

JSON_FILE_PATH = "data/tweets.json"

class Sentiment(enum.Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"

class MarketImpact(enum.Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class TweetAnalysis(BaseModel):
    is_crypto_related: bool
    relevance_score: float
    topics: List[str]
    sentiment: Sentiment
    market_impact_potential: MarketImpact

class TweetGenRequest(BaseModel):
    engagement: Dict[str, int]
    username: str

def generate_random_engagement():
    return {
        "likes": random.randint(100, 50000),
        "retweets": random.randint(50, 5000),
        "replies": random.randint(10, 1000),
        "views": random.randint(10000, 1000000),
        "quotes": random.randint(5, 500)
    }

def generate_random_date():
    start_date = datetime(2024, 6, 10)
    end_date = datetime(2025, 2, 8)
    time_between_dates = end_date - start_date
    days_between_dates = time_between_dates.days
    random_number_of_days = random.randrange(days_between_dates)
    random_date = start_date + timedelta(days=random_number_of_days)
    return random_date.replace(
        hour=random.randint(0, 23),
        minute=random.randint(0, 59),
        second=random.randint(0, 59),
        tzinfo=timezone.utc
    )

def generate_tweet_id():
    return str(random.randint(1500000000000000000, 1600000000000000000))

async def generate_tweet_with_gemini(
    engagement: Dict[str, int], username: str
) -> Optional[Dict]:
    prompt = f"""Generate a cryptocurrency-related tweet that would get approximately:
    {engagement['likes']} likes
    {engagement['retweets']} retweets
    {engagement['replies']} replies
    {engagement['views']} views
    {engagement['quotes']} quotes

    The tweet should be from {username} and maintain their typical tweeting style.
    
    Provide the response in JSON format with the following structure:
    - text: the tweet text
    - analysis: {{
        is_crypto_related: true,
        relevance_score: a float between 0.7 and 1.0,
        topics: a list of relevant crypto topics,
        sentiment: one of [positive, negative, neutral],
        market_impact_potential: one of [high, medium, low]
    }}"""

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
        config={
            "response_mime_type": "application/json",
            "response_schema": {
                "type": "object",
                "properties": {
                    "text": {"type": "string"},
                    "analysis": {
                        "type": "object",
                        "properties": {
                            "is_crypto_related": {"type": "boolean"},
                            "relevance_score": {
                                "type": "number",
                                "minimum": 0.7,
                                "maximum": 1.0
                            },
                            "topics": {
                                "type": "array",
                                "items": {"type": "string"}
                            },
                            "sentiment": {
                                "type": "string",
                                "enum": ["positive", "negative", "neutral"]
                            },
                            "market_impact_potential": {
                                "type": "string",
                                "enum": ["high", "medium", "low"]
                            }
                        },
                        "required": [
                            "is_crypto_related",
                            "relevance_score",
                            "topics",
                            "sentiment",
                            "market_impact_potential"
                        ]
                    },
                },
                "required": ["text", "analysis"]
            },
            "temperature": 1.5,
        },
    )

    generated_data = response.parsed
    return generated_data

def load_existing_tweets():
    try:
        if os.path.exists(JSON_FILE_PATH):
            with open(JSON_FILE_PATH, "r", encoding="utf-8") as f:
                return json.load(f)
        return {"tweets": {}, "last_processed_ids": {}}
    except Exception as e:
        print(f"Error loading existing tweets: {str(e)}")
        return {"tweets": {}, "last_processed_ids": {}}

def save_tweets(tweets_data):
    os.makedirs(os.path.dirname(JSON_FILE_PATH), exist_ok=True)
    try:
        with open(JSON_FILE_PATH, "w", encoding="utf-8") as f:
            json.dump(tweets_data, f, ensure_ascii=False, indent=2)
        print(f"Tweets saved successfully at {datetime.now()}")
    except Exception as e:
        print(f"Error saving tweets: {str(e)}")

async def generate_user_tweets(username: str, num_tweets: int = 5) -> List[Dict]:
    tweets = []
    for _ in range(num_tweets):
        # Generate random engagement metrics
        engagement = generate_random_engagement()
        
        # Generate tweet content and analysis with Gemini
        generated_data = await generate_tweet_with_gemini(engagement, username)
        
        if generated_data:
            tweet_data = {
                "id": generate_tweet_id(),
                "text": generated_data["text"],
                "created_at": generate_random_date().isoformat(),
                "likes": engagement["likes"],
                "retweets": engagement["retweets"],
                "replies": engagement["replies"],
                "views": engagement["views"],
                "quotes": engagement["quotes"],
                "language": "en",
                "analysis": generated_data["analysis"]
            }
            tweets.append(tweet_data)

    time.sleep(5)
    
    return tweets

async def generate_all_tweets():

    data = load_existing_tweets()
    
    # Process one user at a time
    for username in ACCOUNTS_TO_SCRAPE:
        print(f"Generating tweets for {username}")
        new_tweets = await generate_user_tweets(username, num_tweets=15)
        
        if new_tweets:
            # Update the tweets for this user
            if username not in data["tweets"]:
                data["tweets"][username] = []
            data["tweets"][username].extend(new_tweets)
            
            # Update the last processed ID
            data["last_processed_ids"][username] = new_tweets[0]["id"]
            
            print(f"Generated {len(new_tweets)} tweets for {username}")
        
        # Save after each user
        save_tweets(data)
        
        # Wait 61 seconds after every 15 requests
        print("Waiting 61 seconds before next batch...")
        await asyncio.sleep(61)
            

if __name__ == "__main__":
    print("Starting tweet generation with Gemini integration...")
    asyncio.run(generate_all_tweets())
