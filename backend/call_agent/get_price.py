import requests
from datetime import datetime
from typing import Dict, Union
from dotenv import load_dotenv
import os
import requests
from typing import List, Dict
from datetime import datetime
from openai import OpenAI
import json

load_dotenv(override=True)
api_key = os.getenv("COINGECKO_API_KEY")
OPENAI_KEY=os.getenv("OPENAI_API_KEY")
client=OpenAI(api_key=OPENAI_KEY)

messages=[{
             'role': 'system',
                'content': f""""You are a crypto expert analyst whose job is to look though trending coins and news snippets 
                to suggest trending coins and advancements to the user.
                Make sure you properly suggest coins based on both stats and news advancements.

                """
            }]


def get_coin_price(coin_id: str, api_key: str = "YOUR-API-KEY-HERE") -> Dict[str, Union[str, float]]:
    """
    Fetch the current price of a cryptocurrency using the CoinGecko API.
    
    Args:
        coin_id (str): The CoinGecko ID of the cryptocurrency (e.g., 'bitcoin', 'ethereum')
        api_key (str): Your CoinGecko API key
    
    Returns:
        dict: Dictionary containing coin information including:
            - coin: The coin ID
            - price_usd: Current price in USD
            - timestamp: Time when the price was fetched
    """
    try:
        # CoinGecko API endpoint
        coin_id = coin_id.lower()
        url = f"https://api.coingecko.com/api/v3/simple/price"
        params = {
            "ids": coin_id,
            "vs_currencies": "usd"
        }
        
        headers = {
            "X-CG-API-KEY": api_key
        }
        
        # Make the API request
        response = requests.get(url, params=params, headers=headers)
        response.raise_for_status()
        
        # Parse the response
        data = response.json()
        
        # Check if the coin exists in the response
        if coin_id not in data:
            raise ValueError(f"Coin '{coin_id}' not found! Please check the coin ID.")
        
        return {
            "coin": coin_id,
            "price_usd": data[coin_id]["usd"],
            "timestamp": datetime.now().isoformat()
        }
        
    except requests.exceptions.RequestException as e:
        raise Exception(f"Error fetching price: {str(e)}")
    except (KeyError, ValueError) as e:
        raise ValueError(f"Error parsing response: {str(e)}")

def get_top_5_trending() -> List[Dict]:
    """
    Fetch the top 5 trending cryptocurrencies from CoinGecko.
    
    Args:
        api_key (str): Your CoinGecko API key

    Returns:
        list: Top 5 trending coins with their details
    """
    try:
        url = "https://api.coingecko.com/api/v3/search/trending"
        
        headers = {
            "X-CG-API-KEY": api_key
        }
        
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        
        # Extract only the top 5 trending coins
        trending_coins = []
        for coin in data['coins'][:5]:  # Limit to first 5 coins
            item = coin['item']
            trending_coins.append({
                'rank': len(trending_coins) + 1,  # Add ranking 1-5
                'name': item['name'],
                'symbol': item['symbol'].upper(),
                'price_btc': item['price_btc'],
                'market_cap_rank': item['market_cap_rank']
            })
        with open("../../data/news.json") as f:
            news = json.load(f)

        formatted_user_query = f"""

        This are the current trending coins
        {str(trending_coins)}
        This are some recent news snippets
        {str(news)}
         """
        messages.append(
                {
                    'role': 'user',
                    'content': formatted_user_query
                })
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
        )
        out = response.choices[0].message.content
        return out
    except requests.exceptions.RequestException as e:
        raise Exception(f"Error fetching trending coins: {str(e)}")
    except (KeyError, ValueError) as e:
        raise ValueError(f"Error parsing response: {str(e)}")

# Example usage:
if __name__ == "__main__":
    try:
        
        btc_price = get_coin_price('bitcoin')
        print(f"Bitcoin price: ${btc_price['price_usd']:,.2f}")
        
        eth_price = get_coin_price('ethereum')
        print(f"Ethereum price: ${eth_price['price_usd']:,.2f}")
        

        trending = get_top_5_trending()
        print("Top 5 Trending Cryptocurrencies")
        print("-" * 50)
        
        for coin in trending:
            print(f"#{coin['rank']} - {coin['name']} ({coin['symbol']})")
            print(f"Price in BTC: {coin['price_btc']:.8f}")
            print(f"Market Cap Rank: #{coin['market_cap_rank'] if coin['market_cap_rank'] else 'N/A'}")
            print("-" * 50)
    except Exception as e:
        print(f"Error: {str(e)}")