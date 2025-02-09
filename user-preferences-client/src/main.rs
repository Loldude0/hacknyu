use anchor_client::{
    Cluster,
    Client,
    Program,
    solana_sdk::{
        commitment_config::CommitmentConfig,
        instruction::AccountMeta,
        pubkey::Pubkey,
        signature::{read_keypair_file, write_keypair_file, Keypair},
        system_program,
    },
};
use anchor_lang::prelude::*; // For AnchorSerialize, AnchorDeserialize, and the #[account] macro.
use anchor_lang::Discriminator; // Needed to implement Discriminator for IxData.
use anchor_lang::InstructionData;
use anyhow::Result;
use std::{rc::Rc, str::FromStr};

// Define the program ID for the current crate.
// This makes the constant `ID` available for the #[account] macro.
declare_id!("7XDgqx21jrGZSDbm4zvHzvnCti4NmenGdeHTbAJucx7R");

/// Mark the account with #[account]. The macro auto-implements the necessary
/// Borsh (de)serialization and AccountDeserialize.
#[account]
#[derive(Debug)]
pub struct UserPreferences {
    pub user: Pubkey,
    pub max_currency: u64,
    pub max_transactions_per_day: u64,
    pub whitelisted_addresses: Vec<Pubkey>,
    pub whitelisted_currencies: Vec<String>,
    pub bump: u8,
}

/// A newtype wrapper for instruction data.
/// We derive AnchorSerialize/AnchorDeserialize and implement InstructionData.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct IxData(pub Vec<u8>);

impl InstructionData for IxData {
    fn data(&self) -> Vec<u8> {
        self.0.clone()
    }
}

// Instead of a function, we now implement the required constant.
impl Discriminator for IxData {
    const DISCRIMINATOR: [u8; 8] = [0; 8];
}

fn main() -> Result<()> {
    // Load or create our keypair.
    let keypair = match read_keypair_file("test-keypair.json") {
        Ok(kp) => kp,
        Err(_) => {
            println!("Creating new keypair...");
            let new_keypair = Keypair::new();
            write_keypair_file(&new_keypair, "test-keypair.json")
                .map_err(|e| anyhow::Error::msg(e.to_string()))?;
            new_keypair
        }
    };

    // Create a client using our local RPC endpoint.
    let client = Client::new_with_options(
        Cluster::Custom(
            "http://localhost:8899".to_string(),
            "ws://localhost:8900".to_string(),
        ),
        Rc::new(keypair),
        CommitmentConfig::confirmed(),
    );

    // Use the declared program ID (from declare_id!) as our program id.
    let program_id = crate::ID;
    let program = client.program(program_id)?;

    // Bind the payer’s public key to a variable so it lives long enough.
    let payer = program.payer();
    let seeds = [b"user-preferences".as_ref(), payer.as_ref()];
    let (pda, _bump) = Pubkey::find_program_address(&seeds, &program_id);

    println!("PDA: {}", pda);

    // ------------------- Test Case 1: Conservative User -------------------
    println!("\nCreating Conservative User Preferences...");
    match initialize_preferences(&program, &pda) {
        Ok(_) => {
            if let Err(e) = update_preferences(
                &program,
                &pda,
                1000,
                5,
                vec![],
                vec!["USDC".to_string(), "SOL".to_string()],
            ) {
                println!("Error setting conservative preferences: {}", e);
            } else {
                println!("Conservative preferences set successfully!");
            }
        }
        Err(e) => println!("Error initializing preferences: {}", e),
    }

    // ------------------- Test Case 2: Moderate User -------------------
    println!("\nUpdating to Moderate User Preferences...");
    match update_preferences(
        &program,
        &pda,
        5000,
        20,
        vec![],
        vec![
            "USDC".to_string(),
            "SOL".to_string(),
            "ETH".to_string(),
            "BTC".to_string(),
        ],
    ) {
        Ok(_) => println!("Moderate preferences set successfully!"),
        Err(e) => println!("Error setting moderate preferences: {}", e),
    }

    // ------------------- Test Case 3: Aggressive User -------------------
    println!("\nUpdating to Aggressive User Preferences...");
    match update_preferences(
        &program,
        &pda,
        20000,
        50,
        vec![],
        vec![
            "USDC".to_string(),
            "SOL".to_string(),
            "ETH".to_string(),
            "BTC".to_string(),
        ],
    ) {
        Ok(_) => println!("Aggressive preferences set successfully!"),
        Err(e) => println!("Error setting aggressive preferences: {}", e),
    }

    // ------------------- Fetch and display final state -------------------
    match program.account::<UserPreferences>(pda) {
        Ok(account) => {
            println!("\nFinal User Preferences State:");
            println!("Max Currency: {}", account.max_currency);
            println!("Max Transactions Per Day: {}", account.max_transactions_per_day);
            println!("Whitelisted Currencies: {:?}", account.whitelisted_currencies);
        }
        Err(e) => println!("Error fetching final state: {}", e),
    }

    Ok(())
}

/// Sends the `initialize_user_preferences` instruction.
fn initialize_preferences(program: &Program<Rc<Keypair>>, pda: &Pubkey) -> Result<()> {
    program
        .request()
        .accounts(initialize_accounts(program, pda))
        .args(initialize_user_preferences_ix())
        .send()?;
    Ok(())
}

/// Sends the `update_preferences` instruction.
fn update_preferences(
    program: &Program<Rc<Keypair>>,
    pda: &Pubkey,
    max_currency: u64,
    max_transactions_per_day: u64,
    whitelisted_addresses: Vec<Pubkey>,
    whitelisted_currencies: Vec<String>,
) -> Result<()> {
    program
        .request()
        .accounts(update_accounts(program, pda))
        .args(update_preferences_ix(
            max_currency,
            max_transactions_per_day,
            whitelisted_addresses,
            whitelisted_currencies,
        ))
        .send()?;
    Ok(())
}

/// Returns the instruction data for `initialize_user_preferences`.
fn initialize_user_preferences_ix() -> IxData {
    IxData(vec![240, 126, 152, 62, 184, 25, 62, 149])
}

/// Returns the instruction data for `update_preferences`.
fn update_preferences_ix(
    _max_currency: u64,
    _max_transactions_per_day: u64,
    _whitelisted_addresses: Vec<Pubkey>,
    _whitelisted_currencies: Vec<String>,
) -> IxData {
    IxData(vec![16, 64, 128, 133, 19, 206, 101, 159])
}

/// Returns the accounts for `initialize_user_preferences`.
fn initialize_accounts(
    program: &Program<Rc<Keypair>>,
    pda: &Pubkey,
) -> Vec<AccountMeta> {
    vec![
        AccountMeta::new(*pda, false),
        AccountMeta::new(program.payer(), true),
        AccountMeta::new_readonly(system_program::ID, false),
    ]
}

/// Returns the accounts for `update_preferences`.
fn update_accounts(
    program: &Program<Rc<Keypair>>,
    pda: &Pubkey,
) -> Vec<AccountMeta> {
    vec![
        AccountMeta::new(*pda, false),
        AccountMeta::new(program.payer(), true),
    ]
}