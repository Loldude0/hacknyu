use anchor_client::{
    solana_sdk::{
        commitment_config::CommitmentConfig,
        pubkey::Pubkey,
        signature::{Keypair, read_keypair_file, write_keypair_file},
        system_program,
    },
    Client, Program,
};
use std::{rc::Rc, str::FromStr};
use anyhow::Result;

// Your program's account struct
#[derive(Debug)]
pub struct UserPreferences {
    pub user: Pubkey,
    pub max_currency: u64,
    pub max_transactions_per_day: u64,
    pub whitelisted_addresses: Vec<Pubkey>,
    pub whitelisted_currencies: Vec<String>,
    pub bump: u8,
}

fn main() -> Result<()> {
    // Setup client
    let keypair = match read_keypair_file("test-keypair.json") {
        Ok(kp) => kp,
        Err(_) => {
            let new_keypair = Keypair::new();
            write_keypair_file(&new_keypair, "test-keypair.json")?;
            new_keypair
        }
    };

    // Initialize client
    let client = Client::new_with_options(
        "http://localhost:8899".to_string(),
        Rc::new(keypair),
        CommitmentConfig::confirmed(),
    );

    // Your program ID
    let program_id = Pubkey::from_str("7XDgqx21jrGZSDbm4zvHzvnCti4NmenGdeHTbAJucx7R")?;
    let program = client.program(program_id);

    // Find PDA
    let seeds = [
        b"user-preferences",
        program.payer().pubkey().as_ref(),
    ];
    let (pda, bump) = Pubkey::find_program_address(&seeds, &program_id);

    // Test Case 1: Conservative User
    println!("\nCreating Conservative User Preferences...");
    match initialize_preferences(&program, &pda) {
        Ok(_) => {
            match update_preferences(
                &program,
                &pda,
                1000,
                5,
                vec![],
                vec!["USDC".to_string(), "SOL".to_string()],
            ) {
                Ok(_) => println!("Conservative preferences set successfully!"),
                Err(e) => println!("Error setting conservative preferences: {}", e),
            }
        }
        Err(e) => println!("Error initializing preferences: {}", e),
    }

    // Test Case 2: Moderate User
    println!("\nUpdating to Moderate User Preferences...");
    match update_preferences(
        &program,
        &pda,
        5000,
        20,
        vec![],
        vec!["USDC".to_string(), "SOL".to_string(), "ETH".to_string(), "BTC".to_string()],
    ) {
        Ok(_) => println!("Moderate preferences set successfully!"),
        Err(e) => println!("Error setting moderate preferences: {}", e),
    }

    // Test Case 3: Aggressive User
    println!("\nUpdating to Aggressive User Preferences...");
    match update_preferences(
        &program,
        &pda,
        20000,
        50,
        vec![],
        vec!["USDC".to_string(), "SOL".to_string(), "ETH".to_string(), "BTC".to_string()],
    ) {
        Ok(_) => println!("Aggressive preferences set successfully!"),
        Err(e) => println!("Error setting aggressive preferences: {}", e),
    }

    // Fetch and display final state
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

fn initialize_preferences(program: &Program, pda: &Pubkey) -> Result<()> {
    program
        .request()
        .accounts(initialize_accounts(program, pda))
        .args(initialize_user_preferences_ix())
        .send()?;
    Ok(())
}

fn update_preferences(
    program: &Program,
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

// Helper functions to create instruction data
fn initialize_user_preferences_ix() -> anchor_client::anchor_lang::InstructionData {
    anchor_client::anchor_lang::InstructionData {
        program_id: anchor_client::anchor_lang::Id::new(0),
        data: vec![240, 126, 152, 62, 184, 25, 62, 149], // Your initialize discriminator
    }
}

fn update_preferences_ix(
    max_currency: u64,
    max_transactions_per_day: u64,
    whitelisted_addresses: Vec<Pubkey>,
    whitelisted_currencies: Vec<String>,
) -> anchor_client::anchor_lang::InstructionData {
    // Your update preferences instruction data
    anchor_client::anchor_lang::InstructionData {
        program_id: anchor_client::anchor_lang::Id::new(0),
        data: vec![16, 64, 128, 133, 19, 206, 101, 159], // Your update discriminator
    }
}

// Helper functions to create account metas
fn initialize_accounts<'a>(
    program: &Program,
    pda: &'a Pubkey,
) -> anchor_client::anchor_lang::ToAccountMetas {
    vec![
        AccountMeta::new(*pda, false),
        AccountMeta::new(program.payer().pubkey(), true),
        AccountMeta::new_readonly(system_program::ID, false),
    ]
}

fn update_accounts<'a>(
    program: &Program,
    pda: &'a Pubkey,
) -> anchor_client::anchor_lang::ToAccountMetas {
    vec![
        AccountMeta::new(*pda, false),
        AccountMeta::new(program.payer().pubkey(), true),
    ]
}