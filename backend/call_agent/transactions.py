from solders.hash import Hash
from solders.keypair import Keypair
from solders.message import MessageV0
from solders.rpc.requests import GetTokenAccountBalance
from solders.system_program import TransferParams, transfer
from solders.transaction import VersionedTransaction
from solana.rpc.api import Client
from solders.pubkey import Pubkey
from spl.token.instructions import transfer_checked, TransferCheckedParams
from solders.instruction import Instruction, AccountMeta
from spl.token.client import Token
from spl.token._layouts import MINT_LAYOUT
def lamportToSol(ammount: int): 
    return ammount/1_000_000_000

def solToLamport(ammount: int):
    return ammount*1_000_000_000

def get_token_decimals(mint_address):
    # Connect to Solana
    http_client = Client("https://api.mainnet-beta.solana.com")
    
    # Convert address string to PublicKey if needed
    mint_pubkey = Pubkey.from_string(mint_address)
    
    # Get account info
    info = http_client.get_account_info(mint_pubkey)
    
    # Parse decimals from mint layout
    decimals = MINT_LAYOUT.parse(info.value.data).decimals
    return decimals



def send_sol(sender: Keypair, receiver: Pubkey, amount_sol): 
    amount_lamports = int(solToLamport(amount_sol))
    # Initialize Solana client
    client = Client("https://api.mainnet-beta.solana.com")
    
    print(client.get_balance(sender.pubkey()))

    # Create transfer instruction
    ix = transfer(
        TransferParams(
            from_pubkey=sender.pubkey(),
            to_pubkey=receiver,
            lamports=amount_lamports
        )
    )
    
    # Get recent blockhash
    blockhash = client.get_latest_blockhash().value.blockhash
    
    # Create message
    msg = MessageV0.try_compile(
        payer=sender.pubkey(),
        instructions=[ix],
        address_lookup_table_accounts=[],
        recent_blockhash=blockhash
    )
    
    # Create and sign transaction
    tx = VersionedTransaction(msg, [sender])
    
    # Send transaction
    result = client.send_transaction(tx)


    
    return result.value  # Returns transaction signature that can be used to get more info about tx



# Initialize sender wallet (replace with your keypair)
# Send 0.1 SOL (100000000 lamports)

# signature = send_sol(sender, receiver, 0.05)
# print(f"Transaction signature: {signature}")


def getBalance(publicKey: Pubkey) -> float:
    client = Client("https://api.mainnet-beta.solana.com")

    return lamportToSol(client.get_balance(publicKey).value)


import requests
import json

def get_jupiter_quote(input_mint, output_mint, amount):
    url = f"https://api.jup.ag/swap/v1/quote?inputMint={input_mint}&outputMint={output_mint}&amount={amount}&slippageBps=50&restrictIntermediateTokens=true"
    headers = {'Accept': 'application/json'}
    params = {
        "inputMint": input_mint,        # Input token mint address
        "outputMint": output_mint,      # Output token mint address
        "amount": amount,               # Amount in input token's native units
        "slippageBps": 50              # Slippage tolerance of 0.5%
    }
    
    response = requests.get(url, headers=headers, data=params)


    print(response.json())
    return response.json()

def get_swap_instructions(route, public_key):
    url = "https://api.jup.ag/swap/v1/swap"
    headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
    }
    payload = {
        "quoteResponse": route,
        "userPublicKey": public_key,  # Your wallet public key
        "wrapUnwrapSOL": True                        # Auto wrap/unwrap SOL
    }
    
    response = requests.post(url, headers=headers, json=payload)
    print(response.json())
    return response.json()


import base64
def execute_jupiter_swap(input_mint: str,output_mint: str, amount: float, wallet_keypair: Keypair, public_key: str):

    amount=smallToReal(amount, input_mint)

    client = Client("https://api.mainnet-beta.solana.com")
    # 1. Get quote
    quote = get_jupiter_quote(input_mint, output_mint, amount)
    
    # 2. Get swap instructions
    swap_instructions = get_swap_instructions(quote, public_key)

    transaction_bytes = base64.b64decode(swap_instructions['swapTransaction'])
    transaction = VersionedTransaction.from_bytes(transaction_bytes)
    signed = VersionedTransaction(transaction.message, [wallet_keypair])

    serialized = bytes(signed)
    signature = client.send_transaction(VersionedTransaction.from_bytes(serialized))   


    return signature.value

def smallToReal(amount, addy):
    return int(amount * (10**get_token_decimals(addy)))


# Example token addresses (USDC and SOL)
# INPUT_MINT = "So11111111111111111111111111111111111111112"  
# OUTPUT_MINT = "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump"   
# print(smallToReal(0.05, INPUT_MINT))