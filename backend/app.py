from flask import Flask, jsonify
from flask_cors import CORS
import json
from pathlib import Path

app = Flask(__name__)
CORS(app)

# Create data directory if it doesn't exist
DATA_DIR = Path(__file__).parent.parent / 'data'
DATA_DIR.mkdir(exist_ok=True)

@app.route('/api/crypto-news', methods=['GET'])
def crypto_news():
    try:
        news_file = DATA_DIR / 'news.json'
        with open(news_file, 'r') as f:
            news_data = json.load(f)
        return jsonify({"success": True, "data": news_data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
