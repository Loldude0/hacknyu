import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from transactions import getBalance, execute_jupiter_swap, send_sol
from solders.keypair import Keypair
from solders.pubkey import Pubkey
import json


 
# Example usage:
with open("../../keys.json") as f:
    keys = json.load(f)
# keypair= Keypair.from_base58_string(keys["users"]["John"]["keypair"])
# pubkey= Pubkey.from_string(keys["users"]["John"]["public"])
# print(send_sol(keypair, pubkey, 0.04))
# print(getBalance(pubkey))
# input=keys["coins"]["SOL"]
# output=keys["coins"]["USDC"]
# pubstr=keys["users"]["John"]["public"]
# print(execute_jupiter_swap(input, output, 0.05, keypair, pubstr))

def return_Balance(name="Jacob"):
    try:
        pubkey= Pubkey.from_string(keys["users"][name]["public"])
        out = getBalance(pubkey)
    except Exception as e:
        out = "Error: " + str(e)
    return out

def send_sol_to(reciever_name, amount, sender_name="Jacob"):
    try:
        sender= Keypair.from_base58_string(keys["users"][sender_name]["keypair"])
        reciever= Pubkey.from_string(keys["users"][reciever_name]["public"])
        out=send_sol(sender, reciever, amount)
    except Exception as e:
        out = "Error: " + str(e)
    return out

def swap_coin(input_coin, output_coin, amount, name="Jacob"):
    try:
        input=keys["coins"][input_coin]
        output=keys["coins"][output_coin]
        pubstr=keys["users"][name]["public"]
        keypair= Keypair.from_base58_string(keys["users"][name]["keypair"])
        out=execute_jupiter_swap(input, output, amount, keypair, pubstr)
    except Exception as e:
        out = "Error: " + str(e)
    return out
