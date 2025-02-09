import requests
import json
import time
from datetime import datetime, timedelta
from typing import List, Dict, Any
from concurrent.futures import ThreadPoolExecutor, as_completed

def get_account_transactions(
    account_pubkey: str,
    quicknode_url: str,
    limit: int = 100,  # Smaller batch size for better reliability
    retry_delay: float = 1.0,
    max_retries: int = 5,  # Increased retries
    batch_delay: float = 0.2,  # Increased delay between batches
    max_workers: int = 4  # Reduced workers to avoid rate limits
) -> List[Dict[str, Any]]:
    """
    Retrieve ALL transactions for a Solana account from exactly the past year using optimized parallel processing.
    """
    headers = {
        "Content-Type": "application/json"
    }
    
    all_transactions = []
    one_year_ago = int((datetime.now() - timedelta(days=365)).timestamp())
    
    def make_request(payload, current_retry=0):
        try:
            response = requests.post(quicknode_url, headers=headers, json=payload)
            response.raise_for_status()
            if current_retry > 0:
                time.sleep(batch_delay)
            return response.json()
        except requests.exceptions.HTTPError as e:
            if current_retry < max_retries:
                wait_time = retry_delay * (2 ** current_retry)
                print(f"Request failed, retrying in {wait_time:.1f} seconds... (Attempt {current_retry + 1}/{max_retries})")
                time.sleep(wait_time)
                return make_request(payload, current_retry + 1)
            raise Exception(f"API request failed after {max_retries} retries: {str(e)}")
        except Exception as e:
            if current_retry < max_retries:
                time.sleep(retry_delay)
                return make_request(payload, current_retry + 1)
            raise Exception(f"Request failed: {str(e)}")

    def get_signatures(before=None, until=None):
        config = {
            "limit": limit,
        }
        if before:
            config["before"] = before
        if until:
            config["until"] = until
            
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getSignaturesForAddress",
            "params": [
                account_pubkey,
                config
            ]
        }
        return make_request(payload)
    
    def process_transaction(sig):
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getTransaction",
            "params": [
                sig,
                {
                    "encoding": "json",
                    "maxSupportedTransactionVersion": 0,
                    "commitment": "confirmed"
                }
            ]
        }
        result = make_request(payload)
        if result.get("result"):
            timestamp = result["result"].get("blockTime", 0)
            if timestamp >= one_year_ago:
                return result["result"]
        return None

    def process_batch(signatures):
        results = []
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = {executor.submit(process_transaction, sig["signature"]): sig["signature"] 
                      for sig in signatures}
            
            for future in as_completed(futures):
                sig = futures[future]
                try:
                    result = future.result()
                    if result:
                        results.append(result)
                except Exception as e:
                    print(f"Error processing transaction {sig}: {str(e)}")
                    # Add retry logic for failed transactions
                    try:
                        time.sleep(retry_delay)
                        result = process_transaction(sig)
                        if result:
                            results.append(result)
                    except Exception as retry_e:
                        print(f"Retry failed for transaction {sig}: {str(retry_e)}")
        return results

    try:
        last_signature = None
        continue_fetching = True
        batch_count = 0
        total_signatures_found = 0
        
        print("\nFetching all transactions from the past year...")
        
        while continue_fetching:
            batch_count += 1
            print(f"\nFetching signatures batch {batch_count}...")
            
            data = get_signatures(last_signature)
            
            if "error" in data:
                error_msg = data["error"].get("message", str(data["error"]))
                raise Exception(f"RPC error: {error_msg}")
                
            signatures = data.get("result", [])
            if not signatures:
                print("No more signatures found.")
                break
                
            total_signatures_found += len(signatures)
            print(f"Total signatures found so far: {total_signatures_found}")
            
            # Check timestamps and process valid signatures
            valid_signatures = []
            for sig in signatures:
                if sig.get("blockTime", 0) >= one_year_ago:
                    valid_signatures.append(sig)
                else:
                    continue_fetching = False
                    break
            
            if valid_signatures:
                print(f"Processing batch of {len(valid_signatures)} transactions...")
                batch_results = process_batch(valid_signatures)
                all_transactions.extend(batch_results)
                last_signature = signatures[-1]["signature"]
                
                print(f"Successfully processed transactions: {len(all_transactions)}/{total_signatures_found}")
                
                # Add a delay between batches to avoid rate limits
                time.sleep(batch_delay)
            else:
                print("No more transactions within the time range.")
                break
            
            if not continue_fetching:
                print("Reached transactions older than one year.")
                break
            
    except Exception as e:
        print(f"\nError during processing: {str(e)}")
        if all_transactions:
            print(f"Saving {len(all_transactions)} transactions that were successfully fetched...")
        else:
            raise
    
    return all_transactions

# Example usage:
if __name__ == "__main__":
    try:
        account = input("Enter Solana account public key: ")
        quicknode_url = input("Enter your Quicknode RPC URL: ")
        
        print("\nStarting transaction fetch...")
        start_time = time.time()
        
        transactions = get_account_transactions(
            account_pubkey=account,
            quicknode_url=quicknode_url
        )
        
        # Save to JSON file
        filename = f"transactions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, "w") as f:
            json.dump(transactions, f, indent=2)
            
        elapsed_time = time.time() - start_time
        print(f"\nFound {len(transactions)} transactions")
        print(f"Saved to {filename}")
        print(f"Total time: {elapsed_time:.2f} seconds")
        
    except Exception as e:
        print(f"\nError: {str(e)}")