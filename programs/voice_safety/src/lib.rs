use anchor_lang::prelude::*;

declare_id!("your_program_id"); // Will be generated during deployment

#[program]
pub mod voice_safety {
    use super::*;

    pub fn initialize_safety_settings(
        ctx: Context<InitializeSafety>,
        max_transaction_limit: u64,
        daily_max_transaction: Option<u64>,
        whitelisted_coins: Option<Vec<Pubkey>>,
        whitelisted_addresses: Option<Vec<Pubkey>>,
    ) -> Result<()> {
        let safety_settings = &mut ctx.accounts.safety_settings;
        safety_settings.owner = ctx.accounts.owner.key();
        safety_settings.max_transaction_limit = max_transaction_limit;
        safety_settings.daily_max_transaction = daily_max_transaction;
        safety_settings.whitelisted_coins = whitelisted_coins.unwrap_or_default();
        safety_settings.whitelisted_addresses = whitelisted_addresses.unwrap_or_default();
        Ok(())
    }

    // Add other contract functions here
}

#[derive(Accounts)]
pub struct InitializeSafety<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + 32 + 8 + 8 + 32 * 10 // Adjust space calculation based on your needs
    )]
    pub safety_settings: Account<'info, SafetySettings>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct SafetySettings {
    pub owner: Pubkey,
    pub max_transaction_limit: u64,
    pub daily_max_transaction: Option<u64>,
    pub whitelisted_coins: Vec<Pubkey>,
    pub whitelisted_addresses: Vec<Pubkey>,
}