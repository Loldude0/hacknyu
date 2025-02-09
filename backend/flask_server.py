from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from datetime import datetime
import json
from dotenv import load_dotenv
import os
from call_agent.coin_methods import getBalance, swap_coin, send_sol_to
from call_agent.get_price import get_coin_price

app = Flask(__name__)
CORS(app)

def get_last_five_transactions(address: str, api_key: str) -> list:
    """
    Fetch the last 5 transactions using Helius API
    
    Args:
        address (str): Solana wallet address
        api_key (str): Helius API key
    """
    try:
        url = f"https://api.helius.xyz/v0/addresses/{address}/transactions?api-key={api_key}"
        
        params = {
            "limit": 5
        }
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        transactions = response.json()
        
        formatted_transactions = []
        
        for tx in transactions:
            # Get the native transfers
            native_transfers = [
                transfer for transfer in tx.get('description', '').split(' | ')
                if 'SOL' in transfer
            ]
            
            transaction = {
                'signature': tx['signature'],
                'timestamp': datetime.fromtimestamp(tx['timestamp']).strftime('%Y-%m-%d %H:%M:%S'),
                'type': tx.get('type', 'UNKNOWN'),
                'fee': tx.get('fee', 0) / 1e9,  # Convert lamports to SOL
                'status': 'Success' if tx.get('successful', False) else 'Failed',
                'transfers': native_transfers,
                'description': tx.get('description', ''),
                'source': tx.get('source', ''),
                'destination': tx.get('destination', ''),
                'amount': tx.get('amount', 0) / 1e9 if tx.get('amount') else 0
            }
            formatted_transactions.append(transaction)
            
        return formatted_transactions
        
    except requests.exceptions.RequestException as e:
        return {"error": f"API request failed: {str(e)}"}
    except Exception as e:
        return {"error": f"An error occurred: {str(e)}"}

@app.route('/get-recent-transactions', methods=['GET'])
def get_transactions():
    load_dotenv()
    address=os.getenv("SOLANA_ADDRESS")
    api_key = os.getenv("HELIUS_API_KEY")
    
    if not api_key:
        return jsonify({"error": "API key not found in environment variables"}), 500
        
    results = get_last_five_transactions(address, api_key)
    
    if "error" in results:
        return jsonify(results), 400
    
    return jsonify(results)

@app.route('/get-balance', methods=['GET'])
def get_balance():
    output=getBalance(os.getenv("SOLANA_ADDRESS"))
    return jsonify(output)

@app.route('/get-price', methods=['POST'])
def get_price():
    coin=request.args.get('coin')
    output=get_coin_price(coin)
    return jsonify(output)

@app.route('/send-sol', methods=['POST'])
def send_sol():
    reciever=request.args.get('reciever')
    amount=request.args.get('amount')
    output=send_sol_to(reciever, amount)
    return jsonify(output)

@app.route('/swap-coin', methods=['POST'])
def swap_coin():
    input_coin=request.args.get('input_coin')
    output_coin=request.args.get('output_coin')
    amount=request.args.get('amount')
    output=swap_coin(input_coin, output_coin, amount)
    return jsonify(output)

@app.route('/init', methods=['POST'])
def save_wallet_settings():
    try:
        data = request.get_json()
   
        required_fields = [
            'public_address', 
            'transaction_limit', 
            'daily_transaction_limit',
            'whitelisted_coins',
            'whitelisted_addresses'
        ]
        
        for field in required_fields:
            if field not in data:
                return jsonify({
                    "error": f"Missing required field: {field}"
                }), 400
     
        settings = {
            "public_address": data['public_address'],
            "transaction_limit": float(data['transaction_limit']),
            "daily_transaction_limit": float(data['daily_transaction_limit']),
            "whitelisted_coins": data['whitelisted_coins'],
            "whitelisted_addresses": data['whitelisted_addresses']
        }
        
        with open(f'files/settings_{data["public_address"]}.json', 'w') as f:
            json.dump(settings, f, indent=2)
            
        return jsonify({
            "message": "Settings saved successfully",
            "settings": settings
        }), 200
            
    except ValueError as e:
        return jsonify({
            "error": "Invalid number format for limits"
        }), 400
    except Exception as e:
        return jsonify({
            "error": f"An error occurred: {str(e)}"
        }), 500

@app.route('/')
def home():
    return "Soana is running!"

if __name__ == '__main__':
    app.run(debug=True, port=5000)