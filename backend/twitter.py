import os
from dotenv import load_dotenv
from twscrape import AccountsPool, API
import asyncio

# Load environment variables
load_dotenv()

async def setup_twitter():
    # Initialize the accounts pool
    pool = AccountsPool()
    
    # Get credentials from environment variables
    username = os.getenv("TWITTER_USERNAME")
    password = os.getenv("TWITTER_PASSWORD")
    email = os.getenv("TWITTER_EMAIL")
    email_password = os.getenv("TWITTER_EMAIL_PASSWORD")
    
    # Add account to the pool
    try:
        await pool.add_account(username, password, email, email_password)
        print("Account added successfully!")
        
        # Login to all accounts
        await pool.login_all()
        print("Successfully logged in!")
        
        return pool
    except Exception as e:
        print(f"Error during setup: {str(e)}")
        return None

# Run the setup
if __name__ == "__main__":
    asyncio.run(setup_twitter())
