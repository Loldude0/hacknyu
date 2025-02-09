use anchor_lang::prelude::*;

declare_id!("7XDgqx21jrGZSDbm4zvHzvnCti4NmenGdeHTbAJucx7R");

#[program]
pub mod user_preferences {
    use super::*;

    pub fn initialize_user_preferences(ctx: Context<InitializeUserPreferences>) -> Result<()> {
        let user_preferences = &mut ctx.accounts.user_preferences;
        // Access the bump directly via the generated field
        user_preferences.bump = ctx.bumps.user_preferences;
        user_preferences.user = ctx.accounts.user.key();
        Ok(())
    }
    
    pub fn update_preferences(
        ctx: Context<UpdatePreferences>,
        max_currency: u64,
        max_transactions_per_day: u64,
        whitelisted_addresses: Vec<Pubkey>,
        whitelisted_currencies: Vec<String>,
    ) -> Result<()> {
        let user_preferences = &mut ctx.accounts.user_preferences;
        user_preferences.max_currency = max_currency;
        user_preferences.max_transactions_per_day = max_transactions_per_day;
        user_preferences.whitelisted_addresses = whitelisted_addresses;
        user_preferences.whitelisted_currencies = whitelisted_currencies;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeUserPreferences<'info> {
    #[account(
        init,
        payer = user,
        // Use a manually computed space (see note below) instead of relying on
        // field attributes for variable-length data.
        space = 8 + UserPreferences::INIT_SPACE,
        seeds = [b"user-preferences", user.key().as_ref()],
        bump
    )]
    pub user_preferences: Account<'info, UserPreferences>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdatePreferences<'info> {
    #[account(
        mut,
        seeds = [b"user-preferences", user.key().as_ref()],
        bump = user_preferences.bump,
        has_one = user // Ensure the signer is the owner
    )]
    pub user_preferences: Account<'info, UserPreferences>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[account]
#[derive(InitSpace)] // This derive will compute space based on annotated attributes for fixed-size types.
pub struct UserPreferences {
    pub user: Pubkey,
    pub max_currency: u64,
    pub max_transactions_per_day: u64,
    // For a vector of Pubkey, we limit the number of elements to 10.
    #[max_len(10)] 
    pub whitelisted_addresses: Vec<Pubkey>,
    // For a vector of strings, Anchor can limit the number of elements but not the per-element size.
    // Remove the unsupported #[space(10 * 10)] attribute.
    #[max_len(4, 50)]
    pub whitelisted_currencies: Vec<String>,
    pub bump: u8,  // Stores the bump seed for PDA validation
}

// Optional: Compute total space manually for UserPreferences if needed.
// Note that a String is stored as 4 bytes for its length plus the actual bytes.
// For example, if each currency string should be at most 10 bytes in length, then
// each string requires (4 + 10) bytes. For 5 strings, that would be 4 (vector length)
// + 5 * (4 + 10) = 4 + 70 = 74 bytes.
//
// Also, add the following space for fixed fields:
// - Pubkey: 32 bytes
// - u64: 8 bytes each (2 fields → 16 bytes)
// - whitelisted_addresses: 4 bytes (vector length) + 10 * 32 bytes = 4 + 320 = 324 bytes
// - bump: 1 byte
//
// Total INIT_SPACE = 32 + 16 + 324 + 74 + 1 = 447 bytes.
// The account initialization uses 8 extra bytes for the discriminator, hence:
// space = 8 + INIT_SPACE.
impl UserPreferences {
    pub const INIT_SPACE: usize = 32 + 8 + 8 + (4 + 10 * 32) + (4 + 4 * (4 + 50)) + 1;
}