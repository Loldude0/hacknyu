from solana.rpc.async_api import AsyncClient
from solana.rpc.commitment import Commitment
from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solders.system_program import ID as SYS_PROGRAM_ID
from anchorpy import Provider, Wallet, Program
import json
import asyncio

# Load the IDL
async def load_idl():
    with open("programs/userpreferences/target/idl/user_preferences.json", "r") as f:
        raw_idl = json.load(f)
        
        class Argument:
            def __init__(self, arg_dict):
                self.name = arg_dict.get('name')
                rust_type = arg_dict.get('type')
                if isinstance(rust_type, dict) and 'vec' in rust_type:
                    # Handle vector types (for whitelisted_addresses and whitelisted_currencies)
                    if rust_type['vec'] == 'pubkey':
                        self.ty = {'vec': 'publicKey'}
                    elif rust_type['vec'] == 'string':
                        self.ty = {'vec': 'string'}
                elif rust_type == 'u64':
                    self.ty = 'u64'
                else:
                    self.ty = rust_type

        class Account:
            def __init__(self, acc_dict):
                self.name = acc_dict.get('name')
                self.isMut = acc_dict.get('writable', False)
                self.isSigner = acc_dict.get('signer', False)
                if 'pda' in acc_dict:
                    self.pda = acc_dict['pda']

        class Instruction:
            def __init__(self, ix_dict):
                self.name = ix_dict.get('name')
                self.accounts = [Account(acc) for acc in ix_dict.get('accounts', [])]
                self.args = [Argument(arg) for arg in ix_dict.get('args', [])]
                self.discriminator = ix_dict.get('discriminator')

        class IDL:
            def __init__(self, raw):
                self.version = raw.get('metadata', {}).get('version')
                self.name = raw.get('metadata', {}).get('name')
                self.instructions = [Instruction(ix) for ix in raw.get('instructions', [])]
                self.accounts = raw.get('accounts', [])
                self.types = raw.get('types', [])
                self.metadata = raw.get('metadata', {})
                self.address = raw.get('address')

        return IDL(raw_idl)

async def main():
    # Initialize the client
    client = AsyncClient("http://localhost:8899", commitment=Commitment("confirmed"))
    
    # Load or create a keypair for testing
    keypair_path = "test-keypair.json"
    try:
        with open(keypair_path, "r") as f:
            content = f.read()
            if not content.strip():
                raise FileNotFoundError
            keypair_bytes = bytes(json.loads(content))
            keypair = Keypair.from_bytes(keypair_bytes)
    except (FileNotFoundError, json.JSONDecodeError):
        print("Creating new keypair...")
        keypair = Keypair()
        with open(keypair_path, "w") as f:
            json.dump(list(bytes(keypair)), f)

    # Create provider
    provider = Provider(client, Wallet(keypair))
    
    # Load the IDL and initialize the program
    idl = await load_idl()
    program_id = Pubkey.from_string("7XDgqx21jrGZSDbm4zvHzvnCti4NmenGdeHTbAJucx7R")
    program = Program(idl, program_id, provider)

    # Get the PDA for user preferences (using the user's public key)
    user_preferences_pda, bump = Pubkey.find_program_address(
        [b"user-preferences", bytes(keypair.pubkey)],
        program_id
    )

    print("\nCreating and updating User Preferences using a single account...")
    try:
        # Initialize the user preferences account
        await program.methods.initializeUserPreferences() \
            .accounts({
                "user_preferences": user_preferences_pda,
                "user": keypair.pubkey,
                "system_program": SYS_PROGRAM_ID,
            }) \
            .signers([keypair]) \
            .rpc()

        # Update the preferences with conservative values
        await program.methods.updatePreferences(
            1000,               # max_currency: 1000 units
            5,                  # max_transactions_per_day: 5
            [],                 # whitelisted_addresses: empty list
            ["USDC", "SOL"]     # whitelisted_currencies
        ).accounts({
            "user_preferences": user_preferences_pda,
            "user": keypair.pubkey,
        }).signers([keypair]).rpc()
        print("User preferences set successfully with one account!")
    except Exception as e:
        print(f"Error setting user preferences: {str(e)}")

    # Fetch and display the final state for the account
    try:
        account = await program.account["UserPreferences"].fetch(user_preferences_pda)
        print("\nFinal User Preferences State:")
        print(f"Max Currency: {account.max_currency}")
        print(f"Max Transactions Per Day: {account.max_transactions_per_day}")
        print(f"Whitelisted Currencies: {account.whitelisted_currencies}")
    except Exception as e:
        print(f"Error fetching final state: {str(e)}")

    await client.close()

if __name__ == "__main__":
    asyncio.run(main())