import os
import json
from datetime import datetime
from dotenv import load_dotenv
from twscrape import AccountsPool, API
import asyncio
import time
import google.generativeai as genai
from typing import Dict, List, Optional
from pydantic import BaseModel
import enum

# Load environment variables
load_dotenv()

# Initialize Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-pro")

# List of accounts to scrape
ACCOUNTS_TO_SCRAPE = [
    "44196397",
    "25073877",
    "295218901",
    "902926941413453824",
    "244647486",
    "12",
    "396045469",
    "19847181",
    "1469101279",
    "2361631088",
    "1376161898",
    "176758255",
    "35749949",
    "14379660",
    "66950686",
    "16228398",
    "2178012643",
    "2529971",
    "918804624303382528",
    "1333467482",
    "56562803",
    "2360241314",
    "2568108282",
    "1605",
    "2259434528",
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


async def analyze_tweet_with_gemini(
    tweet_text: str, username: str
) -> Optional[TweetAnalysis]:
    try:
        prompt = f"""Analyze this tweet by {username} for cryptocurrency relevance:
        Tweet: "{tweet_text}"
        
        Determine if this tweet is related to cryptocurrency or could affect the crypto market."""

        response = model.generate_content(
            prompt,
            config={
                "response_mime_type": "application/json",
                "response_schema": TweetAnalysis,
                "temperature": 0.1,
            },
        )

        # The response is already structured according to our schema
        return TweetAnalysis(**response.parsed)
    except Exception as e:
        print(f"Error analyzing tweet with Gemini: {str(e)}")
        return None


async def setup_twitter():
    # Initialize the accounts pool
    pool = AccountsPool()

    # Get credentials from environment variables
    username = os.getenv("TWITTER_USERNAME")
    password = os.getenv("TWITTER_PASSWORD")
    email = os.getenv("TWITTER_EMAIL")
    email_password = os.getenv("TWITTER_EMAIL_PASSWORD")
    try:
        await pool.add_account(username, password, email, email_password)
        print("Account added successfully!")

        # Login to all accounts
        await pool.login_all()
        print("Successfully logged in!")

        return API(pool)
    except Exception as e:
        print(f"Error during setup: {str(e)}")
        return None


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
    # Ensure the data directory exists
    os.makedirs(os.path.dirname(JSON_FILE_PATH), exist_ok=True)

    try:
        with open(JSON_FILE_PATH, "w", encoding="utf-8") as f:
            json.dump(tweets_data, f, ensure_ascii=False, indent=2)
        print(f"Tweets saved successfully at {datetime.now()}")
    except Exception as e:
        print(f"Error saving tweets: {str(e)}")


async def fetch_user_tweets(api, username: str, existing_data: Dict) -> List[Dict]:
    try:
        # Get the last processed tweet ID for this user
        last_processed_id = existing_data.get("last_processed_ids", {}).get(username)

        # Get user tweets
        tweets = []
        async for tweet in api.user_tweets(username, limit=50):
            # Stop if we"ve reached previously processed tweets
            if last_processed_id and tweet.id <= last_processed_id:
                break

            tweet_data = {
                    "id": tweet.id,
                    "text": tweet.rawContent,
                    "created_at": tweet.date.isoformat(),
                    "likes": tweet.likeCount,
                    "retweets": tweet.retweetCount, 
                    "replies": tweet.replyCount,
                    "views": tweet.viewCount,
                    "quotes": tweet.quoteCount,
                    "language": tweet.lang,
            }
            print(tweet_data)
            # Analyze tweet with Gemini
            analysis = await analyze_tweet_with_gemini(tweet.rawContent, username)

            # Only include crypto-related tweets
            if analysis and analysis.is_crypto_related:
                tweet_data = {
                    "id": tweet.id,
                    "text": tweet.rawContent,
                    "created_at": tweet.date.isoformat(),
                    "likes": tweet.likeCount,
                    "retweets": tweet.retweetCount, 
                    "replies": tweet.replyCount,
                    "views": tweet.viewCount,
                    "quotes": tweet.quoteCount,
                    "language": tweet.lang,
                    "analysis": analysis.dict(),
                }
                tweets.append(tweet_data)

        return tweets
    except Exception as e:
        print(f"Error fetching tweets for {username}: {str(e)}")
        return []


async def scrape_tweets():
    api = await setup_twitter()
    if not api:
        print("Failed to initialize Twitter API")
        return

    while True:
        try:
            # Load existing tweets
            data = load_existing_tweets()

            # Process accounts in batches of 50
            for i in range(0, len(ACCOUNTS_TO_SCRAPE), 50):
                batch = ACCOUNTS_TO_SCRAPE[i : i + 50]
                print(f"Processing batch of accounts {i+1}-{i+len(batch)}")
                j = 0
                for username in batch:
                    new_tweets = await fetch_user_tweets(api, username, data)
                    if new_tweets:
                        # Update the tweets for this user
                        if username not in data["tweets"]:
                            data["tweets"][username] = []
                        data["tweets"][username].extend(new_tweets)

                        # Update the last processed ID
                        if new_tweets:
                            data["last_processed_ids"][username] = new_tweets[0]["id"]

                        print(
                            f"Fetched and analyzed {len(new_tweets)} crypto-related tweets from {username}"
                        )
                    if j % 3 == 0:
                        time.sleep(15*60)
                    j += 1

                # Save after each batch
                save_tweets(data)

                # If there are more accounts to process, wait 16 minutes
                if i + 50 < len(ACCOUNTS_TO_SCRAPE):
                    print("Waiting 16 minutes before processing next batch...")
                    await asyncio.sleep(960)  # 16 minutes in seconds

            # After processing all accounts, wait 16 minutes before starting again
            print(
                "Completed full cycle. Waiting 16 minutes before starting next cycle..."
            )
            await asyncio.sleep(960)

        except Exception as e:
            print(f"Error in main scraping loop: {str(e)}")
            await asyncio.sleep(960)  # Wait 16 minutes before retrying


# Run the scraper
if __name__ == "__main__":
    # Create data directory if it doesn"t exist
    os.makedirs(os.path.dirname(JSON_FILE_PATH), exist_ok=True)

    print("Starting Twitter scraper with Gemini integration...")
    asyncio.run(scrape_tweets())
