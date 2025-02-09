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


def lamportToSol(ammount: int): 
    return ammount/1_000_000_000

def solToLamport(ammount: int):
    return ammount*1_000_000_000

def send_sol(sender: Keypair, receiver: Pubkey, amount_sol: int): 
    amount_lamports = solToLamport(amount_sol)
    # Initialize Solana client
    client = Client("https://api.devnet.solana.com")
    
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
sender = Keypair.from_base58_string("2PgjehR2CXESrgb5y6SPpF8nJDeXquDeqUWvd48HfiCE1p5qeJ1LWqvJf2jLqpnLgdQCjx7x5F7WPQjeX4wc9AAf")

# Receiver's public key
receiver = Pubkey.from_string("HEmpRb9etVX6oivUmGvhxYzc171mBYKgQ79wTeqvRpa7")

# Send 0.1 SOL (100000000 lamports)

# signature = send_sol(sender, receiver, 1)
# print(f"Transaction signature: {signature}")


def getBalance(publicKey: Pubkey) -> float:
    client = Client("https://api.devnet.solana.com")

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

def get_swap_instructions(route):
    url = "https://api.jup.ag/swap/v1/swap"
    headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
    }
    payload = {
        "quoteResponse": route,
        "userPublicKey": "EcuKzCh7zZXUvTpq3Ao2S2rVS2h9WoLRkNdi9JkuByt7",  # Your wallet public key
        "wrapUnwrapSOL": True                        # Auto wrap/unwrap SOL
    }
    
    response = requests.post(url, headers=headers, json=payload)
    print(response.json())
    return response.json()


import base64
def execute_jupiter_swap(input_mint: str,output_mint: str, amount: float, wallet_keypair: Keypair):

    client = Client("https://api.mainnet-beta.solana.com")
    # 1. Get quote
    quote = get_jupiter_quote(input_mint, output_mint, amount)
    
    # 2. Get swap instructions
    swap_instructions = get_swap_instructions(quote)

    transaction_bytes = base64.b64decode(swap_instructions['swapTransaction'])
    transaction = VersionedTransaction.from_bytes(transaction_bytes)
    signed = VersionedTransaction(transaction.message, [wallet_keypair])

    serialized = bytes(signed)
    signature = client.send_transaction(VersionedTransaction.from_bytes(serialized))   


    return signature.value



# Example token addresses (USDC and SOL)
INPUT_MINT = "So11111111111111111111111111111111111111112"  
OUTPUT_MINT = "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump"   
AMOUNT = 50000000  # 1 USDC (6 decimals)

execute_jupiter_swap(INPUT_MINT, OUTPUT_MINT, AMOUNT, sender)
