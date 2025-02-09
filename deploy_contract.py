import asyncio
import os
from solana.rpc.async_api import AsyncClient
from solana.keypair import Keypair
from anchorpy import Provider, Program
from pathlib import Path
import subprocess

class ContractDeployer:
    def __init__(self, rpc_url: str = "https://api.devnet.solana.com"):
        self.rpc_url = rpc_url
        self.connection = AsyncClient(rpc_url)
        
    async def deploy_contract(self, keypair_path: str):
        """Deploy the smart contract to Solana"""
        try:
            # 1. Build the contract
            print("Building contract...")
            subprocess.run(["anchor", "build"], check=True)
            
            # 2. Get program ID
            program_keypair = Keypair()
            program_id = program_keypair.public_key
            print(f"Program ID: {program_id}")
            
            # 3. Update program ID in lib.rs and Anchor.toml
            self._update_program_id(program_id)
            
            # 4. Build again with new program ID
            subprocess.run(["anchor", "build"], check=True)
            
            # 5. Deploy the contract
            print("Deploying contract...")
            deploy_command = [
                "anchor", "deploy",
                "--provider.cluster", self.rpc_url,
                "--provider.wallet", keypair_path
            ]
            
            result = subprocess.run(deploy_command, capture_output=True, text=True)
            
            if result.returncode == 0:
                print("Contract deployed successfully!")
                return {
                    "status": "success",
                    "program_id": str(program_id),
                    "output": result.stdout
                }
            else:
                raise Exception(f"Deployment failed: {result.stderr}")
                
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }
    
    def _update_program_id(self, program_id: str):
        """Update program ID in source files"""
        # Update lib.rs
        lib_rs_path = Path("programs/voice_safety/src/lib.rs")
        content = lib_rs_path.read_text()
        updated_content = content.replace(
            'declare_id!("your_program_id")',
            f'declare_id!("{program_id}")'
        )
        lib_rs_path.write_text(updated_content)
        
        # Update Anchor.toml
        anchor_toml_path = Path("Anchor.toml")
        content = anchor_toml_path.read_text()
        # Update the program ID in Anchor.toml
        # You'll need to modify this based on your Anchor.toml structure
        # This is a simple example
        updated_content = content.replace(
            "voice_safety = \"your_program_id\"",
            f"voice_safety = \"{program_id}\""
        )
        anchor_toml_path.write_text(updated_content)

async def main():
    deployer = ContractDeployer()
    result = await deployer.deploy_contract("/path/to/your/keypair.json")
    print(result)

if __name__ == "__main__":
    asyncio.run(main())