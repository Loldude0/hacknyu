# How to fuzz test for Solana programs _ Solana.pdf

### Page 1

Solana Documentation The Solana Toolkit Test Suite Solana Fuzz Tester “This is a beta version of the Solana Toolkit, and is still a WIP. Please post all feedback as a GitHub issue here.” “The Trident fuzz tester is still a WIP and currently only Anchor compatible may require some manual work to complete tests.” Initialize Fuzz Tests Navigate to an Anchor based workspace and run: This command does the following: Builds the Anchor-based project. Reads the generated IDL. Based on the IDL creates the fuzzing template. trident init Documentation API Cookbook Courses Guides Get Support Table of Contents Initialize Fuzz Tests 2/8/25, 6:02 PM How to fuzz test for Solana programs | Solana https://solana.com/docs/toolkit/test-suite/fuzz-tester 1/4


---

### Page 2

Define Fuzz Accounts Deﬁne AccountsStorage type for each Account you would like to use: Implement Fuzz Instructions Each Instruction in the fuzz test has to have deﬁned the following functions: get_program_id() speciﬁes which program the instruction belongs to. This function is automatically deﬁned and should not need any updates. Its important to use especially if you have multiple programs in your workspace, allowing Trident to generate instruction sequences corresponding to different programs. get_data() speciﬁes what instruction inputs are sent to the program instructions. get_accounts() speciﬁes what accounts are sent to the program instructions. Execute Fuzz Tests #[doc = r" Use AccountsStorage<T> where T can be one of:"] #[doc = r" Keypair, PdaStore, TokenStore, MintStore, ProgramStore"] #[derive(Default)] pub struct FuzzAccounts { author: AccountsStorage<Keypair>, hello_world_account: AccountsStorage<PdaStore>, // No need to fuzz system_program // system_program: AccountsStorage<todo!()>, } # Replace <TARGET_NAME> with the name of the # fuzz test (for example: "fuzz_0") trident fuzz run-hfuzz <TARGET_NAME> 2/8/25, 6:02 PM How to fuzz test for Solana programs | Solana https://solana.com/docs/toolkit/test-suite/fuzz-tester 2/4


---

### Page 3

Debug Fuzz Tests For additional documentation go here. Additional Resources Fuzz Tester Source Code. Last updated on 2/4/2025 Loading comments… Previous Code Coverage Next Security Scanner Managed by # fuzzer will run the <TARGET_NAME> with the specified <CRASH_FILE_PATH> trident fuzz debug-hfuzz <TARGET_NAME> <CRASH_FILE_PATH> 2/8/25, 6:02 PM How to fuzz test for Solana programs | Solana https://solana.com/docs/toolkit/test-suite/fuzz-tester 3/4


---

### Page 4

SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 6:02 PM How to fuzz test for Solana programs | Solana https://solana.com/docs/toolkit/test-suite/fuzz-tester 4/4


---

# Versioned Transactions _ Solana.pdf

### Page 1

Solana Documentation Advanced Topics Versioned Transactions Versioned Transactions are the new transaction format that allow for additional functionality in the Solana runtime, including Address Lookup Tables. While changes to onchain programs are NOT required to support the new functionality of versioned transactions (or for backwards compatibility), developers WILL need update their client side code to prevent errors due to different transaction versions. Current Transaction Versions The Solana runtime supports two transaction versions: legacy - older transaction format with no additional beneﬁt 0 - added support for Address Lookup Tables Max supported transaction version All RPC requests that return a transaction should specify the highest version of transactions they will support in their application using the maxSupportedTransactionVersion option, including getBlock and getTransaction. Documentation API Cookbook Courses Guides Get Support Table of Contents Current Transaction Versions 2/8/25, 5:43 PM Versioned Transactions | Solana https://solana.com/docs/advanced/versions 1/6


---

### Page 2

An RPC request will fail if a Versioned Transaction is returned that is higher than the set maxSupportedTransactionVersion. (i.e. if a version 0 transaction is returned when legacy is selected) “WARNING: If no maxSupportedTransactionVersion value is set, then only legacy transactions will be allowed in the RPC response. Therefore, your RPC requests WILL fail if any version 0 transactions are returned.” How to set max supported version You can set the maxSupportedTransactionVersion using both the @solana/web3.js library and JSON formatted requests directly to an RPC endpoint. Using web3.js Using the @solana/web3.js library, you can retrieve the most recent block or get a speciﬁc transaction: JSON requests to the RPC // connect to the `devnet` cluster and get the current `slot` const connection = new web3.Connection(web3.clusterApiUrl("devnet")); const slot = await connection.getSlot(); // get the latest block (allowing for v0 transactions) const block = await connection.getBlock(slot, { maxSupportedTransactionVersion: 0, }); // get a specific transaction (allowing for v0 transactions) const getTx = await connection.getTransaction( "3jpoANiFeVGisWRY5UP648xRXs3iQasCHABPWRWnoEjeA93nc79WrnGgpgazjq4K9m8g2NJoyKo { maxSupportedTransactionVersion: 0, }, ); 2/8/25, 5:43 PM Versioned Transactions | Solana https://solana.com/docs/advanced/versions 2/6


---

### Page 3

Using a standard JSON formatted POST request, you can set the maxSupportedTransactionVersion when retrieving a speciﬁc block: How to create a Versioned Transaction Versioned transactions can be created similar to the older method of creating transactions. There are differences in using certain libraries that should be noted. Below is an example of how to create a Versioned Transaction, using the @solana/web3.js library, to send perform a SOL transfer between two accounts. Notes: payer is a valid Keypair wallet, funded with SOL toAccount a valid Keypair Firstly, import the web3.js library and create a connection to your desired cluster. We then deﬁne the recent blockhash and minRent we will need for our transaction and the account: curl https://api.devnet.solana.com -X POST -H "Content-Type: application/json" '{"jsonrpc": "2.0", "id":1, "method": "getBlock", "params": [430, { "encoding":"json", "maxSupportedTransactionVersion":0, "transactionDetails":"full", "rewards":false }]}' const web3 = require("@solana/web3.js"); // connect to the cluster and get the minimum rent for rent exempt status const connection = new web3.Connection(web3.clusterApiUrl("devnet")); let minRent = await connection.getMinimumBalanceForRentExemption(0); let blockhash = await connection .getLatestBlockhash() 2/8/25, 5:43 PM Versioned Transactions | Solana https://solana.com/docs/advanced/versions 3/6


---

### Page 4

Create an array of all the instructions you desire to send in your transaction. In this example below, we are creating a simple SOL transfer instruction: Next, construct a MessageV0 formatted transaction message with your desired instructions: Then, create a new VersionedTransaction, passing in our v0 compatible message: You can sign the transaction by either: passing an array of signatures into the VersionedTransaction method, or call the transaction.sign() method, passing an array of the required Signers .then(res => res.blockhash); // create an array with your desired `instructions` const instructions = [ web3.SystemProgram.transfer({ fromPubkey: payer.publicKey, toPubkey: toAccount.publicKey, lamports: minRent, }), ]; // create v0 compatible message const messageV0 = new web3.TransactionMessage({ payerKey: payer.publicKey, recentBlockhash: blockhash, instructions, }).compileToV0Message(); const transaction = new web3.VersionedTransaction(messageV0); // sign your transaction with the required `Signers` transaction.sign([payer]); 2/8/25, 5:43 PM Versioned Transactions | Solana https://solana.com/docs/advanced/versions 4/6


---

### Page 5

“NOTE: After calling the transaction.sign() method, all the previous transaction signatures will be fully replaced by new signatures created from the provided in Signers.” After your VersionedTransaction has been signed by all required accounts, you can send it to the cluster and await the response: “NOTE: Unlike legacy transactions, sending a VersionedTransaction via sendTransaction does NOT support transaction signing via passing in an array of Signers as the second parameter. You will need to sign the transaction before calling connection.sendTransaction().” More Resources using Versioned Transactions for Address Lookup Tables view an example of a v0 transaction on Solana Explorer read the accepted proposal for Versioned Transaction and Address Lookup Tables Last updated on 2/4/2025 Loading comments… // send our v0 transaction to the cluster const txId = await connection.sendTransaction(transaction); console.log(`https://explorer.solana.com/tx/${txId}?cluster=devnet`); 2/8/25, 5:43 PM Versioned Transactions | Solana https://solana.com/docs/advanced/versions 5/6


---

### Page 6

Previous Retrying Transactions Next Address Lookup Tables Managed by SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 5:43 PM Versioned Transactions | Solana https://solana.com/docs/advanced/versions 6/6


---

# How to test Solana Programs with JavaScript_TypeScript _ Solana.pdf

### Page 1

Solana Documentation The Solana Toolkit Test Suite JavaScript Testing Framework for Solana “This is a beta version of the Solana Toolkit, and is still a WIP. Please post all feedback as a GitHub issue here.” Add Dependency Navigate to your program directory and run: Bankrun Overview Bankrun is a fast and lightweight framework for testing Solana programs in NodeJS. It uses the solana-program-test crate under the hood and allows you to do things that are not possible with solana-test-validator, such as jumping back and forth in time or dynamically setting account data. npm install solana-bankrun Documentation API Cookbook Courses Guides Get Support Table of Contents Add Dependency 2/8/25, 6:02 PM How to test Solana Programs with JavaScript/TypeScript | Solana https://solana.com/docs/toolkit/test-suite/js-test 1/4


---

### Page 2

Bankrun works by spinning up a lightweight BanksServer that's like an RPC node but much faster, and creating a BanksClient to talk to the server. This runs the Solana Banks. Minimal Example Additional Resources Bankrun Docs Bankrun Source Code Official Bankrun Tutorials import { start } from "solana-bankrun"; import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js"; test("one transfer", async () => { const context = await start([], []); const client = context.banksClient; const payer = context.payer; const receiver = PublicKey.unique(); const blockhash = context.lastBlockhash; const transferLamports = 1_000_000n; const ixs = [ SystemProgram.transfer({ fromPubkey: payer.publicKey, toPubkey: receiver, lamports: transferLamports, }), ]; const tx = new Transaction(); tx.recentBlockhash = blockhash; tx.add(...ixs); tx.sign(payer); await client.processTransaction(tx); const balanceAfter = await client.getBalance(receiver); expect(balanceAfter).toEqual(transferLamports); }); 2/8/25, 6:02 PM How to test Solana Programs with JavaScript/TypeScript | Solana https://solana.com/docs/toolkit/test-suite/js-test 2/4


---

### Page 3

Complete Project Example Last updated on 2/4/2025 Loading comments… Previous Security Scanner Next Rust Tests Managed by SOLANA Grants Break Solana Media Kit Careers Disclaimer GET CONNECTED Blog Newsletter 2/8/25, 6:02 PM How to test Solana Programs with JavaScript/TypeScript | Solana https://solana.com/docs/toolkit/test-suite/js-test 3/4


---

### Page 4

Privacy Policy EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 6:02 PM How to test Solana Programs with JavaScript/TypeScript | Solana https://solana.com/docs/toolkit/test-suite/js-test 4/4


---

# How to create a Solana web app _ Solana.pdf

### Page 1

Solana Documentation The Solana Toolkit Creating a Project Web App with a Program Connection “This is a beta version of the Solana Toolkit, and is still a WIP. Please post all feedback as a GitHub issue here.” This command generates a new project that connects a Solana program to a frontend with a wallet connector. It has options for multiple popular frontend stacks and UI libraries, including: NextJS, React, Tailwind, and more. Build and Test To test out this project before making any modiﬁcations, follow these steps: npx create-solana-dapp Build the smart contract1 npm run anchor-build Documentation API Cookbook Courses Guides Get Support Table of Contents Build and Test 2/8/25, 6:01 PM How to create a Solana web app | Solana https://solana.com/docs/toolkit/projects/web-app 1/4


---

### Page 2

Additional Resources create-solana-dapp README CRUD App Example Anchor book Start the local validator Run tests Deploy to the local validator Build the web app Run the web app 2 npm run anchor-localnet 3 npm run anchor-test 4 npm run anchor deploy --provider.cluster localnet 5 npm run build 6 npm run dev 2/8/25, 6:01 PM How to create a Solana web app | Solana https://solana.com/docs/toolkit/projects/web-app 2/4


---

### Page 3

Getting Started with Anchor Program Examples Last updated on 2/5/2025 Loading comments… Previous Solana Programs Next Mobile App Managed by SOLANA Grants Break Solana Media Kit GET CONNECTED Blog Newsletter 2/8/25, 6:01 PM How to create a Solana web app | Solana https://solana.com/docs/toolkit/projects/web-app 3/4


---

### Page 4

Careers Disclaimer Privacy Policy EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 6:01 PM How to create a Solana web app | Solana https://solana.com/docs/toolkit/projects/web-app 4/4


---

# Clusters and Public RPC Endpoints _ Solana.pdf

### Page 1

Solana Documentation Core Concepts Clusters and Public RPC Endpoints The Solana blockchain has several different groups of validators, known as Clusters. Each serving different purposes within the overall ecosystem and containing dedicated API nodes to fulﬁll JSON-RPC requests for their respective Cluster. The individual nodes within a Cluster are owned and operated by third parties, with a public endpoint available for each. Solana public RPC endpoints The Solana Labs organization operates a public RPC endpoint for each Cluster. Each of these public endpoints are subject to rate limits, but are available for users and developers to interact with the Solana blockchain. “Public endpoint rate limits are subject to change. The speciﬁc rate limits listed on this document are not guaranteed to be the most up-to-date.” Using explorers with different Clusters Many of the popular Solana blockchain explorers support selecting any of the Clusters, often allowing advanced users to add a custom/private RPC endpoint as well. Documentation API Cookbook Courses Guides Get Support Table of Contents Solana public RPC endpoints 2/8/25, 5:42 PM Clusters and Public RPC Endpoints | Solana https://solana.com/docs/core/clusters 1/7


---

### Page 2

An example of some of these Solana blockchain explorers include: http://explorer.solana.com/. http://solana.fm/. http://solscan.io/. http://solanabeach.io/. http://validators.app/. On a high level Mainnet: Live production environment for deployed applications. Devnet: Testing with public accessibility for developers experimenting with their applications. Testnet: Stress-testing for network upgrades and validator performance. Example use cases: You may want to debug a new program on Devnet or verify performance metrics on Testnet before Mainnet deployment. Cluster Endpoint Purpose Notes Mainnet https://api.mainnet- beta.solana.com Live production environment Requires SOL for transactions Devnet https://api.devnet.solana.comPublic testing and development Free SOL airdrop for testing Testnet https://api.testnet.solana.comValidator and stress testing May have intermittent downtime 2/8/25, 5:42 PM Clusters and Public RPC Endpoints | Solana https://solana.com/docs/core/clusters 2/7


---

### Page 3

Devnet Devnet serves as a playground for anyone who wants to take Solana for a test drive, as a user, token holder, app developer, or validator. Application developers should target Devnet. Potential validators should ﬁrst target Devnet. Key differences between Devnet and Mainnet Beta: Devnet tokens are not real Devnet includes a token faucet for airdrops for application testing Devnet may be subject to ledger resets Devnet typically runs the same software release branch version as Mainnet Beta, but may run a newer minor release version than Mainnet Beta. Gossip entrypoint for Devnet: entrypoint.devnet.solana.com:8001 Devnet endpoint https://api.devnet.solana.com - single Solana Labs hosted API node; rate-limited Example solana command-line configuration To connect to the devnet Cluster using the Solana CLI: Devnet rate limits Maximum number of requests per 10 seconds per IP: 100 Maximum number of requests per 10 seconds per IP for a single RPC: 40 Maximum concurrent connections per IP: 40 solana config set --url https://api.devnet.solana.com 2/8/25, 5:42 PM Clusters and Public RPC Endpoints | Solana https://solana.com/docs/core/clusters 3/7


---

### Page 4

Maximum connection rate per 10 seconds per IP: 40 Maximum amount of data per 30 second: 100 MB Testnet Testnet is where the Solana core contributors stress test recent release features on a live cluster, particularly focused on network performance, stability and validator behavior. Testnet tokens are not real Testnet may be subject to ledger resets. Testnet includes a token faucet for airdrops for application testing Testnet typically runs a newer software release branch than both Devnet and Mainnet Beta Gossip entrypoint for Testnet: entrypoint.testnet.solana.com:8001 Testnet endpoint https://api.testnet.solana.com - single Solana Labs API node; rate-limited Example solana command-line configuration To connect to the testnet Cluster using the Solana CLI: Testnet rate limits Maximum number of requests per 10 seconds per IP: 100 Maximum number of requests per 10 seconds per IP for a single RPC: 40 solana config set --url https://api.testnet.solana.com 2/8/25, 5:42 PM Clusters and Public RPC Endpoints | Solana https://solana.com/docs/core/clusters 4/7


---

### Page 5

Maximum concurrent connections per IP: 40 Maximum connection rate per 10 seconds per IP: 40 Maximum amount of data per 30 second: 100 MB Mainnet beta A permissionless, persistent cluster for Solana users, builders, validators and token holders. Tokens that are issued on Mainnet Beta are real SOL Gossip entrypoint for Mainnet Beta: entrypoint.mainnet-beta.solana.com:8001 Mainnet beta endpoint https://api.mainnet-beta.solana.com - Solana Labs hosted API node cluster, backed by a load balancer; rate-limited Example solana command-line configuration To connect to the mainnet-beta Cluster using the Solana CLI: Mainnet beta rate limits Maximum number of requests per 10 seconds per IP: 100 Maximum number of requests per 10 seconds per IP for a single RPC: 40 Maximum concurrent connections per IP: 40 Maximum connection rate per 10 seconds per IP: 40 Maximum amount of data per 30 seconds: 100 MB solana config set --url https://api.mainnet-beta.solana.com 2/8/25, 5:42 PM Clusters and Public RPC Endpoints | Solana https://solana.com/docs/core/clusters 5/7


---

### Page 6

“The public RPC endpoints are not intended for production applications. Please use dedicated/private RPC servers when you launch your application, drop NFTs, etc. The public services are subject to abuse and rate limits may change without prior notice. Likewise, high-traffic websites may be blocked without prior notice.” Common HTTP Error Codes 403 -- Your IP address or website has been blocked. It is time to run your own RPC server(s) or ﬁnd a private service. 429 -- Your IP address is exceeding the rate limits. Slow down! Use the Retry-After HTTP response header to determine how long to wait before making another request. Last updated on 2/4/2025 Loading comments… Previous Tokens on Solana Next The Solana Toolkit 2/8/25, 5:42 PM Clusters and Public RPC Endpoints | Solana https://solana.com/docs/core/clusters 6/7


---

### Page 7

Managed by SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 5:42 PM Clusters and Public RPC Endpoints | Solana https://solana.com/docs/core/clusters 7/7


---

# How to add Solana into an existing app or project _ Solana.pdf

### Page 1

Solana Documentation The Solana Toolkit Creating a Project Update an Existing Project “This is a beta version of the Solana Toolkit, and is still a WIP. Please post all feedback as a GitHub issue here.” If you have an existing Anchor program and want to use the create-solana-program tool, you can easily replace the generated program with your existing one: Verify correct versions Ensure the installed Solana and Anchor versions are the same as the ones your existing program requires. Run create-solana-program Scaffold a new Solana program using Anchor by running: Migrate your program source code 1 2 npx create-solana-program --anchor 3 Documentation API Cookbook Courses Guides Get Support Table of Contents Verify correct versions 2/8/25, 6:01 PM How to add Solana into an existing app or project | Solana https://solana.com/docs/toolkit/projects/existing-project 1/4


---

### Page 2

Replace the program folder with your existing program directory (not the workspace directory). If you have more than one program, add more folders to the root directory and update the members attribute of the top-level Cargo.toml accordingly. Update each program's Cargo.toml Ensure your program’s Cargo.toml contains the following metadata: Build your program and clients Run the following commands to build your programs and generate the clients: Update the ID alias If you have a generated Rust client, update the clients/rust/src/lib.rs ﬁle so the ID alias points to the correct generated constant. Update any client tests If you have any generated clients, update the scaffolded tests so they work with your existing program. 4 Cargo.toml [package.metadata.solana] program-id = "YOUR_PROGRAM_ADDRESS" program-dependencies = [] 5 npm install npm run programs:build npm run generate 6 7 2/8/25, 6:01 PM How to add Solana into an existing app or project | Solana https://solana.com/docs/toolkit/projects/existing-project 2/4


---

### Page 3

Last updated on 2/4/2025 An error occurred: giscus is not installed on this repository Previous Mobile App Next Project layout Managed by SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN 2/8/25, 6:01 PM How to add Solana into an existing app or project | Solana https://solana.com/docs/toolkit/projects/existing-project 3/4


---

### Page 4

© 2025 Solana Foundation. All rights reserved. 2/8/25, 6:01 PM How to add Solana into an existing app or project | Solana https://solana.com/docs/toolkit/projects/existing-project 4/4


---

# How to run the Solana local validator for testing _ Solana.pdf

### Page 1

Solana Documentation The Solana Toolkit Running a Local Solana Validator Network “This is a beta version of the Solana Toolkit, and is still a WIP. Please post all feedback as a GitHub issue here.” The Solana test validator is a local emulator for the Solana blockchain, designed to provide developers with a private and controlled environment for building and testing Solana programs without the need to connect to a public testnet or mainnet. It also includes full support of the standard Solana RPC standard. If you have the Solana CLI tool suite already installed, you can run the test validator with the following command: “Install the Solana Toolkit by running the following command:” Advantages mucho validator --help npx -y mucho@latest install Documentation API Cookbook Courses Guides Get Support Table of Contents Advantages 2/8/25, 6:01 PM How to run the Solana local validator for testing | Solana https://solana.com/docs/toolkit/local-validator 1/10


---

### Page 2

Ability to reset the blockchain state at any moment Ability to simulate different network conditions No RPC rate-limits No airdrop limits Direct onchain program deployment Ability to clone accounts and programs from a public cluster (i.e. devnet, mainnet, etc) Ability to load accounts and programs from ﬁles Conﬁgurable transaction history retention Conﬁgurable epoch length Starting the Test Validator To start your local validator, simply run: This command initializes a new ledger and starts the local validator running at http://localhost:8899, which can be used as your Solana RPC connection url. Connecting to the Test Validator To connect to the local test validator with the Solana CLI: mucho validator solana config set --url localhost 2/8/25, 6:01 PM How to run the Solana local validator for testing | Solana https://solana.com/docs/toolkit/local-validator 2/10


---

### Page 3

This will ensure all your Solana CLI commands will be directed to your local test validator. Checking the Status of the Test Validator Before interacting with the test validator, it's useful to conﬁrm its status and ensure it is running correctly. This command pings the local test validator and returns the current blockhash and latency, verifying that it is active. Deploying and Managing Programs Locally To deploy a compiled program (BPF) to the test validator: This uploads and deploys a program to the blockchain. To check the details of a deployed program: Sending Transactions To transfer SOL from one account to another: solana ping solana program deploy <PROGRAM_FILE_PATH> solana program show <ACCOUNT_ADDRESS> 2/8/25, 6:01 PM How to run the Solana local validator for testing | Solana https://solana.com/docs/toolkit/local-validator 3/10


---

### Page 4

This sends AMOUNT of SOL from the source account to the RECIPIENT_ADDRESS. Simulating and Confirming Transactions Before actually sending a transaction, you can simulate it to see if it would likely succeed: To conﬁrm the details and status of a transaction: Viewing Recent Block Production To see information about recent block production, which can be useful for debugging performance issues: Validator Logs For debugging, you might want more detailed logs: solana transfer --from /path/to/keypair.json <RECIPIENT_ADDRESS> <AMOUNT> solana transfer --from /path/to/keypair.json \ --simulate <RECIPIENT_ADDRESS> <AMOUNT> solana confirm <TRANSACTION_SIGNATURE> solana block-production 2/8/25, 6:01 PM How to run the Solana local validator for testing | Solana https://solana.com/docs/toolkit/local-validator 4/10


---

### Page 5

This streams log messages from the validator. Tips for Logging Increase log verbosity with the -v ﬂag if you need more detailed output for debugging. Use the --rpc-port and --rpc-bind-address options to customize the RPC server settings. Adjust the number of CPU cores used by the validator with the --gossip-host option to simulate network conditions more realistically. Configuration View all the conﬁguration options available for the Solana test validator: Local Ledger By default, the ledger data is stored in a directory named test-ledger in your current working directory. Specifying Ledger Location When starting the test validator, you can specify a different directory for the ledger data using the --ledger option: solana logs mucho validator --help 2/8/25, 6:01 PM How to run the Solana local validator for testing | Solana https://solana.com/docs/toolkit/local-validator 5/10


---

### Page 6

Resetting the Ledger By default the validator will resume an existing ledger, if one is found. To reset the ledger, you can either manually delete the ledger directory or restart the validator with the --reset ﬂag: If the ledger exists, this command will reset the ledger to genesis, which resets the state by deleting all existing accounts/programs and starting fresh. Cloning Programs To add existing onchain programs to your local environment, you can clone the program with a new ledger. This is useful for testing interactions with other programs that already exist on any other cluster. To clone an account from another cluster: To clone an upgradeable program and its executable data from another cluster: mucho validator --ledger /path/to/custom/ledger mucho validator --reset mucho validator --reset \ --url CLUSTER_PROGRAM_IS_DEPLOYED_TO \ --clone PROGRAM_ADDRESS 2/8/25, 6:01 PM How to run the Solana local validator for testing | Solana https://solana.com/docs/toolkit/local-validator 6/10


---

### Page 7

“If a ledger already exists in your working directory, you must reset the ledger to be able to clone a program or account.” Cloning Accounts To add existing onchain accounts to your local environment, you can clone the account with a new ledger from any other network cluster. To clone an account from the cluster when a ledger already exists: Reset to Specific Account Data To reset the state of speciﬁc accounts every time you start the validator, you can use a combination of account snapshots and the --account ﬂag. First, save the desired state of an account as a JSON ﬁle: Then load this state each time you reset the validator: mucho validator --reset \ --url CLUSTER_PROGRAM_IS_DEPLOYED_TO \ --clone-upgradeable-program PROGRAM_ADDRESS mucho validator --reset \ --url CLUSTER_PROGRAM_IS_DEPLOYED_TO \ --clone ACCOUNT_ADDRESS solana account ACCOUNT_ADDRESS --output json --output-file account_state.json mucho validator --reset \ 2/8/25, 6:01 PM How to run the Solana local validator for testing | Solana https://solana.com/docs/toolkit/local-validator 7/10


---

### Page 8

Runtime Features Solana has a feature set mechanism that allows you to enable or disable certain blockchain features when running the test validator. By default, the test validator runs with all runtime features activated. To see all the runtime features available and their statuses: To query a speciﬁc runtime feature's status: To deactivate speciﬁc features in genesis: “This must be done on a fresh ledger, so if a ledger already exists in your working directory you must add the --reset ﬂag to reset to genesis.” To deactivate multiple features in genesis: --account ACCOUNT_ADDRESS account_state.json solana feature status solana feature status <ADDRESS> mucho validator --reset \ --deactivate-feature <FEATURE_PUBKEY> mucho validator --reset \ --deactivate-feature <FEATURE_PUBKEY_1> <FEATURE_PUBKEY_2> 2/8/25, 6:01 PM How to run the Solana local validator for testing | Solana https://solana.com/docs/toolkit/local-validator 8/10


---

### Page 9

Changing Versions To check your current solana-test-validator version: Your test validator runs on the same version as the Solana CLI installed and conﬁgured for use. To test your programs against different versions of the Solana runtime, you can install multiple versions of the Solana CLI and switch between them using the following command: Make sure to reset your Solana test validator's ledger after changing versions to ensure it runs a valid ledger without corruption. Last updated on 2/4/2025 Loading comments… Previous Best Practices Next Overview mucho validator --version solana-install init <VERSION> 2/8/25, 6:01 PM How to run the Solana local validator for testing | Solana https://solana.com/docs/toolkit/local-validator 9/10


---

### Page 10

Managed by SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 6:01 PM How to run the Solana local validator for testing | Solana https://solana.com/docs/toolkit/local-validator 10/10


---

# How to test Solana Programs with Rust _ Solana.pdf

### Page 1

Solana Documentation The Solana Toolkit Test Suite Rust Testing Framework for Solana “This is a beta version of the Solana Toolkit, and is still a WIP. Please post all feedback as a GitHub issue here.” Add Dependency Navigate to your program directory and run: LiteSVM Overview LiteSVM is a fast and lightweight library for testing Solana programs. It works by creating an in-process Solana VM optimized for program developers. This makes it much faster to run and compile than alternatives like solana-program-test and solana-test-validator. In a further break from tradition, it has an ergonomic API with sane defaults and extensive conﬁgurability for those who want it. cargo add --dev litesvm Documentation API Cookbook Courses Guides Get Support Table of Contents Add Dependency 2/8/25, 6:02 PM How to test Solana Programs with Rust | Solana https://solana.com/docs/toolkit/test-suite/rust-tests 1/4


---

### Page 2

Minimal Example Additional Resources Source Code Complete Project Example More Complex Project Example Last updated on 2/4/2025 use litesvm::LiteSVM; use solana_program::{message::Message, pubkey::Pubkey, system_instruction::tra use solana_sdk::{signature::Keypair, signer::Signer, transaction::Transaction} let from_keypair = Keypair::new(); let from = from_keypair.pubkey(); let to = Pubkey::new_unique(); let mut svm = LiteSVM::new(); svm.airdrop(&from, 10_000).unwrap(); let instruction = transfer(&from, &to, 64); let tx = Transaction::new( &[&from_keypair], Message::new(&[instruction], Some(&from)), svm.latest_blockhash(), ); let tx_res = svm.send_transaction(tx).unwrap(); let from_account = svm.get_account(&from); let to_account = svm.get_account(&to); assert_eq!(from_account.unwrap().lamports, 4936); assert_eq!(to_account.unwrap().lamports, 64); 2/8/25, 6:02 PM How to test Solana Programs with Rust | Solana https://solana.com/docs/toolkit/test-suite/rust-tests 2/4


---

### Page 3

0 reactions 0 comments Previous JavaScript Tests Next Troubleshooting Managed by SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN 2/8/25, 6:02 PM How to test Solana Programs with Rust | Solana https://solana.com/docs/toolkit/test-suite/rust-tests 3/4


---

### Page 4

© 2025 Solana Foundation. All rights reserved. 2/8/25, 6:02 PM How to test Solana Programs with Rust | Solana https://solana.com/docs/toolkit/test-suite/rust-tests 4/4


---

# How to create a new Solana program or app _ Solana.pdf

### Page 1

Solana Documentation The Solana Toolkit Creating a Project Program Project Templates “This is a beta version of the , and is still a WIP. Please post all feedback as a GitHub issue here.” Choose from one of the below scaffolds to generate a new project workspace: Anchor - A popular Rust-based framework for creating Solana programs. create-solana-program - In-depth workspace generator for either Anchor program development or Native programs, including JavaScript and Rust clients. Web App Templates - Generator for new projects that connects a Solana programs to various frontend stacks, includes wallet connector setup. Anchor This generates a basic workspace to be able to write an Anchor rust programs, build, test, and deploy. For more information, read the anchor init doc. S o l a n a T o o l kit anchor init Documentation API Cookbook Courses Guides Get Support Table of Contents Anchor 2/8/25, 6:01 PM How to create a new Solana program or app | Solana https://solana.com/docs/toolkit/projects/overview 1/4


---

### Page 2

Create Solana Program This generates an in-depth workspace for either Anchor program development or Native program development with either a Javascript Client, Rust Client, or both. For more information, read the create-solana-program doc. Web App Template This initializes a new project that connects a Solana program to a typescript frontend with a wallet connector. For more information, read the web app template doc. Mobile App Template This is initializing a new project using the Expo framework that is speciﬁcally designed for creating mobile applications that interact with the Solana blockchain. Update an Existing Project npx create-solana-program npx create-solana-dapp yarn create expo-app --template @solana-mobile/solana-mobile-expo-template npx create-solana-program 2/8/25, 6:01 PM How to create a new Solana program or app | Solana https://solana.com/docs/toolkit/projects/overview 2/4


---

### Page 3

You can add the Solana program scaffold to an existing project by following this guide. Standard Project Layouts For best practices on program ﬁle structure, read this guide. Last updated on 2/4/2025 0 reactions 0 comments Previous Getting Started Next Basic Anchor Managed by SOLANA GET CONNECTED 2/8/25, 6:01 PM How to create a new Solana program or app | Solana https://solana.com/docs/toolkit/projects/overview 3/4


---

### Page 4

Grants Break Solana Media Kit Careers Disclaimer Privacy Policy Blog Newsletter EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 6:01 PM How to create a new Solana program or app | Solana https://solana.com/docs/toolkit/projects/overview 4/4


---

# Program Derived Address (PDA) _ Solana.pdf

### Page 1

Solana Documentation Core Concepts Program Derived Address (PDA) Program Derived Addresses (PDAs) provide developers on Solana with two main use cases: Deterministic Account Addresses: PDAs provide a mechanism to deterministically derive an address using a combination of optional "seeds" (predeﬁned inputs) and a speciﬁc program ID. Enable Program Signing: The Solana runtime enables programs to "sign" for PDAs which are derived from its program ID. You can think of PDAs as a way to create hashmap-like structures on-chain from a predeﬁned set of inputs (e.g. strings, numbers, and other account addresses). The beneﬁt of this approach is that it eliminates the need to keep track of an exact address. Instead, you simply need to recall the speciﬁc inputs used for its derivation. ProgramId AccountInfo Wallet PublicKey Key AccountInfo Value Accounts findProgramAddress(seeds, programId) AccountInfoPDA Documentation API Cookbook Courses Guides Get Support Table of Contents Key Points 2/8/25, 5:38 PM Program Derived Address (PDA) | Solana https://solana.com/docs/core/pda 1/12


---

### Page 2

Program Derived Address It's important to understand that simply deriving a Program Derived Address (PDA) does not automatically create an on-chain account at that address. Accounts with a PDA as the on-chain address must be explicitly created through the program used to derive the address. You can think of deriving a PDA as ﬁnding an address on a map. Just having an address does not mean there is anything built at that location. “This section will cover the details of deriving PDAs. The details on how programs use PDAs for signing will be addressed in the section on Cross Program Invocations (CPIs) as it requires context for both concepts.” Key Points PDAs are addresses derived deterministically using a combination of user-deﬁned seeds, a bump seed, and a program's ID. PDAs are addresses that fall off the Ed25519 curve and have no corresponding private key. Solana programs can programmatically "sign" on behalf of PDAs that are derived using its program ID. Deriving a PDA does not automatically create an on-chain account. An account using a PDA as its address must be explicitly created through a dedicated instruction within a Solana program. What is a PDA PDAs are addresses that are deterministically derived and look like standard public keys, but have no associated private keys. This means that no external user can 2/8/25, 5:38 PM Program Derived Address (PDA) | Solana https://solana.com/docs/core/pda 2/12


---

### Page 3

generate a valid signature for the address. However, the Solana runtime enables programs to programmatically "sign" for PDAs without needing a private key. For context, Solana Keypairs are points on the Ed25519 curve (elliptic-curve cryptography) which have a public key and corresponding private key. We often use public keys as the unique IDs for new on-chain accounts and private keys for signing. Ed25519 curve ◎ 27 SOL Bobʼs wallet ADDRESS ADDRESS ◎ 15 SOL Aliceʼs wallet On Curve Address A PDA is a point that is intentionally derived to fall off the Ed25519 curve using a predeﬁned set of inputs. A point that is not on the Ed25519 curve does not have a valid corresponding private key and cannot be used for cryptographic operations (signing). A PDA can then be used as the address (unique identiﬁer) for an on-chain account, providing a method to easily store, map, and fetch program state. 2/8/25, 5:38 PM Program Derived Address (PDA) | Solana https://solana.com/docs/core/pda 3/12


---

### Page 4

Counter: 126 PROGRAM DERIVED ADDRESS seed “GLOBAL STATE” STRING Ping counter program Increment programId findProgramAddress() Ed25519 curve ADDRESS Off Curve Address How to derive a PDA The derivation of a PDA requires 3 inputs. Optional seeds: Predeﬁned inputs (e.g. string, number, other account addresses) used to derive a PDA. These inputs are converted to a buffer of bytes. Bump seed: An additional input (with a value between 255-0) that is used to guarantee that a valid PDA (off curve) is generated. This bump seed (starting with 255) is appended to the optional seeds when generating a PDA to "bump" the point off the Ed25519 curve. The bump seed is sometimes referred to as a "nonce". Program ID: The address of the program the PDA is derived from. This is also the program that can "sign" on behalf of the PDA 2/8/25, 5:38 PM Program Derived Address (PDA) | Solana https://solana.com/docs/core/pda 4/12


---

### Page 5

findProgramAddress(optional seeds, programId) Valid PDA found? return (PDA, bump) Yes No createProgramAddress(optional seeds + bump, programId) bump = 255 bump - 1 (ex. 254) PDA Derivation The examples below include links to Solana Playground, where you can run the examples in an in-browser editor. FindProgramAddress To derive a PDA, we can use the findProgramAddressSync method from @solana/web3.js. There are equivalents of this function in other programming languages (e.g. Rust), but in this section, we will walk through examples using Javascript. When using the findProgramAddressSync method, we pass in: the predeﬁned optional seeds converted to a buffer of bytes, and the program ID (address) used to derive the PDA 2/8/25, 5:38 PM Program Derived Address (PDA) | Solana https://solana.com/docs/core/pda 5/12


---

### Page 6

Once a valid PDA is found, findProgramAddressSync returns both the address (PDA) and bump seed used to derive the PDA. The example below derives a PDA without providing any optional seeds. You can run this example on Solana Playground. The PDA and bump seed output will always be the same: The next example below adds an optional seed "helloWorld". You can also run this example on Solana Playground. The PDA and bump seed output will always be the same: import { PublicKey } from "@solana/web3.js"; const programId = new PublicKey("11111111111111111111111111111111"); const [PDA, bump] = PublicKey.findProgramAddressSync([], programId); console.log(`PDA: ${PDA}`); console.log(`Bump: ${bump}`); PDA: Cu7NwqCXSmsR5vgGA3Vw9uYVViPi3kQvkbKByVQ8nPY9 Bump: 255 import { PublicKey } from "@solana/web3.js"; const programId = new PublicKey("11111111111111111111111111111111"); const string = "helloWorld"; const [PDA, bump] = PublicKey.findProgramAddressSync( [Buffer.from(string)], programId, ); console.log(`PDA: ${PDA}`); console.log(`Bump: ${bump}`); 2/8/25, 5:38 PM Program Derived Address (PDA) | Solana https://solana.com/docs/core/pda 6/12


---

### Page 7

Note that the bump seed is 254. This means that 255 derived a point on the Ed25519 curve, and is not a valid PDA. The bump seed returned by findProgramAddressSync is the ﬁrst value (between 255- 0) for the given combination of optional seeds and program ID that derives a valid PDA. “This ﬁrst valid bump seed is referred to as the "canonical bump". For program security, it is recommended to only use the canonical bump when working with PDAs.” CreateProgramAddress Under the hood, findProgramAddressSync will iteratively append an additional bump seed (nonce) to the seeds buffer and call the createProgramAddressSync method. The bump seed starts with a value of 255 and is decreased by 1 until a valid PDA (off curve) is found. You can replicate the previous example by using createProgramAddressSync and explicitly passing in the bump seed of 254. PDA: 46GZzzetjCURsdFPb7rcnspbEMnCBXe9kpjrsZAkKb6X Bump: 254 import { PublicKey } from "@solana/web3.js"; const programId = new PublicKey("11111111111111111111111111111111"); const string = "helloWorld"; const bump = 254; const PDA = PublicKey.createProgramAddressSync( [Buffer.from(string), Buffer.from([bump])], programId, ); console.log(`PDA: ${PDA}`); 2/8/25, 5:38 PM Program Derived Address (PDA) | Solana https://solana.com/docs/core/pda 7/12


---

### Page 8

Run this example above on Solana Playground. Given the same seeds and program ID, the PDA output will match the previous one: Canonical Bump The "canonical bump" refers to the ﬁrst bump seed (starting from 255 and decrementing by 1) that derives a valid PDA. For program security, it is recommended to only use PDAs derived from a canonical bump. Using the previous example as a reference, the example below attempts to derive a PDA using every bump seed from 255-0. Run the example on Solana Playground and you should see the following output: PDA: 46GZzzetjCURsdFPb7rcnspbEMnCBXe9kpjrsZAkKb6X import { PublicKey } from "@solana/web3.js"; const programId = new PublicKey("11111111111111111111111111111111"); const string = "helloWorld"; // Loop through all bump seeds for demonstration for (let bump = 255; bump >= 0; bump--) { try { const PDA = PublicKey.createProgramAddressSync( [Buffer.from(string), Buffer.from([bump])], programId, ); console.log("bump " + bump + ": " + PDA); } catch (error) { console.log("bump " + bump + ": " + error); } } bump 255: Error: Invalid seeds, address must fall off the curve bump 254: 46GZzzetjCURsdFPb7rcnspbEMnCBXe9kpjrsZAkKb6X bump 253: GBNWBGxKmdcd7JrMnBdZke9Fumj9sir4rpbruwEGmR4y 2/8/25, 5:38 PM Program Derived Address (PDA) | Solana https://solana.com/docs/core/pda 8/12


---

### Page 9

As expected, the bump seed 255 throws an error and the ﬁrst bump seed to derive a valid PDA is 254. However, note that bump seeds 253-251 all derive valid PDAs with different addresses. This means that given the same optional seeds and programId, a bump seed with a different value can still derive a valid PDA. When building Solana programs, it is recommended to include security checks that validate a PDA passed to the program is derived using the canonical bump. Failing to do so may introduce vulnerabilities that allow for unexpected accounts to be provided to a program. Create PDA Accounts This example program on Solana Playground demonstrates how to create an account using a PDA as the address of the new account. The example program is written using the Anchor framework. In the lib.rs ﬁle, you will ﬁnd the following program which includes a single instruction to create a new account using a PDA as the address of the account. The new account stores the address of the user and the bump seed used to derive the PDA. bump 252: THfBMgduMonjaNsCisKa7Qz2cBoG1VCUYHyso7UXYHH bump 251: EuRrNqJAofo7y3Jy6MGvF7eZAYegqYTwH2dnLCwDDGdP bump 250: Error: Invalid seeds, address must fall off the curve ... // remaining bump outputs lib.rs use anchor_lang::prelude::*; declare_id!("75GJVCJNhaukaa2vCCqhreY31gaphv7XTScBChmr1ueR"); #[program] pub mod pda_account { 2/8/25, 5:38 PM Program Derived Address (PDA) | Solana https://solana.com/docs/core/pda 9/12


---

### Page 10

The seeds used to derive the PDA include the hardcoded string data and the address of the user account provided in the instruction. The Anchor framework automatically derives the canonical bump seed. The init constraint instructs Anchor to invoke the System Program to create a new account using the PDA as the address. Under the hood, this is done through a CPI. use super::*; pub fn initialize(ctx: Context<Initialize>) -> Result<()> { let account_data = &mut ctx.accounts.pda_account; // store the address of the `user` account_data.user = *ctx.accounts.user.key; // store the canonical bump account_data.bump = ctx.bumps.pda_account; Ok(()) } } #[derive(Accounts)] pub struct Initialize<'info> { #[account(mut)] pub user: Signer<'info>, #[account( init, // set the seeds to derive the PDA seeds = [b"data", user.key().as_ref()], // use the canonical bump bump, #[account( init, seeds = [b"data", user.key().as_ref()], bump, payer = user, space = 8 + DataAccount::INIT_SPACE )] pub pda_account: Account<'info, DataAccount>, #[account( init, 2/8/25, 5:38 PM Program Derived Address (PDA) | Solana https://solana.com/docs/core/pda 10/12


---

### Page 11

In the test ﬁle (pda-account.test.ts) located within the Solana Playground link provided above, you will ﬁnd the Javascript equivalent to derive the PDA. A transaction is then sent to invoke the initialize instruction to create a new on- chain account using the PDA as the address. Once the transaction is sent, the PDA is used to fetch the on-chain account that was created at the address. Note that if you invoke the initialize instruction more than once using the same user address as a seed, then the transaction will fail. This is because an account will seeds = [b"data", user.key().as_ref()], bump, payer = user, space = 8 + DataAccount::INIT_SPACE )] pub pda_account: Account<'info, DataAccount>, const [PDA] = PublicKey.findProgramAddressSync( [Buffer.from("data"), user.publicKey.toBuffer()], program.programId, ); it("Is initialized!", async () => { const transactionSignature = await program.methods .initialize() .accounts({ user: user.publicKey, pdaAccount: PDA, }) .rpc(); console.log("Transaction Signature:", transactionSignature); }); it("Fetch Account", async () => { const pdaAccount = await program.account.dataAccount.fetch(PDA); console.log(JSON.stringify(pdaAccount, null, 2)); }); 2/8/25, 5:38 PM Program Derived Address (PDA) | Solana https://solana.com/docs/core/pda 11/12


---

### Page 12

already exist at the derived address. Last updated on 2/5/2025 Loading comments… Previous Programs on Solana Next Cross Program Invocation Managed by SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 5:38 PM Program Derived Address (PDA) | Solana https://solana.com/docs/core/pda 12/12


---

# State Compression _ Solana.pdf

### Page 1

Solana Documentation Advanced Topics State Compression On Solana, State Compression is the method of creating a "ﬁngerprint" (or hash) of offchain data and storing this ﬁngerprint on-chain for secure veriﬁcation. Effectively using the security of the Solana ledger to securely validate offchain data, verifying it has not been tampered with. This method of "compression" allows Solana programs and dApps to use cheap blockchain ledger space, instead of the more expensive account space, to securely store data. This is accomplished by using a special binary tree structure, known as a concurrent merkle tree, to create a hash of each piece of data (called a leaf), hashing those together, and only storing this ﬁnal hash on-chain. What is State Compression? In simple terms, state compression uses "tree" structures to cryptographically hash offchain data together, in a deterministic way, to compute a single ﬁnal hash that gets stored on-chain. These trees are created in this "deterministic" process by: taking any piece of data Documentation API Cookbook Courses Guides Get Support Table of Contents What is State Compression? 2/8/25, 5:43 PM State Compression | Solana https://solana.com/docs/advanced/state-compression 1/11


---

### Page 2

creating a hash of this data storing this hash as a leaf at the bottom of the tree each leaf pair is then hashed together, creating a branch each branch is then hashed together continually climbing the tree and hashing adjacent branches together once at the top of the tree, a ﬁnal root hash is produced This root hash is then stored onchain, as a veriﬁable proof of all of the data within every leaf. Allowing anyone to cryptographically verify all the offchain data within the tree, while only actually storing a minimal amount of data on-chain. Therefore, signiﬁcantly reducing the cost to store/prove large amounts of data due to this "state compression". Merkle trees and concurrent merkle trees Solana's state compression used a special type of merkle tree that allows for multiple changes to any given tree to happen, while still maintaining the integrity and validity of the tree. This special tree, known as a "concurrent merkle tree", effectively retains a "changelog" of the tree on-chain. Allowing for multiple rapid changes to the same tree (i.e. all in the same block), before a proof is invalidated. What is a merkle tree? A merkle tree, sometimes called a "hash tree", is a hash based binary tree structure where each leaf node is represented as a cryptographic hash of its inner data. And every node that is not a leaf, called a branch, is represented as a hash of its child leaf hashes. Each branch is then also hashed together, climbing the tree, until eventually only a single hash remains. This ﬁnal hash, called the root hash or "root", can then be used 2/8/25, 5:43 PM State Compression | Solana https://solana.com/docs/advanced/state-compression 2/11


---

### Page 3

in combination with a "proof path" to verify any piece of data stored within a leaf node. Once a ﬁnal root hash has been computed, any piece of data stored within a leaf node can be veriﬁed by rehashing the speciﬁc leaf's data and the hash label of each adjacent branch climbing the tree (known as the proof or "proof path"). Comparing this "rehash" to the root hash is the veriﬁcation of the underlying leaf data. If they match, the data is veriﬁed accurate. If they do not match, the leaf data was changed. Whenever desired, the original leaf data can be changed by simply hashing the new leaf data and recomputing the root hash in the same manner of the original root. This new root hash is then used to verify any of the data, and effectively invalidates the previous root hash and previous proof. Therefore, each change to these traditional merkle trees are required to be performed in series. “This process of changing leaf data, and computing a new root hash can be a very common thing when using merkle trees! While it is one of the design points of the tree, it can result in one of the most notable drawbacks: rapid changes.” What is a Concurrent merkle tree? In high throughput applications, like within the Solana runtime, requests to change an on-chain traditional merkle tree could be received by validators in relatively rapid succession (e.g. within the same slot). Each leaf data change would still be required to be performed in series. Resulting in each subsequent request for change to fail, due to the root hash and proof being invalidated by the previous change request in the slot. Enter, Concurrent merkle trees. A Concurrent merkle tree stores a secure changelog of the most recent changes, their root hash, and the proof to derive it. This changelog "buffer" is stored on-chain in an account speciﬁc to each tree, with a maximum number of changelog "records" (aka maxBufferSize). 2/8/25, 5:43 PM State Compression | Solana https://solana.com/docs/advanced/state-compression 3/11


---

### Page 4

When multiple leaf data change requests are received by validators in the same slot, the on-chain concurrent merkle tree can use this "changelog buffer" as a source of truth for more acceptable proofs. Effectively allowing for up to maxBufferSize changes to the same tree in the same slot. Signiﬁcantly boosting throughput. Sizing a concurrent merkle tree When creating one of these on-chain trees, there are 3 values that will determine the size of your tree, the cost to create your tree, and the number of concurrent changes to your tree: 1. max depth 2. max buffer size 3. canopy depth Max depth The "max depth" of a tree is the maximum number of hops to get from any data leaf to the root of the tree. Since merkle trees are binary trees, every leaf is connected to only one other leaf; existing as a leaf pair. Therefore, the maxDepth of a tree is used to determine the maximum number of nodes (aka pieces of data or leafs) to store within the tree using a simple calculation: Since a trees depth must be set at tree creation, you must decide how many pieces of data you want your tree to store. Then using the simple calculation above, you can determine the lowest maxDepth to store your data. nodes_count = 2 ^ maxDepth 2/8/25, 5:43 PM State Compression | Solana https://solana.com/docs/advanced/state-compression 4/11


---

### Page 5

Example 1: minting 100 nfts If you wanted to create a tree to store 100 compressed nfts, we will need a minimum of "100 leafs" or "100 nodes". We must use a maxDepth of 7 to ensure we can store all of our data. Example 2: minting 15000 nfts If you wanted to create a tree to store 15000 compressed nfts, we will need a minimum of "15000 leafs" or "15000 nodes". We must use a maxDepth of 14 to ensure we can store all of our data. The higher the max depth, the higher the cost The maxDepth value will be one of the primary drivers of cost when creating a tree since you will pay this cost upfront at tree creation. The higher the max tree depth, the more data ﬁngerprints (aka hashes) you can store, the higher the cost. Max buffer size The "max buffer size" is effectively the maximum number of changes that can occur on a tree, with the root hash still being valid. // maxDepth=6 -> 64 nodes 2^6 = 64 // maxDepth=7 -> 128 nodes 2^7 = 128 // maxDepth=13 -> 8192 nodes 2^13 = 8192 // maxDepth=14 -> 16384 nodes 2^14 = 16384 2/8/25, 5:43 PM State Compression | Solana https://solana.com/docs/advanced/state-compression 5/11


---

### Page 6

Due to the root hash effectively being a single hash of all leaf data, changing any single leaf would invalidate the proof needed for all subsequent attempts to change any leaf of a regular tree. But with a concurrent tree, there is effectively a changelog of updates for these proofs. This changelog buffer is sized and set at tree creation via this maxBufferSize value. Canopy depth The "canopy depth," also known as the canopy size, refers to the number of proof node levels that are cached or stored onchain for a given proof path. When performing an update action on a leaf, like transferring ownership (e.g. selling a compressed NFT), the complete proof path must be used to verify original ownership of the leaf and therefore allow for the update action. This veriﬁcation is performed using the complete proof path to correctly compute the current root hash (or any cached root hash via the onchain "concurrent buffer"). The larger a tree's max depth is, the more proof nodes are required to perform this veriﬁcation. For example, if your max depth is 14, there are 14 total proof nodes required to be used to verify. As a tree gets larger, the complete proof path gets larger. Normally, each of these proof nodes would be required to be included within each tree update transaction. Since each proof node value takes up 32 bytes in a transaction (similar to providing a Public Key), larger trees would very quickly exceed the maximum transaction size limit. Enter the canopy. The canopy enables storing a set number of proof nodes on chain (for any given proof path). Allowing for less proof nodes to be included within each update transactions, therefore keeping the overall transaction size below the limit. For example, a tree with a max depth of 14 would require 14 total proof nodes. With a canopy of 10, only 4 proof nodes are required to be submitted per update transaction. 2/8/25, 5:43 PM State Compression | Solana https://solana.com/docs/advanced/state-compression 6/11


---

### Page 7

Canopy depth of 1 for a Concurrent Merkle Tree of max depth of 3 Consider another example, this time with a tree of max depth 3. If we want to apply an action to one of the tree’s leaves—such as updating R4—we need to provide proofs for L4 and R2. However, we can omit R1 since it is already cached/stored onchain due to our canopy depth of 1, which ensures that all nodes at level 1 ( L1 and R1) are stored onchain. This results in a total of 2 required proofs. Therefore, the number of proofs required to update a leaf is equal to the max depth minus the canopy depth. In this example, 3 - 1 = 2. The larger the canopy depth value, the higher the cost The canopyDepth value is also a primary factor of cost when creating a tree since you will pay this cost upfront at tree creation. The higher the canopy depth, the more data proof nodes are stored onchain, the higher the cost. Smaller canopy limits composability 2/8/25, 5:43 PM State Compression | Solana https://solana.com/docs/advanced/state-compression 7/11


---

### Page 8

While a tree's creation costs are higher with a higher canopy, having a lower canopyDepth will require more proof nodes to be included within each update transaction. The more nodes required to be submitted, the larger the transaction size, and therefore the easier it is to exceed the transaction size limits. This will also be the case for any other Solana program or dApp that attempts to interact with your tree/leafs. If your tree requires too many proof nodes (because of a low canopy depth), then any other additional actions another on-chain program could offer will be limited by their speciﬁc instruction size plus your proof node list size. Limiting composability, and potential additional utility for your speciﬁc tree. For example, if your tree is being used for compressed NFTs and has a very low canopy depth, an NFT marketplace may only be able to support simple NFTs transfers. And not be able to support an on-chain bidding system. Cost of creating a tree The cost of creating a concurrent merkle tree is based on the tree's size parameters: maxDepth, maxBufferSize, and canopyDepth. These values are all used to calculate the on-chain storage (in bytes) required for a tree to exist onchain. Once the required space (in bytes) has been calculated, and using the getMinimumBalanceForRentExemption RPC method, request the cost (in lamports) to allocate this amount of bytes on-chain. Calculate tree cost in JavaScript Within the @solana/spl-account-compression package, developers can use the getConcurrentMerkleTreeAccountSize function to calculate the required space for a given tree size parameters. Then using the getMinimumBalanceForRentExemption function to get the ﬁnal cost (in lamports) to allocate the required space for the tree on-chain. 2/8/25, 5:43 PM State Compression | Solana https://solana.com/docs/advanced/state-compression 8/11


---

### Page 9

Then determine the cost in lamports to make an account of this size rent exempt, similar to any other account creation. Example costs Listed below are several example costs, for different tree sizes, including how many leaf nodes are possible for each: Example #1: 16,384 nodes costing 0.222 SOL max depth of 14 and max buffer size of 64 maximum number of leaf nodes: 16,384 canopy depth of 0 costs approximately 0.222 SOL to create Example #2: 16,384 nodes costing 1.134 SOL max depth of 14 and max buffer size of 64 maximum number of leaf nodes: 16,384 canopy depth of 11 costs approximately 1.134 SOL to create Example #3: 1,048,576 nodes costing 1.673 SOL max depth of 20 and max buffer size of 256 maximum number of leaf nodes: 1,048,576 // calculate the space required for the tree const requiredSpace = getConcurrentMerkleTreeAccountSize( maxDepth, maxBufferSize, canopyDepth, ); // get the cost (in lamports) to store the tree on-chain const storageCost = await connection.getMinimumBalanceForRentExemption(requiredSpace); 2/8/25, 5:43 PM State Compression | Solana https://solana.com/docs/advanced/state-compression 9/11


---

### Page 10

canopy depth of 10 costs approximately 1.673 SOL to create Example #4: 1,048,576 nodes costing 15.814 SOL max depth of 20 and max buffer size of 256 maximum number of leaf nodes: 1,048,576 canopy depth of 15 costs approximately 15.814 SOL to create Compressed NFTs Compressed NFTs are one of the most popular use cases for State Compression on Solana. With compression, a one million NFT collection could be minted for ~50 SOL, vice ~12,000 SOL for its uncompressed equivalent collection. If you are interested in creating compressed NFTs yourself, read our developer guide for minting and transferring compressed NFTs. Last updated on 2/4/2025 Previous Address Lookup Tables Next Actions and Blinks 2/8/25, 5:43 PM State Compression | Solana https://solana.com/docs/advanced/state-compression 10/11


---

### Page 11

Managed by SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 5:43 PM State Compression | Solana https://solana.com/docs/advanced/state-compression 11/11


---

# Tokens on Solana _ Solana.pdf

### Page 1

Solana Documentation Core Concepts Tokens on Solana Tokens are digital assets that represent ownership over diverse categories of assets. Tokenization enables the digitalization of property rights, serving as a fundamental component for managing both fungible and non-fungible assets. Fungible Tokens represent interchangeable and divisible assets of the same type and value (ex. USDC). Non-fungible Tokens (NFT) represent ownership of indivisible assets (e.g. artwork). This section will cover the basics of how tokens are represented on Solana. These are referred to as SPL (Solana Program Library) Tokens. The Token Program contains all the instruction logic for interacting with tokens on the network (both fungible and non-fungible). A Mint Account represents a speciﬁc type of token and stores global metadata about the token such as the total supply and mint authority (address authorized to create new units of a token). A Token Account keeps track of individual ownership of how many units of a speciﬁc type of token (mint account) are owned by a speciﬁc address. “There are currently two versions of the Token Program. The original Token Program and the Token Extensions Program (Token2022). The Token Extensions Documentation API Cookbook Courses Guides Get Support Table of Contents Key Points 2/8/25, 5:39 PM Tokens on Solana | Solana https://solana.com/docs/core/tokens 1/18


---

### Page 2

Program functions the same as the original Token Program, but with additional features and improvements. The Token Extensions Program is the recommended version to use for creating new tokens (mint accounts).” Key Points Tokens represent ownership over either fungible (interchangeable) or non-fungible (unique) assets. The Token Program contains all instruction for interacting with both fungible and non-fungible tokens on the network. The Token Extensions Program is a new version of the Token Program that includes additional features while maintaining the same core functionalities. A Mint Account represents a unique token on the network and stores global metadata such as total supply. A Token Account tracks individual ownership of tokens for a speciﬁc mint account. An Associated Token Account is a Token Account created with an address derived from the owner's and mint account's addresses. Token Program The Token Program contains all the instruction logic for interacting with tokens on the network (both fungible and non-fungible). All tokens on Solana are effectively data accounts owned by the Token Program. You can ﬁnd the full list of Token Program instructions here. 2/8/25, 5:39 PM Tokens on Solana | Solana https://solana.com/docs/core/tokens 2/18


---

### Page 3

AccountInfo Address Token Program Address AccountInfo Data: Executable: True Lamports: Number Owner: BPF Loader BPF Loader owner Program Code Account Data Token Program A few commonly used instructions include: InitializeMint: Create a new mint account to represent a new type of token. InitializeAccount: Create a new token account to hold units of a speciﬁc type of token (mint). MintTo: Create new units of a speciﬁc type of token and add them to a token account. This increases the supply of the token and can only be done by the mint authority of the mint account. Transfer: Transfer units of a speciﬁc type of token from one token account to another. Mint Account Tokens on Solana are uniquely identiﬁed by the address of a Mint Account owned by the Token Program. This account is effectively a global counter for a speciﬁc token, and stores data such as: Supply: Total supply of the token Decimals: Decimal precision of the token Mint authority: The account authorized to create new units of the token, thus increasing the supply 2/8/25, 5:39 PM Tokens on Solana | Solana https://solana.com/docs/core/tokens 3/18


---

### Page 4

Freeze authority: The account authorized to freeze tokens from being transferred from "token accounts" Address Address Mint Account Token Program Data: Executable: False Lamports: Number Owner: Token Program Mint Authority Supply Decimals Freeze Authority Account Data AccountInfoowner Mint Account The full details stored on each Mint Account include the following: For reference, here is a Solana Explorer link to the USDC Mint Account. Token Account pub struct Mint { /// Optional authority used to mint new tokens. The mint authority may onl /// be provided during mint creation. If no mint authority is present /// then the mint has a fixed supply and no further tokens may be /// minted. pub mint_authority: COption<Pubkey>, /// Total supply of tokens. pub supply: u64, /// Number of base 10 digits to the right of the decimal place. pub decimals: u8, /// Is `true` if this structure has been initialized pub is_initialized: bool, /// Optional authority to freeze token accounts. pub freeze_authority: COption<Pubkey>, } 2/8/25, 5:39 PM Tokens on Solana | Solana https://solana.com/docs/core/tokens 4/18


---

### Page 5

To track the individual ownership of each unit of a speciﬁc token, another type of data account owned by the Token Program must be created. This account is referred to as a Token Account. The most commonly referenced data stored on the Token Account include the following: Mint: The type of token the Token Account holds units of Owner: The account authorized to transfer tokens out of the Token Account Amount: Units of the token the Token Account currently holds Address Address Token Program AccountInfo Account Data Token Account Data: Executable: False Lamports: Number Owner: Token Program Mint Owner Amount owner Token Account The full details stored on each Token Account includes the following: pub struct Account { /// The mint associated with this account pub mint: Pubkey, /// The owner of this account. pub owner: Pubkey, /// The amount of tokens this account holds. pub amount: u64, /// If `delegate` is `Some` then `delegated_amount` represents /// the amount authorized by the delegate pub delegate: COption<Pubkey>, /// The account's state pub state: AccountState, 2/8/25, 5:39 PM Tokens on Solana | Solana https://solana.com/docs/core/tokens 5/18


---

### Page 6

For a wallet to own units of a certain token, it needs to create a token account for a speciﬁc type of token (mint) that designates the wallet as the owner of the token account. A wallet can create multiple token accounts for the same type of token, but each token account can only be owned by one wallet and hold units of one type of token. AddressAddress Wallet Account Mint Account Address Mint Token Account Owner Amount Address Token Program Address System Program owner ownerowner Account Relationship “Note that each Token Account's data includes an owner ﬁeld used to identify who has authority over that speciﬁc Token Account. This is separate from the program owner speciﬁed in the AccountInfo, which is the Token Program for all Token Accounts.” /// If is_native.is_some, this is a native token, and the value logs the /// rent-exempt reserve. An Account is required to be rent-exempt, so /// the value is used by the Processor to ensure that wrapped SOL /// accounts do not drop below this threshold. pub is_native: COption<u64>, /// The amount delegated pub delegated_amount: u64, /// Optional authority to close the account. pub close_authority: COption<Pubkey>, } 2/8/25, 5:39 PM Tokens on Solana | Solana https://solana.com/docs/core/tokens 6/18


---

### Page 7

Associated Token Account To simplify the process of locating a token account's address for a speciﬁc mint and owner, we often use Associated Token Accounts. An Associated Token Account is a token account whose address is deterministically derived using the owner's address and the mint account's address. You can think of the Associated Token Account as the "default" token account for a speciﬁc mint and owner. It's important to understand that an Associated Token Account isn't a different type of token account. It's just a token account with a speciﬁc address. Address Address Mint Associated Token Account Owner Amount Address Wallet Account Mint Account PDA Associated Token Account This introduces a key concept in Solana development: Program Derived Address (PDA). Conceptually, a PDA provides a deterministic way to generate an address using some predeﬁned inputs. This enables us to easily ﬁnd the address of an account at a later time. Here is a Solana Playground example that derives the USDC Associated Token Account address and owner. It will always generate the same address for the same mint and owner. import { getAssociatedTokenAddressSync } from "@solana/spl-token"; 2/8/25, 5:39 PM Tokens on Solana | Solana https://solana.com/docs/core/tokens 7/18


---

### Page 8

Speciﬁcally, the address for an Associated Token Account is derived using the following inputs. Here is a Solana Playground example that generates the same address as the previous example. For two wallets to hold units of the same type of token, each wallet needs its own token account for the speciﬁc mint account. The image below demonstrates what this account relationship looks like. Address Address Address Mint: Mint B Associated Token Account Address Address Owner: Wallet 1 Amount Wallet 1 Account Address Mint B Account Address Mint: Mint A Associated Token Account Address Owner: Wallet 1 Amount Mint A Account Mint: Mint B Associated Token Account Owner: Wallet 2 Amount Mint: Mint A Associated Token Account Owner: Wallet 2 Amount Wallet 2 Account Accounts Relationship Expanded Token Examples const associatedTokenAccountAddress = getAssociatedTokenAddressSync( USDC_MINT_ADDRESS, OWNER_ADDRESS, ); import { PublicKey } from "@solana/web3.js"; const [PDA, bump] = PublicKey.findProgramAddressSync( [ OWNER_ADDRESS.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), USDC_MINT_ADDRESS.toBuffer(), ], ASSOCIATED_TOKEN_PROGRAM_ID, ); 2/8/25, 5:39 PM Tokens on Solana | Solana https://solana.com/docs/core/tokens 8/18


---

### Page 9

The spl-token CLI can be used to experiment with SPL tokens. In the examples below, we'll use the Solana Playground terminal to run the CLI commands directly in the browser without having to install the CLI locally. Creating tokens and accounts requires SOL for account rent deposits and transaction fees. If it is your ﬁrst time using Solana Playground, created a Playground wallet and run the solana airdrop command in the Playground terminal. You can also get devnet SOL using the public web faucet. Run spl-token --help for a full description of available commands. Alternatively, you can install the spl-token CLI locally using the following command. This requires ﬁrst installing Rust. “In the following sections, the account addresses displayed when you run the CLI command will differ from the example output shown below. Please use the address shown in your Playground terminal when following along. For example, the address output from the create-token is the mint account where your Playground wallet is set as the mint authority.” Create a New Token To create a new token (mint account) run the following command in the Solana Playground terminal. solana airdrop 2 spl-token --help spl-token create-token 2/8/25, 5:39 PM Tokens on Solana | Solana https://solana.com/docs/core/tokens 9/18


---

### Page 10

You should see an output similar to the following below. You can inspect both the token and transaction details on Solana Explorer using the Address and Signature. In the example output below, the unique identiﬁer (address) of the new token is 99zqUzQGohamfYxyo8ykTEbi91iom3CLmwCA75FK5zTg. New tokens initially have no supply. You can check the current supply of a token using the following command: Running the supply command for a newly created token will return a value of 0: Under the hood, creating a new Mint Account requires sending a transaction with two instructions. Here is a Javascript example on Solana Playground. 1. Invoke the System Program to create a new account with enough space for the Mint Account data and then transfer ownership to the Token Program. 2. Invoke the Token Program to initialize the data of the new account as a Mint Account Terminal Output Creating token 99zqUzQGohamfYxyo8ykTEbi91iom3CLmwCA75FK5zTg Address: 99zqUzQGohamfYxyo8ykTEbi91iom3CLmwCA75FK5zTg Decimals: 9 Signature: 44fvKfT1ezBUwdzrCys3fvCdFxbLMnNvBstds76QZyE6cXag5NupBprSXwxPTzzjrC3 spl-token supply <TOKEN_ADDRESS> spl-token supply 99zqUzQGohamfYxyo8ykTEbi91iom3CLmwCA75FK5zTg 2/8/25, 5:39 PM Tokens on Solana | Solana https://solana.com/docs/core/tokens 10/18


---

### Page 11

Create Token Account To hold units of a particular token, you must ﬁrst create a token account. To create a new token account, use the following command: For example, running the following command in the Solana Playground terminal: Returns the following output: AfB7uwBEsGtrrBqPTVqEgzWed5XdYfM1psPNLmf7EeX9 is the address of the token account created to hold units of the token speciﬁed in the create-account command. By default the create-account command creates an associated token account with your wallet address as the token account owner. You can create a token account with a different owner using the following command: For example, running the following command: spl-token create-account [OPTIONS] <TOKEN_ADDRESS> spl-token create-account 99zqUzQGohamfYxyo8ykTEbi91iom3CLmwCA75FK5zTg Terminal Output Creating account AfB7uwBEsGtrrBqPTVqEgzWed5XdYfM1psPNLmf7EeX9 Signature: 2BtrynuCLX9CNofFiaw6Yzbx6hit66pup9Sk7aFjwU2NEbFz7NCHD9w9sWhrCfEd73X spl-token create-account --owner <OWNER_ADDRESS> <TOKEN_ADDRESS> 2/8/25, 5:39 PM Tokens on Solana | Solana https://solana.com/docs/core/tokens 11/18


---

### Page 12

Returns the following output: Hmyk3FSw4cfsuAes7sanp2oxSkE9ivaH6pMzDzbacqmt is the address of the token account created to hold units of the token speciﬁed in the create-account command (99zqUzQGohamfYxyo8ykTEbi91iom3CLmwCA75FK5zTg) and owned by the address speciﬁed following the --owner ﬂag (2i3KvjDCZWxBsqcxBHpdEaZYQwQSYE6LXUMx5VjY5XrR). This is useful when you need to create a token account for another user. Under the hood, creating an Associated Token Account requires a single instruction that invokes the Associated Token Program. Here is a Javascript example on Solana Playground. The Associated Token Program uses Cross Program Invocations to handle: Invoking the System Program to create a new account using the provided PDA as the address of the new account Invoking the Token Program to initialize the Token Account data for the new account. Alternatively, creating a new Token Account using a randomly generated keypair (not an Associated Token Account) requires sending a transaction with two instructions. Here is a Javascript example on Solana Playground. 1. Invoke the System Program to create a new account with enough space for the Token Account data and then transfer ownership to the Token Program. spl-token create-account --owner 2i3KvjDCZWxBsqcxBHpdEaZYQwQSYE6LXUMx5VjY5XrR Terminal Output Creating account Hmyk3FSw4cfsuAes7sanp2oxSkE9ivaH6pMzDzbacqmt Signature: 44vqKdfzspT592REDPY4goaRJH3uJ3Ce13G4BCuUHg35dVUbHuGTHvqn4ZjYF9BGe9Q 2/8/25, 5:39 PM Tokens on Solana | Solana https://solana.com/docs/core/tokens 12/18


---

### Page 13

2. Invoke the Token Program to initialize the data of the new account as a Token Account Mint Tokens To create new units of a token, use the following command: For example, running the following command: Returns the following output: 99zqUzQGohamfYxyo8ykTEbi91iom3CLmwCA75FK5zTg is the address of the mint account that tokens are being minted for (increasing total supply). AfB7uwBEsGtrrBqPTVqEgzWed5XdYfM1psPNLmf7EeX9 is the address of your wallet's token account that units of the token are being minted to (increasing amount). To mint tokens to a different token account, specify the address of the intended recipient token account. For example, running the following command: spl-token mint [OPTIONS] <TOKEN_ADDRESS> <TOKEN_AMOUNT> [--] [RECIPIENT_TOKEN_ spl-token mint 99zqUzQGohamfYxyo8ykTEbi91iom3CLmwCA75FK5zTg 100 Terminal Output Minting 100 tokens Token: 99zqUzQGohamfYxyo8ykTEbi91iom3CLmwCA75FK5zTg Recipient: AfB7uwBEsGtrrBqPTVqEgzWed5XdYfM1psPNLmf7EeX9 Signature: 2NJ1m7qCraPSBAVxbr2ssmWZmBU9Jc8pDtJAnyZsZJRcaYCYMqq1oRY1gqA4ddQno3g 2/8/25, 5:39 PM Tokens on Solana | Solana https://solana.com/docs/core/tokens 13/18


---

### Page 14

Returns the following output: 99zqUzQGohamfYxyo8ykTEbi91iom3CLmwCA75FK5zTg is the address of the mint account that tokens are being minted for (increasing total supply). Hmyk3FSw4cfsuAes7sanp2oxSkE9ivaH6pMzDzbacqmt is the address of the token account that units of the token are being minted to (increasing amount). Under the hood, creating new units of a token requires invoking the MintTo instruction on the Token Program. This instruction must be signed by the mint authority. The instruction mints new units of the token to a Token Account and increases the total supply on the Mint Account. Here is a Javascript example on Solana Playground. Transfer Tokens To transfer units of a token between two token accounts, use the following command: For example, running the following command: spl-token mint 99zqUzQGohamfYxyo8ykTEbi91iom3CLmwCA75FK5zTg 100 -- Hmyk3FSw4cf Terminal Output Minting 100 tokens Token: 99zqUzQGohamfYxyo8ykTEbi91iom3CLmwCA75FK5zTg Recipient: Hmyk3FSw4cfsuAes7sanp2oxSkE9ivaH6pMzDzbacqmt Signature: 3SQvNM3o9DsTiLwcEkSPT1Edr14RgE2wC54TEjonEP2swyVCp2jPWYWdD6RwXUGpvDN spl-token transfer [OPTIONS] <TOKEN_ADDRESS> <TOKEN_AMOUNT> <RECIPIENT_ADDRESS or RECIPIENT_TOKEN_ACCOUNT_ADDRESS> 2/8/25, 5:39 PM Tokens on Solana | Solana https://solana.com/docs/core/tokens 14/18


---

### Page 15

Returns the following output: AfB7uwBEsGtrrBqPTVqEgzWed5XdYfM1psPNLmf7EeX9 is the address of the token account that tokens are being transferred from. This would be the address of your token account for the speciﬁed token being transferred. Hmyk3FSw4cfsuAes7sanp2oxSkE9ivaH6pMzDzbacqmt is the address of the token account that tokens are being transferred to. Under the hood, transferring tokens requires invoking the Transfer instruction on the Token Program. This instruction must be signed by the owner of the sender's Token Account. The instruction transfers units of a token from one Token Account to another Token Account. Here is a Javascript example on Solana Playground. It's important to understand that both the sender and recipient must have existing token accounts for the speciﬁc type of token being transferred. The sender can include additional instructions on the transaction to create the recipient's token account, which generally is the Associated Token Account. Create Token Metadata The Token Extensions Program enables additional customizable metadata (such as name, symbol, link to image) to be stored directly on the Mint Account. spl-token transfer 99zqUzQGohamfYxyo8ykTEbi91iom3CLmwCA75FK5zTg 100 Hmyk3FSw4c Terminal Output Transfer 100 tokens Sender: AfB7uwBEsGtrrBqPTVqEgzWed5XdYfM1psPNLmf7EeX9 Recipient: Hmyk3FSw4cfsuAes7sanp2oxSkE9ivaH6pMzDzbacqmt Signature: 5y6HVwV8V2hHGLTVmTmdySRiEUCZnWmkasAvJ7J6m7JR46obbGKCBqUFgLpZu5zQGwM 2/8/25, 5:39 PM Tokens on Solana | Solana https://solana.com/docs/core/tokens 15/18


---

### Page 16

To use the Token Extensions CLI ﬂags, ensure you have a local installation of the CLI, version 3.4.0 or later: cargo install --version 3.4.0 spl-token-cli To create a new token with the metadata extension enabled, using the following command: The command returns the following output: BdhzpzhTD1MFqBiwNdrRy4jFo2FHFufw3n9e8sVjJczP is the address of the new token created with the metadata extension enabled. Once a new token is created with the metadata extension enabled, use the following command to initialize the metadata. The token URI is normally a link to offchain metadata you want to associate with the token. You can ﬁnd an example of the JSON format here. spl-token create-token --program-id TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuE --enable-metadata Terminal Output Creating token BdhzpzhTD1MFqBiwNdrRy4jFo2FHFufw3n9e8sVjJczP under program Toke To initialize metadata inside the mint, please run `spl-token initialize-metad Address: BdhzpzhTD1MFqBiwNdrRy4jFo2FHFufw3n9e8sVjJczP Decimals: 9 Signature: 5iQofFeXdYhMi9uTzZghcq8stAaa6CY6saUwcdnELST13eNSifiuLbvR5DnRt311frk spl-token initialize-metadata <TOKEN_MINT_ADDRESS> <YOUR_TOKEN_NAME> <YOUR_TOKEN_SYMBOL> <YOUR_TOKEN_URI> 2/8/25, 5:39 PM Tokens on Solana | Solana https://solana.com/docs/core/tokens 16/18


---

### Page 17

For example, running the following command will store the additional metadata directly on the speciﬁed mint account: You can then look up the address of the mint account on an explorer to inspect the metadata. For example, here is a token created with the metadata extension enabled on the SolanaFm explorer. You can learn more on the Metadata Extension Guide. For more details related to various Token Extensions, refer to the Token Extensions Getting Started Guide and the SPL documentation. Last updated on 2/4/2025 Loading comments… Previous Cross Program Invocation Next Clusters & Endpoints Managed by SOLANA GET CONNECTED spl-token initialize-metadata BdhzpzhTD1MFqBiwNdrRy4jFo2FHFufw3n9e8sVjJczP "To 2/8/25, 5:39 PM Tokens on Solana | Solana https://solana.com/docs/core/tokens 17/18


---

### Page 18

Grants Break Solana Media Kit Careers Disclaimer Privacy Policy Blog Newsletter EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 5:39 PM Tokens on Solana | Solana https://solana.com/docs/core/tokens 18/18


---

# Deploying Programs _ Solana.pdf

### Page 1

Solana Documentation Developing Programs Deploying Programs Solana programs are stored in "executable" accounts on the network. These accounts contain the program's compiled bytecode that deﬁne the instructions users invoke to interact with the program. CLI Commands The section is intended as a reference for the basic CLI commands for building and deploying Solana programs. For a step-by-step guide on creating your ﬁrst program, start with Developing Programs in Rust. Build Program To build your program, use the cargo build-sbf command. This command will: 1. Compile your program cargo build-sbf Documentation API Cookbook Courses Guides Get Support Table of Contents CLI Commands 2/8/25, 6:03 PM Deploying Programs | Solana https://solana.com/docs/programs/deploying 1/10


---

### Page 2

2. Create a target/deploy directory 3. Generate a <program-name>.so ﬁle, where <program-name> matches your program's name in Cargo.toml The output .so ﬁle contains your program's compiled bytecode that will be stored in a Solana account when you deploy your program. Deploy Program To deploy your program, use the solana program deploy command followed by the path to the .so ﬁle created by the cargo build-sbf command. During times of congestion, there are a few additional ﬂags you can use to help with program deployment. --with-compute-unit-price: Set compute unit price for transaction, in increments of 0.000001 lamports (micro-lamports) per compute unit. --max-sign-attempts: Maximum number of attempts to sign or resign transactions after blockhash expiration. If any transactions sent during the program deploy are still unconﬁrmed after the initially chosen recent blockhash expires, those transactions will be resigned with a new recent blockhash and resent. Use this setting to adjust the maximum number of transaction signing iterations. Each blockhash is valid for about 60 seconds, which means using the default value of 5 will lead to sending transactions for at least 5 minutes or until all transactions are conﬁrmed,whichever comes ﬁrst. [default: 5] --use-rpc: Send write transactions to the conﬁgured RPC instead of validator TPUs. This ﬂag requires a stake-weighted RPC connection. You can use the ﬂags individually or combine them together. For example: solana program deploy ./target/deploy/your_program.so 2/8/25, 6:03 PM Deploying Programs | Solana https://solana.com/docs/programs/deploying 2/10


---

### Page 3

Use the Priority Fee API by Helius to get an estimate of the priority fee to set with the --with-compute-unit-price ﬂag. Get a stake-weighted RPC connection from Helius or Triton to use with the --use- rpc ﬂag. The --use-rpc ﬂag should only be used with a stake-weighted RPC connection. To update your default RPC URL with a custom RPC endpoint, use the solana config set command. You can view the list of programs you've deployed using the program show subcommand: Example output: Update Program A program's update authority can modify an existing Solana program by deploying a new .so ﬁle to the same program ID. To update an existing Solana program: solana program deploy ./target/deploy/your_program.so --with-compute-unit-pric solana config set --url <RPC_URL> solana program show --programs Program Id | Slot | Authority 2w3sK6CW7Hy1Ljnz2uqPrQsg4KjNZxD4bDerXDkSX3Q1 | 133132 | 4kh6HxYZiAebF8HWLsU 2/8/25, 6:03 PM Deploying Programs | Solana https://solana.com/docs/programs/deploying 3/10


---

### Page 4

Make changes to your program source code Run cargo build-sbf to generate an updated .so ﬁle Run solana program deploy ./target/deploy/your_program.so to deploy the updated .so ﬁle The update authority can be changed using the set-upgrade-authority subcommand as follows: Immutable Program A program can be made immutable by removing its update authority. This is an irreversible action. You can specify that program should be immutable on deployment by setting the -- final ﬂag when deploying the program. Close Program You can close your Solana program to reclaim the SOL allocated to the account. Closing a program is irreversible, so it should be done with caution. To close a program, use the program close subcommand. For example: solana program set-upgrade-authority <PROGRAM_ADDRESS> --new-upgrade-authority solana program set-upgrade-authority <PROGRAM_ADDRESS> --final solana program deploy ./target/deploy/your_program.so --final Terminal solana program close 4Ujf5fXfLx2PAwRqcECCLtgDxHKPznoJpa43jUBxFfMz 2/8/25, 6:03 PM Deploying Programs | Solana https://solana.com/docs/programs/deploying 4/10


---

### Page 5

Example output: Note that once a program is closed, its program ID cannot be reused. Attempting to deploy a program with a previously closed program ID will result in an error. If you need to redeploy a program after closing it, you must generate a new program ID. To generate a new keypair for the program, run the following command: Alternatively, you can delete the existing keypair ﬁle and run cargo build-sbf again, which will generate a new keypair ﬁle. Program Buffer Accounts Deploying a program requires multiple transactions due to the 1232 byte limit for transactions on Solana. An intermediate step of the deploy process involves writing the program's byte-code to temporary "buffer account". This buffer account is automatically closed after successful program deployment. However, if the deployment fails, the buffer account remains and you can either: --bypass-warning Closed Program Id 4Ujf5fXfLx2PAwRqcECCLtgDxHKPznoJpa43jUBxFfMz, 0.1350588 SOL reclaimed Error: Program 4Ujf5fXfLx2PAwRqcECCLtgDxHKPznoJpa43jUBxFfMz has been closed, u a new Program Id Terminal solana-keygen new -o ./target/deploy/your_program-keypair.json --force 2/8/25, 6:03 PM Deploying Programs | Solana https://solana.com/docs/programs/deploying 5/10


---

### Page 6

Continue the deployment using the existing buffer account Close the buffer account to reclaim the allocated SOL (rent) You can check if you have any open buffer accounts by using the program show subcommand as follows: Example output: You can continue to the deployment using the program deploy subcommand as follows: Expected output on successful deployment: To close buffer accounts, use the program close subcommand as follows: ELF Dump solana program show --buffers Buffer Address | Authority 5TRm1DxYcXLbSEbbxWcQbEUCce7L4tVgaC6e2V4G82pM | 4kh6HxYZiAebF8HWLsUWod2EaQQ6iWH solana program deploy --buffer 5TRm1DxYcXLbSEbbxWcQbEUCce7L4tVgaC6e2V4G82pM Program Id: 2w3sK6CW7Hy1Ljnz2uqPrQsg4KjNZxD4bDerXDkSX3Q1 Signature: 3fsttJFskUmvbdL5F9y8g43rgNea5tYZeVXbimfx2Up5viJnYehWe3yx45rQJc8Kjkr solana program close --buffers 2/8/25, 6:03 PM Deploying Programs | Solana https://solana.com/docs/programs/deploying 6/10


---

### Page 7

The SBF shared object internals can be dumped to a text ﬁle to gain more insight into a program's composition and what it may be doing at runtime. The dump will contain both the ELF information as well as a list of all the symbols and the instructions that implement them. Some of the BPF loader's error log messages will reference speciﬁc instruction numbers where the error occurred. These references can be looked up in the ELF dump to identify the offending instruction and its context. The ﬁle will be output to /target/deploy/your_program-dump.txt. Program Deployment Process Deploying a program on Solana requires multiple transactions, due to the max size limit of 1232 bytes for Solana transactions. The Solana CLI sends these transactions with the solana program deploy subcommand. The process can be broken down into the following 3 phases: 1. Buffer initialization: First, the CLI sends a transaction which creates a buffer account large enough for the byte-code being deployed. It also invokes the initialize buffer instruction to set the buffer authority to restrict writes to the deployer's chosen address. 2. Buffer writes: Once the buffer account is initialized, the CLI breaks up the program byte-code into ~1KB chunks and sends transactions at a rate of 100 transactions per second to write each chunk with the write buffer instruction. These transactions are sent directly to the current leader's transaction processing (TPU) port and are processed in parallel with each other. Once all transactions have been sent, the CLI polls the RPC API with batches of transaction signatures to ensure that every write was successful and conﬁrmed. 3. Finalization: Once writes are completed, the CLI sends a ﬁnal transaction to either deploy a new program or upgrade an existing program. In either case, the cargo build-bpf --dump 2/8/25, 6:03 PM Deploying Programs | Solana https://solana.com/docs/programs/deploying 7/10


---

### Page 8

byte-code written to the buffer account will be copied into a program data account and veriﬁed. Upgradeable BPF Loader Program The BPF loader program is the program that "owns" all executable accounts on Solana. When you deploy a program, the owner of the program account is set to the the BPF loader program. State accounts The Upgradeable BPF loader program supports three different types of state accounts: 1. Program account: This is the main account of an on-chain program and its address is commonly referred to as a "program id." Program id's are what transaction instructions reference in order to invoke a program. Program accounts are immutable once deployed, so you can think of them as a proxy account to the byte-code and state stored in other accounts. 2. Program data account: This account is what stores the executable byte-code of an on-chain program. When a program is upgraded, this account's data is updated with new byte-code. In addition to byte-code, program data accounts are also responsible for storing the slot when it was last modiﬁed and the address of the sole account authorized to modify the account (this address can be cleared to make a program immutable). 3. Buffer accounts: These accounts temporarily store byte-code while a program is being actively deployed through a series of transactions. They also each store the address of the sole account which is authorized to do writes. Instructions The state accounts listed above can only be modiﬁed with one of the following instructions supported by the Upgradeable BPF Loader program: 2/8/25, 6:03 PM Deploying Programs | Solana https://solana.com/docs/programs/deploying 8/10


---

### Page 9

1. Initialize buffer: Creates a buffer account and stores an authority address which is allowed to modify the buffer. 2. Write: Writes byte-code at a speciﬁed byte offset inside a buffer account. Writes are processed in small chunks due to a limitation of Solana transactions having a maximum serialized size of 1232 bytes. 3. Deploy: Creates both a program account and a program data account. It ﬁlls the program data account by copying the byte-code stored in a buffer account. If the byte-code is valid, the program account will be set as executable, allowing it to be invoked. If the byte-code is invalid, the instruction will fail and all changes are reverted. 4. Upgrade: Fills an existing program data account by copying executable byte- code from a buffer account. Similar to the deploy instruction, it will only succeed if the byte-code is valid. 5. Set authority: Updates the authority of a program data or buffer account if the account's current authority has signed the transaction being processed. If the authority is deleted without replacement, it can never be set to a new address and the account can never be closed. 6. Close: Clears the data of a program data account or buffer account and reclaims the SOL used for the rent exemption deposit. Last updated on 2/4/2025 Loading comments… 2/8/25, 6:03 PM Deploying Programs | Solana https://solana.com/docs/programs/deploying 9/10


---

### Page 10

Previous Program Structure Next Program Examples Managed by SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 6:03 PM Deploying Programs | Solana https://solana.com/docs/programs/deploying 10/10


---

# Program Derived Address _ Solana.pdf

### Page 1

Solana Documentation Getting Started Quick Start Program Derived Address In this section, we'll walk through how to build a basic CRUD (Create, Read, Update, Delete) program. We'll create a simple program where users can create, update, and delete a message. Each message will be stored in an account with a deterministic address derived from the program itself (Program Derived Address or PDA). The purpose of this section is to guide you through building and testing a Solana program using the Anchor framework while demonstrating how to use Program Derived Addresses (PDAs). For more details, refer to the Program Derived Addresses page. For reference, here is the ﬁnal code after completing both the PDA and CPI sections. Starter Code Begin by opening this Solana Playground link with the starter code. Then click the "Import" button, which will add the program to your list of projects on Solana Playground. 1 Documentation API Cookbook Courses Guides Get Support Table of Contents Starter Code 2/8/25, 5:59 PM Program Derived Address | Solana https://solana.com/docs/intro/quick-start/program-derived-address 1/13


---

### Page 2

Import In the lib.rs ﬁle, you'll ﬁnd a program scaffolded with the create, update, and delete instructions we'll implement in the following steps. lib.rs use anchor_lang::prelude::*; declare_id!("8KPzbM2Cwn4Yjak7QYAEH9wyoQh86NcBicaLuzPaejdw"); #[program] pub mod pda { use super::*; pub fn create(_ctx: Context<Create>) -> Result<()> { Ok(()) } pub fn update(_ctx: Context<Update>) -> Result<()> { Ok(()) } pub fn delete(_ctx: Context<Delete>) -> Result<()> { Ok(()) } } 2/8/25, 5:59 PM Program Derived Address | Solana https://solana.com/docs/intro/quick-start/program-derived-address 2/13


---

### Page 3

Before we begin, run build in the Playground terminal to check the starter program builds successfully. Deﬁne Message Account Type First, let's deﬁne the structure for the message account that our program will create. This is the data that we'll store in the account created by the program. In lib.rs, update the MessageAccount struct with the following: #[derive(Accounts)] pub struct Create {} #[derive(Accounts)] pub struct Update {} #[derive(Accounts)] pub struct Delete {} Terminal build Output 2 lib.rs #[account] pub struct MessageAccount { pub user: Pubkey, pub message: String, pub bump: u8, } Diff 2/8/25, 5:59 PM Program Derived Address | Solana https://solana.com/docs/intro/quick-start/program-derived-address 3/13


---

### Page 4

Build the program again by running build in the terminal. We've just deﬁned what data to store on the message account. Next, we'll implement the program instructions. Implement Create Instruction Now, let's implement the create instruction to create and initialize the MessageAccount. Start by deﬁning the accounts required for the instruction by updating the Create struct with the following: Explanation Terminal build 3 lib.rs #[derive(Accounts)] #[instruction(message: String)] pub struct Create<'info> { #[account(mut)] pub user: Signer<'info>, #[account( init, seeds = [b"message", user.key().as_ref()], bump, payer = user, space = 8 + 32 + 4 + message.len() + 1 )] pub message_account: Account<'info, MessageAccount>, pub system_program: Program<'info, System>, } 2/8/25, 5:59 PM Program Derived Address | Solana https://solana.com/docs/intro/quick-start/program-derived-address 4/13


---

### Page 5

Next, implement the business logic for the create instruction by updating the create function with the following: Rebuild the program. Implement Update Instruction Next, implement the update instruction to update the MessageAccount with a new message. Just as before, the ﬁrst step is to specify the accounts required by the update instruction. Diff Explanation lib.rs pub fn create(ctx: Context<Create>, message: String) -> Result<()> { msg!("Create Message: {}", message); let account_data = &mut ctx.accounts.message_account; account_data.user = ctx.accounts.user.key(); account_data.message = message; account_data.bump = ctx.bumps.message_account; Ok(()) } Diff Explanation Terminal build 4 2/8/25, 5:59 PM Program Derived Address | Solana https://solana.com/docs/intro/quick-start/program-derived-address 5/13


---

### Page 6

Update the Update struct with the following: Next, implement the logic for the update instruction. lib.rs #[derive(Accounts)] #[instruction(message: String)] pub struct Update<'info> { #[account(mut)] pub user: Signer<'info>, #[account( mut, seeds = [b"message", user.key().as_ref()], bump = message_account.bump, realloc = 8 + 32 + 4 + message.len() + 1, realloc::payer = user, realloc::zero = true, )] pub message_account: Account<'info, MessageAccount>, pub system_program: Program<'info, System>, } Diff Explanation lib.rs pub fn update(ctx: Context<Update>, message: String) -> Result<()> { msg!("Update Message: {}", message); let account_data = &mut ctx.accounts.message_account; account_data.message = message; Ok(()) } Diff 2/8/25, 5:59 PM Program Derived Address | Solana https://solana.com/docs/intro/quick-start/program-derived-address 6/13


---

### Page 7

Rebuild the program Implement Delete Instruction Next, implement the delete instruction to close the MessageAccount. Update the Delete struct with the following: Next, implement the logic for the delete instruction. Explanation Terminal build 5 lib.rs #[derive(Accounts)] pub struct Delete<'info> { #[account(mut)] pub user: Signer<'info>, #[account( mut, seeds = [b"message", user.key().as_ref()], bump = message_account.bump, close= user, )] pub message_account: Account<'info, MessageAccount>, } Diff Explanation 2/8/25, 5:59 PM Program Derived Address | Solana https://solana.com/docs/intro/quick-start/program-derived-address 7/13


---

### Page 8

Rebuild the program. Deploy Program The basic CRUD program is now complete. Deploy the program by running deploy in the Playground terminal. Ensure your Playground wallet has devnet SOL. Get devnet SOL from the Solana Faucet. Set Up Test File lib.rs pub fn delete(_ctx: Context<Delete>) -> Result<()> { msg!("Delete Message"); Ok(()) } Diff Explanation Terminal build 6 Terminal deploy Output 7 2/8/25, 5:59 PM Program Derived Address | Solana https://solana.com/docs/intro/quick-start/program-derived-address 8/13


---

### Page 9

Included with the starter code is also a test ﬁle in anchor.test.ts. Add the code below inside describe, but before the it sections. Run the test ﬁle by running test in the Playground terminal to check the ﬁle runs as expected. We will implement the tests in the following steps. anchor.test.ts import { PublicKey } from "@solana/web3.js"; describe("pda", () => { it("Create Message Account", async () => {}); it("Update Message Account", async () => {}); it("Delete Message Account", async () => {}); }); anchor.test.ts const program = pg.program; const wallet = pg.wallet; const [messagePda, messageBump] = PublicKey.findProgramAddressSync( [Buffer.from("message"), wallet.publicKey.toBuffer()], program.programId, ); Diff Explanation Terminal test 2/8/25, 5:59 PM Program Derived Address | Solana https://solana.com/docs/intro/quick-start/program-derived-address 9/13


---

### Page 10

Invoke Create Instruction Update the ﬁrst test with the following: Invoke Update Instruction Update the second test with the following: Output 8 anchor.test.ts it("Create Message Account", async () => { const message = "Hello, World!"; const transactionSignature = await program.methods .create(message) .accounts({ messageAccount: messagePda, }) .rpc({ commitment: "confirmed" }); const messageAccount = await program.account.messageAccount.fetch( messagePda, "confirmed", ); console.log(JSON.stringify(messageAccount, null, 2)); console.log( "Transaction Signature:", `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana` ); }); Diff Explanation 9 2/8/25, 5:59 PM Program Derived Address | Solana https://solana.com/docs/intro/quick-start/program-derived-address 10/13


---

### Page 11

Invoke Delete Instruction Update the third test with the following: anchor.test.ts it("Update Message Account", async () => { const message = "Hello, Solana!"; const transactionSignature = await program.methods .update(message) .accounts({ messageAccount: messagePda, }) .rpc({ commitment: "confirmed" }); const messageAccount = await program.account.messageAccount.fetch( messagePda, "confirmed", ); console.log(JSON.stringify(messageAccount, null, 2)); console.log( "Transaction Signature:", `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana` ); }); Diff Explanation 10 anchor.test.ts it("Delete Message Account", async () => { const transactionSignature = await program.methods .delete() .accounts({ messageAccount: messagePda, }) .rpc({ commitment: "confirmed" }); 2/8/25, 5:59 PM Program Derived Address | Solana https://solana.com/docs/intro/quick-start/program-derived-address 11/13


---

### Page 12

Last updated on 2/4/2025 Run Test Once the tests are set up, run the test ﬁle by running test in the Playground terminal. You can then inspect the SolanaFM links to view the transaction details. const messageAccount = await program.account.messageAccount.fetchNulla messagePda, "confirmed", ); console.log("Expect Null:", JSON.stringify(messageAccount, null, 2)); console.log( "Transaction Signature:", `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana` ); }); Diff Explanation 11 Terminal test Output 2/8/25, 5:59 PM Program Derived Address | Solana https://solana.com/docs/intro/quick-start/program-derived-address 12/13


---

### Page 13

Loading comments… Previous Deploying Programs Next Composing Multiple Programs Managed by SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 5:59 PM Program Derived Address | Solana https://solana.com/docs/intro/quick-start/program-derived-address 13/13


---

# How to create a Solana program (native or Anchor) _ Solana.pdf

### Page 1

Solana Documentation The Solana Toolkit Creating a Project Solana Program Scaffold “This is a beta version of the Solana Toolkit, and is still a WIP. Please post all feedback as a GitHub issue here.” create-solana-program initializes an in-depth workspace with everything you need for general Solana program development. This scaffold allows you to write either native rust programs or Anchor programs. Program Frameworks After running this command, you'll have the option to choose between Shank and Anchor for the program framework: Shank creates a vanilla Solana smart contract with Shank macros to generate IDLs. For more information on Shank, read its README. Anchor creates a smart contract using the Anchor framework, which abstracts away many complexities enabling fast program development. For more information pnpm create solana-program Documentation API Cookbook Courses Guides Get Support Table of Contents Program Frameworks 2/8/25, 6:01 PM How to create a Solana program (native or Anchor) | Solana https://solana.com/docs/toolkit/projects/solana-program 1/5


---

### Page 2

on the Anchor framework, read the Anchor book. Anchor framework For Anchor rust development, chose Anchor when asked which program framework to use. This will create a basic Anchor counter program with the following project structure for your program: Native rust For native rust development, make sure you chose Shank when asked which program framework to use. This will create a basic counter program with the following project structure for your program: Generated Clients ├── program.rs │ ├── src.rs │ │ ├── lib.rs │ ├── Cargo.toml │ ├── keypair.json │ ├── README.md ├── program.rs │ ├── src.rs │ │ ├── assertions.rs │ │ ├──entrypoint.rs │ │ ├──error.rs │ │ ├──instruction.rs │ │ ├──lib.rs │ │ ├──processor.rs │ │ ├──state.rs │ │ ├──utils.rs │ ├── Cargo.toml │ ├── keypair.json │ ├── README.md 2/8/25, 6:01 PM How to create a Solana program (native or Anchor) | Solana https://solana.com/docs/toolkit/projects/solana-program 2/5


---

### Page 3

Next, you'll have the option to choose between a JavaScript client, a Rust Client, or both. JavaScript Client creates a typescript library compatible with web3.js. Rust Client creates a rust crate allowing consumers to interact with the program. For further workspace customization and additional information, check out the create-solana-program README. Build After answering the above prompts, the workspace will be generated. To get started, build your program and clients by running: To update an existing Anchor project to have this scaffold, read this guide. Additional Resources Developing Rust Programs Program Examples Last updated on 2/4/2025 cd <my-program-name> npm install npm run generate 2/8/25, 6:01 PM How to create a Solana program (native or Anchor) | Solana https://solana.com/docs/toolkit/projects/solana-program 3/5


---

### Page 4

Loading comments… Previous Basic Anchor Next Web App Managed by SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN 2/8/25, 6:01 PM How to create a Solana program (native or Anchor) | Solana https://solana.com/docs/toolkit/projects/solana-program 4/5


---

### Page 5

© 2025 Solana Foundation. All rights reserved. 2/8/25, 6:01 PM How to create a Solana program (native or Anchor) | Solana https://solana.com/docs/toolkit/projects/solana-program 5/5


---

# Solana Account Model _ Solana.pdf

### Page 1

Solana Documentation Core Concepts Solana Account Model On Solana, all data is contained in what we call "accounts". You can think of data on Solana as a public database with a single "Accounts" table, where each entry in this table is an individual account with the same base Account type. Accounts Key Points Accounts can store up to 10MiB of data, which contain either executable program code or program state. Accounts require a rent deposit in lamports (SOL) that is proportional to the amount of data stored, which is fully refundable when the account is closed. Documentation API Cookbook Courses Guides Get Support Table of Contents Key Points 2/8/25, 5:38 PM Solana Account Model | Solana https://solana.com/docs/core/accounts 1/10


---

### Page 2

Every account has a program owner. Only the program that owns an account can modify its data or deduct its lamport balance. However, anyone can increase the balance. Programs (smart contracts) are stateless accounts that store executable code. Data accounts are created by programs to store and manage program state. Native programs are built-in programs included with the Solana runtime. Sysvar accounts are special accounts that store network cluster state. Account Every account on Solana is identiﬁable by a unique 32 byte address, which is generally displayed as a base58 encoded string (e.g 14grJpemFaf88c8tiVb77W7TYg2W3ir6pfkKz3YjhhZ5). The relationship between the account and its address can be thought of as a key- value pair, where the address serves as the key to locate the corresponding on-chain data of the account. Account Address “14grJpemFaf88c8tiVb77W7TYg2W3ir6pfkKz3YjhhZ5” Public Key: Account Address Most Solana accounts use an Ed25519 public key as their address. 2/8/25, 5:38 PM Solana Account Model | Solana https://solana.com/docs/core/accounts 2/10


---

### Page 3

While public keys are commonly used as account addresses, Solana also supports a feature called Program Derived Addresses (PDAs). PDAs are special addresses that are deterministically derived from a program ID and optional inputs (seeds). The details are covered on the Program Derived Address page. Account Type Accounts have a max size of 10MiB and every account on Solana has the same base Account type. Account Address Data: Bytes Account Executable: Boolean Lamports: Number Owner: Program Address Account Type Every Account on Solana has the following ﬁelds: data: A byte array that stores arbitrary data for an account. For non-executable accounts, this generally stores state that is meant to be read-only. For program accounts (smart contracts), this contains the executable program code. The data ﬁeld is commonly referred to as "account data". executable: A boolean ﬂag that indicates if the account is a program. lamports: The account's balance in lamports, the smallest unit of SOL (1 SOL = 1 billion lamports). owner: The program ID (public key) of the program that owns this account. Only the owner program can modify the account's data or deduct its lamports balance. 2/8/25, 5:38 PM Solana Account Model | Solana https://solana.com/docs/core/accounts 3/10


---

### Page 4

rent_epoch: A legacy ﬁeld from when Solana had a mechanism that periodically deducted lamports from accounts. While this ﬁeld still exists in the Account type, it is no longer used since rent collection was deprecated. Program Owner Program ownership is a key aspect of the Solana Account Model. Every account has a designated program as its owner. Only the owner program can: Modify the account's data ﬁeld Deduct lamports from the account's balance Any modiﬁcations to an account's data or lamport balance must be done through instructions explicitly deﬁned in the owner program's code. Rent To store data on-chain, accounts must also maintain a minimum lamport (SOL) balance that is proportional to amount of data stored on the account (in bytes). This minimum balance is called "rent", although it functions more like a deposit because Base Account Type pub struct Account { /// lamports in the account pub lamports: u64, /// data held in this account #[cfg_attr(feature = "serde", serde(with = "serde_bytes"))] pub data: Vec<u8>, /// the program that owns this account. If executable, the program that lo pub owner: Pubkey, /// this account's data contains a loaded program (and is now read-only) pub executable: bool, /// the epoch at which this account will next owe rent pub rent_epoch: Epoch, } 2/8/25, 5:38 PM Solana Account Model | Solana https://solana.com/docs/core/accounts 4/10


---

### Page 5

the full amount can be recovered when an account is closed. You can ﬁnd the calculation here using these constants. The term "rent" is due to a deprecated mechanism that regularly deducted lamports from accounts that fell below the rent threshold. This mechanism is no longer active. Native Programs The Solana validator implementation includes a list of special programs that provide various core functionalities for the network. These are sometimes referred to as "built-in" or "native" programs. You can ﬁnd the full list here. Among the native programs, two are particularly important for Solana development: 1. The System Program: Creates all new accounts on the network Allocates data space (bytes) for accounts Assigns account ownership to custom programs 2. The BPF Loader: The program owner for all deployed custom programs Handles program deployment and upgrades System Program By default, all new accounts are owned by the System Program. The System Program performs several key tasks: New Account Creation: Only the System Program can create new accounts. Space Allocation: Sets the byte capacity for the data ﬁeld of each account. 2/8/25, 5:38 PM Solana Account Model | Solana https://solana.com/docs/core/accounts 5/10


---

### Page 6

Assign Program Ownership: Once the System Program creates an account, it can reassign the designated program owner to a different program account. This is how custom programs take ownership of new accounts created by the System Program. All "wallet" accounts on Solana are simply accounts owned by the System Program. The lamport balance stored in these accounts represents the amount of SOL owned by the wallet. Only accounts owned by the System Program can be used as transaction fee payers. Address Address Account System Program Wallet Account Data: None Executable:False Lamports: 1,000,000 Owner:System Program owner System Account BPFLoader Program The BPF Loader is the program owner of all custom programs on the network, excluding other native programs. It is responsible for deploying, upgrading, and executing custom programs. Sysvar Accounts 2/8/25, 5:38 PM Solana Account Model | Solana https://solana.com/docs/core/accounts 6/10


---

### Page 7

Sysvar accounts are special accounts located at predeﬁned addresses that provide access to cluster state data. These accounts are dynamically updated with data about the network cluster. You can ﬁnd the full list of Sysvar Accounts here. Custom Programs On Solana, "smart contracts" are referred to as programs. Programs are accounts that contain executable code. You can identify program accounts by their "executable" ﬂag being set to true. Programs are deployed to the network and can be invoked by users and other programs to execute their instructions. Program Account When new programs are currently deployed on Solana, technically three separate accounts are created: Program Account: The main account representing an on-chain program. This account stores the address of an executable data account (which stores the compiled program code) and the update authority for the program (address authorized to make changes to the program). Program Executable Data Account: An account that contains the executable code for the program. Buffer Account: A temporary account created during program deployment or upgrades that stores the program's executable code. Upon successful deployment, the code is moved to the Program Executable Data Account and the buffer account is closed. For example, here are links to the Solana Explorer for the Token Extensions Program Account and its corresponding Program Executable Data Account. 2/8/25, 5:38 PM Solana Account Model | Solana https://solana.com/docs/core/accounts 7/10


---

### Page 8

Account Address Program Account Account Data: Executable:True Lamports: Number Owner:BPF Loader Account Address Program Executable Data Account Account Data: Executable: False Lamports: Number Owner:BPF Loader Program Code Account Data points to Program and Executable Data Accounts For simplicity, you can think of the Program Account as the program itself. When invoking a program's instructions, you specify the Program Account's address (commonly referred to as the "Program ID"). The details regarding the two separate accounts is primarily for understanding how programs are deployed and upgraded. AccountInfo Address Program Address Account Data: Executable:True Lamports: Number Owner:BPF Loader BPF Loader Program Code Account Dataowner Program Account Data Account Programs on Solana are "stateless", which means program accounts only store executable code and do not store data that's meant to be read from. To maintain state, programs deﬁne instructions to create separate accounts that are owned by the program. Each of these accounts has its own unique address and can store any arbitrary data deﬁned by the program. 2/8/25, 5:38 PM Solana Account Model | Solana https://solana.com/docs/core/accounts 8/10


---

### Page 9

Account Address Address Account Data: Executable: True Lamports: Number Owner: BPF Loader BPF Loader Program Code Account Data Account Dataowner Address Data Account Data: Executable:False Lamports: Number Owner:Program Account owner Program State Program Data Account Note that only the System Program can create new accounts. Once the System Program creates an account, it can then transfer ownership of the new account to another program. In other words, creating a data account for a custom program requires two steps: 1. Invoke the System Program to create an account, which then transfers ownership to the custom program 2. Invoke the custom program, which now owns the account, to then initialize the account data as deﬁned by the program's instruction This account creation process is often abstracted as a single step, but it's helpful to understand the underlying process. Last updated on 2/5/2025 2/8/25, 5:38 PM Solana Account Model | Solana https://solana.com/docs/core/accounts 9/10


---

### Page 10

Loading comments… Previous Core Concepts Next Transactions and Instructions Managed by SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 5:38 PM Solana Account Model | Solana https://solana.com/docs/core/accounts 10/10


---

# JavaScript Client for Solana _ Solana.pdf

### Page 1

Solana Documentation Solana Clients JavaScript Client for Solana What is Solana-Web3.js? The Solana-Web3.js library aims to provide complete coverage of Solana. The library was built on top of the Solana JSON RPC API. You can ﬁnd the full documentation for the @solana/web3.js library here. Common Terminology Term Deﬁnition Program Stateless executable code written to interpret instructions. Programs are capable of performing actions based on the instructions provided. Instruction The smallest unit of a program that a client can include in a transaction. Within its processing code, an instruction may contain one or more cross- program invocations. Transaction One or more instructions signed by the client using one or more Keypairs and executed atomically with only two possible outcomes: success or Documentation API Cookbook Courses Guides Get Support Table of Contents What is Solana-Web3.js? 2/8/25, 6:02 PM JavaScript Client for Solana | Solana https://solana.com/docs/clients/javascript 1/12


---

### Page 2

For the full list of terms, see Solana terminology Getting Started Installation yarn npm Bundle Usage Javascript Term Deﬁnition failure. yarn add @solana/web3.js@1 npm install --save @solana/web3.js@1 <!-- Development (un-minified) --> <script src="https://unpkg.com/@solana/web3.js@latest/lib/index.iife.js"></scr <!-- Production (minified) --> <script src="https://unpkg.com/@solana/web3.js@latest/lib/index.iife.min.js">< 2/8/25, 6:02 PM JavaScript Client for Solana | Solana https://solana.com/docs/clients/javascript 2/12


---

### Page 3

ES6 Browser Bundle Quickstart Connecting to a Wallet To allow users to use your dApp or application on Solana, they will need to get access to their Keypair. A Keypair is a private key with a matching public key, used to sign transactions. There are two ways to obtain a Keypair: 1. Generate a new Keypair 2. Obtain a Keypair using the secret key You can obtain a new Keypair with the following: const solanaWeb3 = require("@solana/web3.js"); console.log(solanaWeb3); import * as solanaWeb3 from "@solana/web3.js"; console.log(solanaWeb3); // solanaWeb3 is provided in the global namespace by the bundle script console.log(solanaWeb3); 2/8/25, 6:02 PM JavaScript Client for Solana | Solana https://solana.com/docs/clients/javascript 3/12


---

### Page 4

This will generate a brand new Keypair for a user to fund and use within your application. You can allow entry of the secretKey using a textbox, and obtain the Keypair with Keypair.fromSecretKey(secretKey). Many wallets today allow users to bring their Keypair using a variety of extensions or web wallets. The general recommendation is to use wallets, not Keypairs, to sign transactions. The wallet creates a layer of separation between the dApp and the Keypair, ensuring that the dApp never has access to the secret key. You can ﬁnd ways to connect to external wallets with the wallet-adapter library. Creating and Sending Transactions To interact with programs on Solana, you create, sign, and send transactions to the network. Transactions are collections of instructions with signatures. The order that instructions exist in a transaction determines the order they are executed. A transaction in Solana-Web3.js is created using the Transaction object and adding desired messages, addresses, or instructions. const { Keypair } = require("@solana/web3.js"); let keypair = Keypair.generate(); const { Keypair } = require("@solana/web3.js"); let secretKey = Uint8Array.from([ 202, 171, 192, 129, 150, 189, 204, 241, 142, 71, 205, 2, 81, 97, 2, 176, 48, 81, 45, 1, 96, 138, 220, 132, 231, 131, 120, 77, 66, 40, 97, 172, 91, 245, 8 221, 157, 190, 9, 145, 176, 130, 25, 43, 72, 107, 190, 229, 75, 88, 191, 136 7, 167, 109, 91, 170, 164, 186, 15, 142, 36, 12, 23, ]); let keypair = Keypair.fromSecretKey(secretKey); 2/8/25, 6:02 PM JavaScript Client for Solana | Solana https://solana.com/docs/clients/javascript 4/12


---

### Page 5

Take the example of a transfer transaction: The above code achieves creating a transaction ready to be signed and broadcasted to the network. The SystemProgram.transfer instruction was added to the transaction, containing the amount of lamports to send, and the to and from public keys. All that is left is to sign the transaction with keypair and send it over the network. You can accomplish sending a transaction by using sendAndConfirmTransaction if you wish to alert the user or do something after a transaction is ﬁnished, or use sendTransaction if you don't need to wait for the transaction to be conﬁrmed. const { Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL, } = require("@solana/web3.js"); let fromKeypair = Keypair.generate(); let toKeypair = Keypair.generate(); let transaction = new Transaction(); transaction.add( SystemProgram.transfer({ fromPubkey: fromKeypair.publicKey, toPubkey: toKeypair.publicKey, lamports: LAMPORTS_PER_SOL, }), ); 2/8/25, 6:02 PM JavaScript Client for Solana | Solana https://solana.com/docs/clients/javascript 5/12


---

### Page 6

The above code takes in a TransactionInstruction using SystemProgram, creates a Transaction, and sends it over the network. You use Connection in order to deﬁne which Solana network you are connecting to, namely mainnet-beta, testnet, or devnet. Interacting with Custom Programs The previous section visits sending basic transactions. In Solana everything you do interacts with different programs, including the previous section's transfer transaction. At the time of writing programs on Solana are either written in Rust or C. Let's look at the SystemProgram. The method signature for allocating space in your account on Solana in Rust looks like this: In Solana when you want to interact with a program you must ﬁrst know all the accounts you will be interacting with. You must always provide every account that the program will be interacting within the instruction. Not only that, but you must provide whether or not the account is isSigner or isWritable. const { sendAndConfirmTransaction, clusterApiUrl, Connection, } = require("@solana/web3.js"); let keypair = Keypair.generate(); let connection = new Connection(clusterApiUrl("testnet")); sendAndConfirmTransaction(connection, transaction, [keypair]); pub fn allocate( pubkey: &Pubkey, space: u64 ) -> Instruction 2/8/25, 6:02 PM JavaScript Client for Solana | Solana https://solana.com/docs/clients/javascript 6/12


---

### Page 7

In the allocate method above, a single account pubkey is required, as well as an amount of space for allocation. We know that the allocate method writes to the account by allocating space within it, making the pubkey required to be isWritable. isSigner is required when you are designating the account that is running the instruction. In this case, the signer is the account calling to allocate space within itself. Let's look at how to call this instruction using solana-web3.js: First, we set up the account Keypair and connection so that we have an account to make allocate on the testnet. We also create a payer Keypair and airdrop some SOL so we can pay for the allocate transaction. We create the transaction allocateTransaction, keys, and params objects. feePayer is an optional ﬁeld when creating a transaction that speciﬁes who is paying for the transaction, defaulting to the pubkey of the ﬁrst signer in the transaction. keys represents all accounts that the program's allocate function will interact with. Since the allocate function also required space, we created params to be used later when invoking the allocate function. let keypair = web3.Keypair.generate(); let payer = web3.Keypair.generate(); let connection = new web3.Connection(web3.clusterApiUrl("testnet")); let airdropSignature = await connection.requestAirdrop( payer.publicKey, web3.LAMPORTS_PER_SOL, ); await connection.confirmTransaction({ signature: airdropSignature }); let allocateTransaction = new web3.Transaction({ feePayer: payer.publicKey, }); let keys = [{ pubkey: keypair.publicKey, isSigner: true, isWritable: true }]; let params = { space: 100 }; 2/8/25, 6:02 PM JavaScript Client for Solana | Solana https://solana.com/docs/clients/javascript 7/12


---

### Page 8

The above is created using u32 and ns64 from @solana/buffer-layout to facilitate the payload creation. The allocate function takes in the parameter space. To interact with the function we must provide the data as a Buffer format. The buffer- layout library helps with allocating the buffer and encoding it correctly for Rust programs on Solana to interpret. Let's break down this struct. index is set to 8 because the function allocate is in the 8th position in the instruction enum for SystemProgram. let allocateStruct = { index: 8, layout: struct([u32("instruction"), ns64("space")]), }; { index: 8, /* <-- */ layout: struct([ u32('instruction'), ns64('space'), ]) } /* https://github.com/solana-labs/solana/blob/21bc43ed58c63c827ba4db30426965ef pub enum SystemInstruction { /** 0 **/CreateAccount {/**/}, /** 1 **/Assign {/**/}, /** 2 **/Transfer {/**/}, /** 3 **/CreateAccountWithSeed {/**/}, /** 4 **/AdvanceNonceAccount, /** 5 **/WithdrawNonceAccount(u64), /** 6 **/InitializeNonceAccount(Pubkey), /** 7 **/AuthorizeNonceAccount(Pubkey), /** 8 **/Allocate {/**/}, /** 9 **/AllocateWithSeed {/**/}, /** 10 **/AssignWithSeed {/**/}, /** 11 **/TransferWithSeed {/**/}, /** 12 **/UpgradeNonceAccount, 2/8/25, 6:02 PM JavaScript Client for Solana | Solana https://solana.com/docs/clients/javascript 8/12


---

### Page 9

Next up is u32('instruction'). The layout in the allocate struct must always have u32('instruction') ﬁrst when you are using it to call an instruction. ns64('space') is the argument for the allocate function. You can see in the original allocate function in Rust that space was of the type u64. u64 is an unsigned 64bit integer. Javascript by default only provides up to 53bit integers. ns64 comes from @solana/buffer-layout to help with type conversions between Rust and Javascript. You can ﬁnd more type conversions between Rust and Javascript at solana- labs/buffer-layout. } { index: 8, layout: struct([ u32('instruction'), /* <-- */ ns64('space'), ]) } { index: 8, layout: struct([ u32('instruction'), ns64('space'), /* <-- */ ]) } let data = Buffer.alloc(allocateStruct.layout.span); let layoutFields = Object.assign({ instruction: allocateStruct.index }, params allocateStruct.layout.encode(layoutFields, data); 2/8/25, 6:02 PM JavaScript Client for Solana | Solana https://solana.com/docs/clients/javascript 9/12


---

### Page 10

Using the previously created bufferLayout, we can allocate a data buffer. We then assign our params { space: 100 } so that it maps correctly to the layout, and encode it to the data buffer. Now the data is ready to be sent to the program. Finally, we add the transaction instruction with all the account keys, payer, data, and programId and broadcast the transaction to the network. The full code can be found below. allocateTransaction.add( new web3.TransactionInstruction({ keys, programId: web3.SystemProgram.programId, data, }), ); await web3.sendAndConfirmTransaction(connection, allocateTransaction, [ payer, keypair, ]); const { struct, u32, ns64 } = require("@solana/buffer-layout"); const { Buffer } = require("buffer"); const web3 = require("@solana/web3.js"); let keypair = web3.Keypair.generate(); let payer = web3.Keypair.generate(); let connection = new web3.Connection(web3.clusterApiUrl("testnet")); let airdropSignature = await connection.requestAirdrop( payer.publicKey, web3.LAMPORTS_PER_SOL, ); await connection.confirmTransaction({ signature: airdropSignature }); let allocateTransaction = new web3.Transaction({ feePayer: payer.publicKey, }); let keys = [{ pubkey: keypair.publicKey, isSigner: true, isWritable: true }]; 2/8/25, 6:02 PM JavaScript Client for Solana | Solana https://solana.com/docs/clients/javascript 10/12


---

### Page 11

Last updated on 2/4/2025 Loading comments… Previous Rust Next Rust Programs Managed by SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN let params = { space: 100 }; let allocateStruct = { index: 8, layout: struct([u32("instruction"), ns64("space")]), }; let data = Buffer.alloc(allocateStruct.layout.span); let layoutFields = Object.assign({ instruction: allocateStruct.index }, params 2/8/25, 6:02 PM JavaScript Client for Solana | Solana https://solana.com/docs/clients/javascript 11/12


---

### Page 12

© 2025 Solana Foundation. All rights reserved. 2/8/25, 6:02 PM JavaScript Client for Solana | Solana https://solana.com/docs/clients/javascript 12/12


---

# Limitations _ Solana.pdf

### Page 1

Solana Documentation Developing Programs Limitations Developing programs on the Solana blockchain have some inherent limitation associated with them. Below is a list of common limitation that you may run into. Rust libraries Since Rust based onchain programs must run be deterministic while running in a resource-constrained, single-threaded environment, they have some limitations on various libraries. On-chain Rust programs support most of Rust's libstd, libcore, and liballoc, as well as many 3rd party crates. There are some limitations since these programs run in a resource-constrained, single-threaded environment, as well as being deterministic: No access to rand std::fs std::net std::future Documentation API Cookbook Courses Guides Get Support Table of Contents Rust libraries 2/8/25, 6:03 PM Limitations | Solana https://solana.com/docs/programs/limitations 1/5


---

### Page 2

std::process std::sync std::task std::thread std::time Limited access to: std::hash std::os Bincode is extremely computationally expensive in both cycles and call depth and should be avoided String formatting should be avoided since it is also computationally expensive. No support for println!, print!, use the msg! macro instead. The runtime enforces a limit on the number of instructions a program can execute during the processing of one instruction. See computation budget for more information. Compute budget To prevent abuse of the blockchain's computational resources, each transaction is allocated a compute budget. Exceeding this compute budget will result in the transaction failing. See the computational constraints documentation for more speciﬁc details. Call stack depth - CallDepthExceeded error Solana programs are constrained to run quickly, and to facilitate this, the program's call stack is limited to a max depth of 64 frames. 2/8/25, 6:03 PM Limitations | Solana https://solana.com/docs/programs/limitations 2/5


---

### Page 3

When a program exceeds the allowed call stack depth limit, it will receive the CallDepthExceeded error. CPI call depth - CallDepth error Cross-program invocations allow programs to invoke other programs directly, but the depth is constrained currently to 4. When a program exceeds the allowed cross-program invocation call depth, it will receive a CallDepth error Float Rust types support Programs support a limited subset of Rust's ﬂoat operations. If a program attempts to use a ﬂoat operation that is not supported, the runtime will report an unresolved symbol error. Float operations are performed via software libraries, speciﬁcally LLVM's ﬂoat built- ins. Due to the software emulated, they consume more compute units than integer operations. In general, ﬁxed point operations are recommended where possible. The Solana Program Library math tests will report the performance of some math operations. To run the test, sync the repo and run: Recent results show the ﬂoat operations take more instructions compared to integers equivalents. Fixed point implementations may vary but will also be less than the ﬂoat equivalents: cargo test-sbf -- --nocapture --test-threads=1 u64 f32 2/8/25, 6:03 PM Limitations | Solana https://solana.com/docs/programs/limitations 3/5


---

### Page 4

Static writable data Program shared objects do not support writable shared data. Programs are shared between multiple parallel executions using the same shared read-only code and data. This means that developers should not include any static writable or global variables in programs. In the future a copy-on-write mechanism could be added to support writable data. Signed division The SBF instruction set does not support signed division. Last updated on 2/4/2025 Loading comments… Previous Program Examples Next FAQ Multiply 8 176 Divide 9 219 2/8/25, 6:03 PM Limitations | Solana https://solana.com/docs/programs/limitations 4/5


---

### Page 5

Managed by SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 6:03 PM Limitations | Solana https://solana.com/docs/programs/limitations 5/5


---

# How to set up the Solana Toolkit and install the Solana CLI _ Solana.pdf

### Page 1

Solana Documentation The Solana Toolkit Getting Started with the Solana Toolkit “This is a beta version of the Solana Toolkit, and is still a WIP. Please post all feedback as a GitHub issue here.” The Solana Program development toolkit is published as the mucho npm package. The mucho command will be used to run most of the Solana program development tools within the toolkit - mucho tools, one cli. Installation To get started, install The Solana Toolkit: This will install the latest versions of the following: Solana CLI / Agave Tool Suite: A command line tool that allows developers to interact with the Solana blockchain, manage accounts, send transactions, and deploy programs. npx -y mucho@latest install mucho --version Documentation API Cookbook Courses Guides Get Support Table of Contents Installation 2/8/25, 6:01 PM How to set up the Solana Toolkit and install the Solana CLI | Solana https://solana.com/docs/toolkit/getting-started 1/5


---

### Page 2

Mucho CLI - a superset of popular developer tools within the Solana ecosystem used to simplify the development and testing of Solana blockchain programs. Rust: The programming language that Solana Smart Contracts are written in. Anchor: A framework for writing Solana programs that abstracts many complexities to speed up smart contract development. Fuzz Tester: Rust-based fuzzing framework for Solana programs to help you ship secure code. Code Coverage Tool: A code coverage CLI tool for Solana programs. After installation, all mucho commands can be run as follows: Generate a keypair For a fresh installation of the Solana CLI, you're required to generate a new keypair. This will store the your new keypair at the Solana CLI's default path (~/.config/solana/id.json) and print the pubkey that was generated. Get your keypair's public key Fund your keypair mucho --help solana-keygen new solana address 2/8/25, 6:01 PM How to set up the Solana Toolkit and install the Solana CLI | Solana https://solana.com/docs/toolkit/getting-started 2/5


---

### Page 3

Set your network configuration Check your current conﬁg: To use this toolkit, update your conﬁg to connect to localhost: To test locally, you must also spin up a local node to run on your localhost: For a more information, read the Local Testing Guide. Next Steps Now let's Create a Solana Project! Last updated on 2/4/2025 solana airdrop 10 --url localhost solana config get solana config set --url localhost mucho validator 2/8/25, 6:01 PM How to set up the Solana Toolkit and install the Solana CLI | Solana https://solana.com/docs/toolkit/getting-started 3/5


---

### Page 4

0 reactions 0 comments Previous The Solana Toolkit Next Overview Managed by SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN 2/8/25, 6:01 PM How to set up the Solana Toolkit and install the Solana CLI | Solana https://solana.com/docs/toolkit/getting-started 4/5


---

### Page 5

© 2025 Solana Foundation. All rights reserved. 2/8/25, 6:01 PM How to set up the Solana Toolkit and install the Solana CLI | Solana https://solana.com/docs/toolkit/getting-started 5/5


---

# How to troubleshoot Solana programs _ Solana.pdf

### Page 1

Solana Documentation The Solana Toolkit Troubleshooting Solana Programs When diagnosing problems with Solana development, you can easily gather loads of troubleshooting information with the following command: Solana Stack Exchange The Solana stack exchange is the best place for conversations around Solana development. If you ever get stuck, ask your question here. Last updated on 2/4/2025 npx mucho info Documentation API Cookbook Courses Guides Get Support Table of Contents Solana Stack Exchange 2/8/25, 6:02 PM How to troubleshoot Solana programs | Solana https://solana.com/docs/toolkit/troubleshooting 1/3


---

### Page 2

0 reactions 0 comments Write Preview Sign in to comment Sign in with GitHub Previous Rust Tests Next Rust Managed by SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN 2/8/25, 6:02 PM How to troubleshoot Solana programs | Solana https://solana.com/docs/toolkit/troubleshooting 2/3


---

### Page 3

© 2025 Solana Foundation. All rights reserved. 2/8/25, 6:02 PM How to troubleshoot Solana programs | Solana https://solana.com/docs/toolkit/troubleshooting 3/3


---

# Stake Programming _ Solana.pdf

### Page 1

Solana Documentation Economics Staking Stake Programming To maximize stake distribution, decentralization, and censorship resistance on the Solana network, staking can be performed programmatically. The team and community have developed several on-chain and offchain programs to make stakes easier to manage. Stake-o-matic aka Auto-delegation Bots This offchain program manages a large population of validators staked by a central authority. The Solana Foundation uses an auto-delegation bot to regularly delegate its stake to "non-delinquent" validators that meet speciﬁed performance requirements. Stake Pools This on-chain program pools together SOL to be staked by a manager, allowing SOL holders to stake and earn rewards without managing stakes. Users deposit SOL in exchange for SPL tokens (staking derivatives) that represent their ownership in the stake pool. The pool manager stakes deposited SOL according to their strategy, perhaps using a variant of an auto-delegation bot as described above. As stakes earn rewards, the pool and pool tokens grow proportionally in value. Finally, pool token holders can send SPL tokens back to the stake pool to redeem SOL, thereby Documentation API Cookbook Courses Guides Get Support Table of Contents Stake-o-matic aka Auto-delegation Bots 2/8/25, 5:44 PM Stake Programming | Solana https://solana.com/docs/economics/staking/stake-programming 1/3


---

### Page 2

participating in decentralization with much less work required. More information can be found at the SPL stake pool documentation. Last updated on 2/4/2025 0 reactions 0 comments Previous Stake Accounts Next Solana RPC Methods Managed by SOLANA Grants Break Solana Media Kit Careers GET CONNECTED Blog Newsletter 2/8/25, 5:44 PM Stake Programming | Solana https://solana.com/docs/economics/staking/stake-programming 2/3


---

### Page 3

Disclaimer Privacy Policy EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 5:44 PM Stake Programming | Solana https://solana.com/docs/economics/staking/stake-programming 3/3


---

# Actions and Blinks _ Solana.pdf

### Page 1

Solana Documentation Advanced Topics Actions and Blinks Solana Actions are speciﬁcation-compliant APIs that return transactions on the Solana blockchain to be previewed, signed, and sent across a number of various contexts, including QR codes, buttons + widgets, and websites across the internet. Actions make it simple for developers to integrate the things you can do throughout the Solana ecosystem right into your environment, allowing you to perform blockchain transactions without needing to navigate away to a different app or webpage. Blockchain links – or blinks – turn any Solana Action into a shareable, metadata-rich link. Blinks allow Action-aware clients (browser extension wallets, bots) to display additional capabilities for the user. On a website, a blink might immediately trigger a transaction preview in a wallet without going to a decentralized app; in Discord, a bot might expand the blink into an interactive set of buttons. This pushes the ability to interact on-chain to any web surface capable of displaying a URL. Get Started To quickly get started with creating custom Solana Actions: npm install @solana/actions Documentation API Cookbook Courses Guides Get Support Table of Contents Get Started 2/8/25, 5:43 PM Actions and Blinks | Solana https://solana.com/docs/advanced/actions 1/33


---

### Page 2

install the Solana Actions SDK in your application build an API endpoint for the GET request that returns the metadata about your Action create an API endpoint that accepts the POST request and returns the signable transaction for the user “Checkout this video tutorial on how to build a Solana Action using the @solana/actions SDK. You can also ﬁnd the source code for an Action that performs a native SOL transfer here and several other example Actions in this repo.” When deploying your custom Solana Actions to production: ensure your application has a valid actions.json ﬁle at the root of your domain ensure your application responds with the required Cross-Origin headers on all Action endpoints, including the actions.json ﬁle test and debug your blinks/actions using the Blinks Inspector If you are looking for inspiration around building Actions and blinks, checkout the Awesome Blinks repository for some community creations and even ideas for new ones. Actions The Solana Actions speciﬁcation uses a set of standard APIs to deliver signable transactions (and eventually signable messages) from an application directly to a user. They are hosted at publicly accessible URLs and are therefore accessible by their URL for any client to interact with. “You can think of Actions as an API endpoint that will return metadata and something for a user to sign (either a transaction or an authentication message) with their blockchain wallet.” 2/8/25, 5:43 PM Actions and Blinks | Solana https://solana.com/docs/advanced/actions 2/33


---

### Page 3

The Actions API consists of making simple GET and POST requests to an Action's URL endpoint and handling the responses that conform to the Actions interface. 1. the GET request returns metadata that provides human-readable information to the client about what actions are available at this URL, and an optional list of related actions. 2. the POST request returns a signable transaction or message that the client then prompts the user's wallet to sign and execute on the blockchain or in another offchain service. Action Execution and Lifecycle In practice, interacting with Actions closely resembles interacting with a typical REST API: a client makes the initial GET request to an Action URL in order to fetch metadata about the Actions available the endpoint returns a response that include metadata about the endpoint (like the application's title and icon) and a listing of the available actions for this endpoint the client application (like a mobile wallet, chat bot, or website) displays a UI for the user to perform one of the actions after the user selects an action (by clicking a button), the client makes a POST request to the endpoint in order to get the transaction for the user to sign the wallet facilitates the user signing the transaction and ultimately sends the transaction to the blockchain for conﬁrmation 2/8/25, 5:43 PM Actions and Blinks | Solana https://solana.com/docs/advanced/actions 3/33


---

### Page 4

Solana Actions Execution and Lifecycle When receiving transactions from an Actions URL, clients should handle submission of these transactions to the blockchain and manage their state lifecycle. Actions also support some level of invalidation before execution. The GET and POST request may return some metadata that states whether the action is capable of be taken (like with the disabled ﬁeld). For example, if there was an Action endpoint that facilitates voting on a DAO governance proposal whose voting window has closed, the initial GET request may return the error message "This proposal is no longer up for a vote" and the "Vote Yes" and "Vote No" buttons as "disabled". Blinks Blinks (blockchain links) are client applications that introspect Action APIs and construct user interfaces around interacting with and executing Actions. Client applications that support blinks simply detect Action-compatible URLs, parse them, and allow users to interact with them in standardized user interfaces. 2/8/25, 5:43 PM Actions and Blinks | Solana https://solana.com/docs/advanced/actions 4/33


---

### Page 5

“Any client application that fully introspects an Actions API to build a complete interface for it is a blink. Therefore, not all clients that consume Actions APIs are blinks.” Blink URL Speciﬁcation A blink URL describes a client application that enables a user to complete the full lifecycle of executing an Action, including signing with their wallet. For any client application to become a blink: The blink URL must contain a query parameter of action whose value is a URL- encoded Action URL. This value must be URL-encoded to not conﬂict with any other protocol parameters. The client application must URL-decode the action query parameter and introspect the Action API link provided (see Action URL scheme). The client must render a rich user interface that enables a user to complete the full lifecycle of executing an Action, including signing with their wallet. “Not all blink client applications (e.g. websites or dApps) will support all Actions. Application developers may choose which Actions they want to support within their blink interfaces.” The following example demonstrates a valid blink URL with an action value of solana-action:https://actions.alice.com/donate that is URL encoded: https://example.domain/?action=<action_url> https://example.domain/?action=solana-action%3Ahttps%3A%2F%2Factions.alice.com 2/8/25, 5:43 PM Actions and Blinks | Solana https://solana.com/docs/advanced/actions 5/33


---

### Page 6

Detecting Actions via Blinks Blinks may be linked to Actions in at least 3 ways: 1. Sharing an explicit Action URL: solana- action:https://actions.alice.com/donate In this case, only supported clients may render the blink. There will be no fallback link preview, or site that may be visited outside of the non-supporting client. 2. Sharing a link to a website that is linked to an Actions API via an actions.json ﬁle on the website's domain root. For example, https://alice.com/actions.json maps https://alice.com/donate, a website URL at which users can donate to Alice, to API URL https://actions.alice.com/donate, at which Actions for donating to Alice are hosted. 3. Embedding an Action URL in an “interstitial” site URL that understands how to parse Actions. Clients that support blinks should be able to take any of the above formats and correctly render an interface to facilitate executing the action directly in the client. For clients that do not support blinks, there should be an underlying website (making the browser become the universal fallback). If a user taps anywhere on a client that is not an action button or text input ﬁeld, they should be taken to the underlying site. Blink Testing and Veriﬁcation https://example.domain/?action=<action_url> 2/8/25, 5:43 PM Actions and Blinks | Solana https://solana.com/docs/advanced/actions 6/33


---

### Page 7

While Solana Actions and blinks are a permissionless protocol/speciﬁcation, client applications and wallets are still required to ultimately facilitate users to sign the transaction. “Use the Blinks Inspector tool to inspect, debug, and test your blinks and actions directly in your browser. You can view the GET and POST response payloads, response headers, and test all inputs to each of your linked Actions.” Each client application or wallets may have different requirements on which Action endpoints their clients will automatically unfurl and immediately display to their users on social media platforms. For example, some clients may operate on an "allow list" approach that may require veriﬁcation prior to their client unfurling an Action for users such as Dialect's Actions Registry (detailed below). All blinks will still render and allow for signing on Dialect's dial.to blinks Interstitial site, with their registry status displayed in the blink. Dialect's Actions Registry As a public good for the Solana ecosystem, Dialect maintains a public registry — together with the help of Solana Foundation and other community members — of blockchain links that have are from pre-veriﬁed from known sources. As of launch, only Actions that have been registered in the Dialect registry will unfurl in the Twitter feed when posted. Client applications and wallets can freely choose to use this public registry or another solution to help ensure user security and safety. If not veriﬁed through the Dialect registry, the blockchain link will not be touched by the blink client, and will be rendered as a typical URL. Developers can apply to be veriﬁed by Dialect here: dial.to/register 2/8/25, 5:43 PM Actions and Blinks | Solana https://solana.com/docs/advanced/actions 7/33


---

### Page 8

Specification The Solana Actions speciﬁcation consists of key sections that are part of a request/response interaction ﬂow: Solana Action URL scheme providing an Action URL OPTIONS response to an Action URL to pass CORS requirements GET request to an Action URL GET response from the server POST request to an Action URL POST response from the server Each of these requests are made by the Action client (e.g. wallet app, browser extension, dApp, website, etc) to gather speciﬁc metadata for rich user interfaces and to facilitate user input to the Actions API. Each of the responses are crafted by an application (e.g. website, server backend, etc) and returned to the Action client. Ultimately, providing a signable transaction or message for a wallet to prompt the user to approve, sign, and send to the blockchain. “The types and interfaces declared within this readme ﬁles are often the simpliﬁed version of the types to aid in readability. For better type safety and improved developer experience, the @solana/actions- spec package contains more complex type deﬁnitions. You can ﬁnd the source code for them here.” URL Scheme A Solana Action URL describes an interactive request for a signable Solana transaction or message using the solana-action protocol. The request is interactive because the parameters in the URL are used by a client to make a series of standardized HTTP requests to compose a signable transaction or 2/8/25, 5:43 PM Actions and Blinks | Solana https://solana.com/docs/advanced/actions 8/33


---

### Page 9

message for the user to sign with their wallet. A single link ﬁeld is required as the pathname. The value must be a conditionally URL-encoded absolute HTTPS URL. If the URL contains query parameters, it must be URL-encoded. URL-encoding the value prevents conﬂicting with any Actions protocol parameters, which may be added via the protocol speciﬁcation. If the URL does not contain query parameters, it should not be URL-encoded. This produces a shorter URL and a less dense QR code. In either case, clients must URL-decode the value. This has no effect if the value isn't URL-encoded. If the decoded value is not an absolute HTTPS URL, the wallet must reject it as malformed. OPTIONS response In order to allow Cross-Origin Resource Sharing (CORS) within Actions clients (including blinks), all Action endpoints should respond to HTTP requests for the OPTIONS method with valid headers that will allow clients to pass CORS checks for all subsequent requests from their same origin domain. An Actions client may perform "preﬂight" requests to the Action URL endpoint in order check if the subsequent GET request to the Action URL will pass all CORS checks. These CORS preﬂight checks are made using the OPTIONS HTTP method and should respond with all required HTTP headers that will allow Action clients (like blinks) to properly make all subsequent requests from their origin domain. At a minimum, the required HTTP headers include: Access-Control-Allow-Origin with a value of * solana-action:<link> 2/8/25, 5:43 PM Actions and Blinks | Solana https://solana.com/docs/advanced/actions 9/33


---

### Page 10

this ensures all Action clients can safely pass CORS checks in order to make all required requests Access-Control-Allow-Methods with a value of GET,POST,PUT,OPTIONS ensures all required HTTP request methods are supported for Actions Access-Control-Allow-Headers with a minimum value of Content-Type, Authorization, Content-Encoding, Accept-Encoding For simplicity, developers should consider returning the same response and headers to OPTIONS requests as their GET response. Cross-Origin headers for actions.json The actions.json ﬁle response must also return valid Cross-Origin headers for GET and OPTIONS requests, speciﬁcally the Access-Control-Allow-Origin header value of *. See actions.json below for more details. GET Request The Action client (e.g. wallet, browser extension, etc) should make an HTTP GET JSON request to the Action's URL endpoint. The request should not identify the wallet or the user. The client should make the request with an Accept-Encoding header. The client should display the domain of the URL as the request is being made. GET Response The Action's URL endpoint (e.g. application or server backend) should respond with an HTTP OK JSON response (with a valid payload in the body) or an appropriate HTTP error. The client must handle HTTP client errors, server errors, and redirect responses. 2/8/25, 5:43 PM Actions and Blinks | Solana https://solana.com/docs/advanced/actions 10/33


---

### Page 11

The endpoint should respond with a Content-Encoding header for HTTP compression. The endpoint should respond with a Content-Type header of application/json. The client should not cache the response except as instructed by HTTP caching response headers. The client should display the title and render the icon image to user. Error responses (i.e. HTTP 4xx and 5xx status codes) should return a JSON response body following ActionError to present a helpful error message to users. See Action Errors. GET Response Body A GET response with an HTTP OK JSON response should include a body payload that follows the interface speciﬁcation: ActionGetResponse export type ActionType = "action" | "completed"; export type ActionGetResponse = Action<"action">; export interface Action<T extends ActionType> { /** type of Action to present to the user */ type: T; /** image url that represents the source of the action request */ icon: string; /** describes the source of the action request */ title: string; /** brief summary of the action to be performed */ description: string; /** button text rendered to the user */ label: string; /** UI state for the button being rendered to the user */ disabled?: boolean; links?: { /** list of related Actions a user could perform */ actions: LinkedAction[]; 2/8/25, 5:43 PM Actions and Blinks | Solana https://solana.com/docs/advanced/actions 11/33


---

### Page 12

type - The type of action being given to the user. Defaults to action. The initial ActionGetResponse is required to have a type of action. action - Standard action that will allow the user to interact with any of the LinkedActions completed - Used to declare the "completed" state within action chaining. icon - The value must be an absolute HTTP or HTTPS URL of an icon image. The ﬁle must be an SVG, PNG, or WebP image, or the client/wallet must reject it as malformed. title - The value must be a UTF-8 string that represents the source of the action request. For example, this might be the name of a brand, store, application, or person making the request. description - The value must be a UTF-8 string that provides information on the action. The description should be displayed to the user. label - The value must be a UTF-8 string that will be rendered on a button for the user to click. All labels should not exceed 5 word phrases and should start with a verb to solidify the action you want the user to take. For example, "Mint NFT", "Vote Yes", or "Stake 1 SOL". disabled - The value must be boolean to represent the disabled state of the rendered button (which displays the label string). If no value is provided, disabled should default to false (i.e. enabled by default). For example, if the action endpoint is for a governance vote that has closed, set disabled=true and the label could be "Vote Closed". error - An optional error indication for non-fatal errors. If present, the client should display it to the user. If set, it should not prevent the client from interpreting the }; /** non-fatal error message to be displayed to the user */ error?: ActionError; } 2/8/25, 5:43 PM Actions and Blinks | Solana https://solana.com/docs/advanced/actions 12/33


---

### Page 13

action or displaying it to the user (see Action Errors). For example, the error can be used together with disabled to display a reason like business constraints, authorization, the state, or an error of external resource. links.actions - An optional array of related actions for the endpoint. Users should be displayed UI for each of the listed actions and expected to only perform one. For example, a governance vote action endpoint may return three options for the user: "Vote Yes", "Vote No", and "Abstain from Vote". If no links.actions is provided, the client should render a single button using the root label string and make the POST request to the same action URL endpoint as the initial GET request. If any links.actions are provided, the client should only render buttons and input ﬁelds based on the items listed in the links.actions ﬁeld. The client should not render a button for the contents of the root label. The ActionParameter allows declaring what input the Action API is requesting from the user: LinkedAction export interface LinkedAction { /** URL endpoint for an action */ href: string; /** button text rendered to the user */ label: string; /** * Parameters to accept user input within an action * @see {ActionParameter} * @see {ActionParameterSelectable} */ parameters?: Array<TypedActionParameter>; } ActionParameter /** 2/8/25, 5:43 PM Actions and Blinks | Solana https://solana.com/docs/advanced/actions 13/33


---

### Page 14

The pattern should be a string equivalent of a valid regular expression. This regular expression pattern should by used by blink-clients to validate user input before making the POST request. If the pattern is not a valid regular expression, it should be ignored by clients. The patternDescription is a human readable description of the expected input requests from the user. If pattern is provided, the patternDescription is required to be provided. The min and max values allows the input to set a lower and/or upper bounds of the input requested from the user (i.e. min/max number and or min/max character length), and should be used for client side validation. For input types of date or datetime-local, these values should be a string dates. For other string based input types, the values should be numbers representing their min/max character length. If the user input value is not considered valid per the pattern, the user should receive a client side error message indicating the input ﬁeld is not valid and displayed the patternDescription string. * Parameter to accept user input within an action * note: for ease of reading, this is a simplified type of the actual */ export interface ActionParameter { /** input field type */ type?: ActionParameterType; /** parameter name in url */ name: string; /** placeholder text for the user input field */ label?: string; /** declare if this field is required (defaults to `false`) */ required?: boolean; /** regular expression pattern to validate user input client side */ pattern?: string; /** human-readable description of the `type` and/or `pattern`, represents a patternDescription?: string; /** the minimum value allowed based on the `type` */ min?: string | number; /** the maximum value allowed based on the `type` */ max?: string | number; } 2/8/25, 5:43 PM Actions and Blinks | Solana https://solana.com/docs/advanced/actions 14/33


---

### Page 15

The type ﬁeld allows the Action API to declare more speciﬁc user input ﬁelds, providing better client side validation and improving the user experience. In many cases, this type will resemble the standard HTML input element. The ActionParameterType can be simpliﬁed to the following type: Each of the type values should normally result in a user input ﬁeld that resembles a standard HTML input element of the corresponding type (i.e. <input type="email" />) to provide better client side validation and user experience: text - equivalent of HTML “text” input element email - equivalent of HTML “email” input element url - equivalent of HTML “url” input element number - equivalent of HTML “number” input element date - equivalent of HTML “date” input element datetime-local - equivalent of HTML “datetime-local” input element checkbox - equivalent to a grouping of standard HTML “checkbox” input elements. The Action API should return options as detailed below. The user should be able ActionParameterType /** * Input field type to present to the user * @default `text` */ export type ActionParameterType = | "text" | "email" | "url" | "number" | "date" | "datetime-local" | "checkbox" | "radio" | "textarea" | "select"; 2/8/25, 5:43 PM Actions and Blinks | Solana https://solana.com/docs/advanced/actions 15/33


---

### Page 16

to select multiple of the provided checkbox options. radio - equivalent to a grouping of standard HTML “radio” input elements. The Action API should return options as detailed below. The user should be able to select only one of the provided radio options. Other HTML input type equivalents not speciﬁed above ( hidden, button, submit, file, etc) are not supported at this time. In addition to the elements resembling HTML input types above, the following user input elements are also supported: textarea - equivalent of HTML textarea element. Allowing the user to provide multi-line input. select - equivalent of HTML select element, allowing the user to experience a “dropdown” style ﬁeld. The Action API should return options as detailed below. When type is set as select, checkbox, or radio then the Action API should include an array of options that each provide a label and value at a minimum. Each option may also have a selected value to inform the blink-client which of the options should be selected by default for the user (see checkbox and radio for differences). This ActionParameterSelectable can be simpliﬁed to the following type deﬁnition: ActionParameterSelectable /** * note: for ease of reading, this is a simplified type of the actual */ interface ActionParameterSelectable extends ActionParameter { options: Array<{ /** displayed UI label of this selectable option */ label: string; /** value of this selectable option */ value: string; /** whether or not this option should be selected by default */ selected?: boolean; }>; } 2/8/25, 5:43 PM Actions and Blinks | Solana https://solana.com/docs/advanced/actions 16/33


---

### Page 17

If no type is set or an unknown/unsupported value is set, blink-clients should default to text and render a simple text input. The Action API is still responsible to validate and sanitize all data from the user input parameters, enforcing any “required” user input as necessary. For platforms other that HTML/web based ones (like native mobile), the equivalent native user input component should be used to achieve the equivalent experience and client side validation as the HTML/web input types described above. Example GET Response The following example response provides a single "root" action that is expected to be presented to the user a single button with a label of "Claim Access Token": The following example response provides 3 related action links that allow the user to click one of 3 buttons to cast their vote for a DAO proposal: { "title": "HackerHouse Events", "icon": "<url-to-image>", "description": "Claim your Hackerhouse access token.", "label": "Claim Access Token" // button text } { "title": "Realms DAO Platform", "icon": "<url-to-image>", "description": "Vote on DAO governance proposals #1234.", "label": "Vote", "links": { "actions": [ { "label": "Vote Yes", // button text "href": "/api/proposal/1234/vote?choice=yes" }, { "label": "Vote No", // button text "href": "/api/proposal/1234/vote?choice=no" 2/8/25, 5:43 PM Actions and Blinks | Solana https://solana.com/docs/advanced/actions 17/33


---

### Page 18

Example GET Response with Parameters The following examples response demonstrate how to accept text input from the user (via parameters) and include that input in the ﬁnal POST request endpoint (via the href ﬁeld within a LinkedAction): The following example response provides the user with 3 linked actions to stake SOL: a button labeled "Stake 1 SOL", another button labeled "Stake 5 SOL", and a text input ﬁeld that allows the user to enter a speciﬁc "amount" value that will be sent to the Action API: }, { "label": "Abstain from Vote", // button text "href": "/api/proposal/1234/vote?choice=abstain" } ] } } { "title": "Stake-o-matic", "icon": "<url-to-image>", "description": "Stake SOL to help secure the Solana network.", "label": "Stake SOL", // not displayed since `links.actions` are provided "links": { "actions": [ { "label": "Stake 1 SOL", // button text "href": "/api/stake?amount=1" // no `parameters` therefore not a text input field }, { "label": "Stake 5 SOL", // button text "href": "/api/stake?amount=5" // no `parameters` therefore not a text input field }, { "label": "Stake", // button text "href": "/api/stake?amount={amount}", "parameters": [ { 2/8/25, 5:43 PM Actions and Blinks | Solana https://solana.com/docs/advanced/actions 18/33


---

### Page 19

The following example response provides a single input ﬁeld for the user to enter an amount which is sent with the POST request (either as a query parameter or a subpath can be used): POST Request The client must make an HTTP POST JSON request to the action URL with a body payload of: "name": "amount", // field name "label": "SOL amount" // text input placeholder } ] } ] } { "icon": "<url-to-image>", "label": "Donate SOL", "title": "Donate to GoodCause Charity", "description": "Help support this charity by donating SOL.", "links": { "actions": [ { "label": "Donate", // button text "href": "/api/donate/{amount}", // or /api/donate?amount={amount} "parameters": [ // {amount} input field { "name": "amount", // input field name "label": "SOL amount" // text input placeholder } ] } ] } } 2/8/25, 5:43 PM Actions and Blinks | Solana https://solana.com/docs/advanced/actions 19/33


---

### Page 20

account - The value must be the base58-encoded public key of an account that may sign the transaction. The client should make the request with an Accept-Encoding header and the application may respond with a Content-Encoding header for HTTP compression. The client should display the domain of the action URL as the request is being made. If a GET request was made, the client should also display the title and render the icon image from that GET response. POST Response The Action's POST endpoint should respond with an HTTP OK JSON response (with a valid payload in the body) or an appropriate HTTP error. The client must handle HTTP client errors, server errors, and redirect responses. The endpoint should respond with a Content-Type header of application/json. Error responses (i.e. HTTP 4xx and 5xx status codes) should return a JSON response body following ActionError to present a helpful error message to users. See Action Errors. POST Response Body A POST response with an HTTP OK JSON response should include a body payload of: { "account": "<account>" } ActionPostResponse /** * Response body payload returned from the Action POST Request 2/8/25, 5:43 PM Actions and Blinks | Solana https://solana.com/docs/advanced/actions 20/33


---

### Page 21

transaction - The value must be a base64-encoded serialized transaction. The client must base64-decode the transaction and deserialize it. message - The value must be a UTF-8 string that describes the nature of the transaction included in the response. The client should display this value to the user. For example, this might be the name of an item being purchased, a discount applied to a purchase, or a thank you note. links.next - An optional value use to "chain" multiple Actions together in series. After the included transaction has been conﬁrmed on-chain, the client can fetch and render the next action. See Action Chaining for more details. The client and application should allow additional ﬁelds in the request body and response body, which may be added by future speciﬁcation updates. “The application may respond with a partially or fully signed transaction. The client and wallet must validate the transaction as untrusted.” POST Response - Transaction If the transaction signatures are empty or the transaction has NOT been partially signed: */ export interface ActionPostResponse<T extends ActionType = ActionType> { /** base64 encoded serialized transaction */ transaction: string; /** describes the nature of the transaction */ message?: string; links?: { /** * The next action in a successive chain of actions to be obtained after * the previous was successful. */ next: NextActionLink; }; } 2/8/25, 5:43 PM Actions and Blinks | Solana https://solana.com/docs/advanced/actions 21/33


---

### Page 22

The client must ignore the feePayer in the transaction and set the feePayer to the account in the request. The client must ignore the recentBlockhash in the transaction and set the recentBlockhash to the latest blockhash. The client must serialize and deserialize the transaction before signing it. This ensures consistent ordering of the account keys, as a workaround for this issue. If the transaction has been partially signed: The client must NOT alter the feePayer or recentBlockhash as this would invalidate any existing signatures. The client must verify existing signatures, and if any are invalid, the client must reject the transaction as malformed. The client must only sign the transaction with the account in the request, and must do so only if a signature for the account in the request is expected. If any signature except a signature for the account in the request is expected, the client must reject the transaction as malicious. Action Errors Actions APIs should return errors using ActionError in order to present helpful error messages to the user. Depending on the context, this error could be fatal or non- fatal. ActionError export interface ActionError { /** simple error message to be displayed to the user */ message: string; } 2/8/25, 5:43 PM Actions and Blinks | Solana https://solana.com/docs/advanced/actions 22/33


---

### Page 23

When an Actions API responds with an HTTP error status code (i.e. 4xx and 5xx), the response body should be a JSON payload following ActionError. The error is considered fatal and the included message should be presented to the user. For API responses that support the optional error attribute (like ActionGetResponse), the error is considered non-fatal and the included message should be presented to the user. Action Chaining Solana Actions can be "chained" together in a successive series. After an Action's transaction is conﬁrmed on-chain, the next action can be obtained and presented to the user. Action chaining allows developers to build more complex and dynamic experiences within blinks, including: providing multiple transactions (and eventually sign message) to a user customized action metadata based on the user's wallet address refreshing the blink metadata after a successful transaction receive an API callback with the transaction signature for additional validation and logic on the Action API server customized "success" messages by updating the displayed metadata (e.g. a new image and description) To chain multiple actions together, in any ActionPostResponse include a links.next of either: PostNextActionLink - POST request link with a same origin callback url to receive the signature and user's account in the body. This callback url should respond with a NextAction. InlineNextActionLink - Inline metadata for the next action to be presented to the user immediately after the transaction has conﬁrmed. No callback will be made. 2/8/25, 5:43 PM Actions and Blinks | Solana https://solana.com/docs/advanced/actions 23/33


---

### Page 24

NextAction After the ActionPostResponse included transaction is signed by the user and conﬁrmed on-chain, the blink client should either: execute the callback request to fetch and display the NextAction, or if a NextAction is already provided via links.next, the blink client should update the displayed metadata and make no callback request If the callback url is not the same origin as the initial POST request, no callback request should be made. Blink clients should display an error notifying the user. export type NextActionLink = PostNextActionLink | InlineNextActionLink; /** @see {NextActionPostRequest} */ export interface PostNextActionLink { /** Indicates the type of the link. */ type: "post"; /** Relative or same origin URL to which the POST request should be made. */ href: string; } /** * Represents an inline next action embedded within the current context. */ export interface InlineNextActionLink { /** Indicates the type of the link. */ type: "inline"; /** The next action to be performed */ action: NextAction; } NextAction /** The next action to be performed */ export type NextAction = Action<"action"> | CompletedAction; /** The completed action, used to declare the "completed" state within action export type CompletedAction = Omit<Action<"completed">, "links">; 2/8/25, 5:43 PM Actions and Blinks | Solana https://solana.com/docs/advanced/actions 24/33


---

### Page 25

Based on the type, the next action should be presented to the user via blink clients in one of the following ways: action - (default) A standard action that will allow the user to see the included Action metadata, interact with the provided LinkedActions, and continue to chain any following actions. completed - The terminal state of an action chain that can update the blink UI with the included Action metadata, but will not allow the user to execute further actions. If links.next is not provided, blink clients should assume the current action is ﬁnal action in the chain, presenting their "completed" UI state after the transaction is conﬁrmed. actions.json The purpose of the actions.json ﬁle allows an application to instruct clients on what website URLs support Solana Actions and provide a mapping that can be used to perform GET requests to an Actions API server. Cross-Origin headers are required The actions.json ﬁle response must also return valid Cross-Origin headers for GET and OPTIONS requests, speciﬁcally the Access-Control-Allow-Origin header value of *. See OPTIONS response above for more details. The actions.json ﬁle should be stored and universally accessible at the root of the domain. For example, if your web application is deployed to my-site.com then the actions.json ﬁle should be accessible at https://my-site.com/actions.json. This ﬁle should also be Cross-Origin accessible via any browser by having a Access- Control-Allow-Origin header value of *. 2/8/25, 5:43 PM Actions and Blinks | Solana https://solana.com/docs/advanced/actions 25/33


---

### Page 26

Rules The rules ﬁeld allows the application to map a set of a website's relative route paths to a set of other paths. Type: Array of ActionRuleObject. pathPattern - A pattern that matches each incoming pathname. apiPath - A location destination deﬁned as an absolute pathname or external URL. Rules - pathPattern A pattern that matches each incoming pathname. It can be an absolute or relative path and supports the following formats: Exact Match: Matches the exact URL path. Example: /exact-path Example: https://website.com/exact-path Wildcard Match: Uses wildcards to match any sequence of characters in the URL path. This can match single (using *) or multiple segments (using **). (see Path Matching below). Example: /trade/* will match /trade/123 and /trade/abc, capturing only the ﬁrst segment after /trade/. ActionRuleObject interface ActionRuleObject { /** relative (preferred) or absolute path to perform the rule mapping from * pathPattern: string; /** relative (preferred) or absolute path that supports Action requests */ apiPath: string; } 2/8/25, 5:43 PM Actions and Blinks | Solana https://solana.com/docs/advanced/actions 26/33


---

### Page 27

Example: /category/*/item/** will match /category/123/item/456 and /category/abc/item/def. Example: /api/actions/trade/*/confirm will match /api/actions/trade/123/confirm. Rules - apiPath The destination path for the action request. It can be deﬁned as an absolute pathname or an external URL. Example: /api/exact-path Example: https://api.example.com/v1/donate/* Example: /api/category/*/item/* Example: /api/swap/** Rules - Query Parameters Query parameters from the original URL are always preserved and appended to the mapped URL. Rules - Path Matching The following table outlines the syntax for path matching patterns: Operator Matches * A single path segment, not including the surrounding path separator / characters. ** Matches zero or more characters, including any path separator / characters between multiple path segments. If other operators are included, the ** operator must be the last operator. ? Unsupported pattern. 2/8/25, 5:43 PM Actions and Blinks | Solana https://solana.com/docs/advanced/actions 27/33


---

### Page 28

Rules Examples The following example demonstrates an exact match rule to map requests to /buy from your site's root to the exact path /api/buy relative to your site's root: The following example uses wildcard path matching to map requests to any path (excluding subdirectories) under /actions/ from your site's root to a corresponding path under /api/actions/ relative to your site's root: The following example uses wildcard path matching to map requests to any path (excluding subdirectories) under /donate/ from your site's root to a corresponding absolute path https://api.dialect.com/api/v1/donate/ on an external site: actions.json { "rules": [ { "pathPattern": "/buy", "apiPath": "/api/buy" } ] } actions.json { "rules": [ { "pathPattern": "/actions/*", "apiPath": "/api/actions/*" } ] } actions.json 2/8/25, 5:43 PM Actions and Blinks | Solana https://solana.com/docs/advanced/actions 28/33


---

### Page 29

The following example uses wildcard path matching for an idempotent rule to map requests to any path (including subdirectories) under /api/actions/ from your site's root to itself: “Idempotent rules allow blink clients to more easily determine if a given path supports Action API requests without having to be preﬁxed with the solana- action: URI or performing additional response testing.” Action Identity Action endpoints may include an Action Identity in the transactions that are returned in their POST response for the user to sign. This allows indexers and analytics platforms to easily and veriﬁably attribute on-chain activity to a speciﬁc Action Provider (i.e. service) in a veriﬁable way. { "rules": [ { "pathPattern": "/donate/*", "apiPath": "https://api.dialect.com/api/v1/donate/*" } ] } actions.json { "rules": [ { "pathPattern": "/api/actions/**", "apiPath": "/api/actions/**" } ] } 2/8/25, 5:43 PM Actions and Blinks | Solana https://solana.com/docs/advanced/actions 29/33


---

### Page 30

The Action Identity is a keypair used to sign a specially formatted message that is included in transaction using a Memo instruction. This Identiﬁer Message can be veriﬁably attributed to a speciﬁc Action Identity, and therefore attribute transactions to a speciﬁc Action Provider. The keypair is not required to sign the transaction itself. This allows wallets and applications to improve transaction deliverability when no other signatures are on the transaction returned to a user (see POST response transaction). If an Action Provider's use case requires their backend services to pre-sign the transaction before the user does, they should use this keypair as their Action Identity. This will allow one less account be included in the transaction, lowering the total transactions size by 32-bytes. Action Identiﬁer Message The Action Identiﬁer Message is a colon separate UTF-8 string included in a transaction using a single SPL Memo instruction. protocol - The value of the protocol being used (set to solana-action per the URL Scheme above) identity - The value must be the base58-encoded public key address of the Action Identity keypair reference - The value must be base58-encoded 32-byte array. This may or may not be public keys, on or off the curve, and may or may not correspond with accounts on Solana. signature - base58-encoded signature created from the Action Identity keypair signing only the reference value. The reference value must be used only once and in a single transaction. For the purpose of associating transactions with an Action Provider, only the ﬁrst usage of protocol:identity:reference:signature 2/8/25, 5:43 PM Actions and Blinks | Solana https://solana.com/docs/advanced/actions 30/33


---

### Page 31

the reference value is considered valid. Transactions may have multiple Memo instructions. When performing a getSignaturesForAddress, the results memo ﬁeld will return each memo instruction's message as a single string with each separated by a semi-colon. No other data should be included with Identiﬁer Message's Memo instruction. The identity and the reference should be included as read-only, non-signer keys in the transaction on an instruction that is NOT the Identiﬁer Message Memo instruction. The Identiﬁer Message Memo instruction must have zero accounts provided. If any accounts are provided, the Memo program requires theses accounts to be valid signers. For the purposes of identifying actions, this restricts ﬂexibility and can degrade the user experience. Therefore it is considered an anti-pattern and must be avoided. Action Identity Veriﬁcation Any transaction that includes the identity account can be veriﬁably associated with the Action Provider in a multi-step process: 1. Get all the transactions for a given identity. 2. Parse and verify each transaction's memo string, ensuring the signature is valid for the reference stored. 3. Verify the speciﬁc transaction is the ﬁrst on-chain occurrence of the reference on-chain: If this transaction is the ﬁrst occurrence, the transaction is considered veriﬁed and can be safely attributed to the Action Provider. If this transaction is NOT the ﬁrst occurrence, it is considered invalid and therefore not attributed to the Action Provider. 2/8/25, 5:43 PM Actions and Blinks | Solana https://solana.com/docs/advanced/actions 31/33


---

### Page 32

Because Solana validators index transactions by the account keys, the getSignaturesForAddress RPC method can be used locate all transactions including the identity account. This RPC method's response includes all the Memo data in the memo ﬁeld. If multiple Memo instructions were used in the transaction, each memo message will be included in this memo ﬁeld and must be parsed accordingly by the veriﬁer to obtain the Identity Veriﬁcation Message. These transactions should be initially considered UNVERIFIED. This is due to the identity not being required to sign the transaction which allows any transaction to include this account as a non-signer. Potentially artiﬁcially inﬂating attribution and usage counts. The Identity Veriﬁcation Message should be checked to ensure the signature was created by the identity signing the reference. If this signature veriﬁcation fails, the transaction is invalid and should be attributed to the Action Provider. If the signature veriﬁcation is successful, the veriﬁer should ensure this transaction is the ﬁrst on-chain occurrence of the reference. If it is not, the transaction is considered invalid. Last updated on 2/5/2025 Managed by SOLANA Grants Break Solana Media Kit Careers GET CONNECTED Blog Newsletter 2/8/25, 5:43 PM Actions and Blinks | Solana https://solana.com/docs/advanced/actions 32/33


---

### Page 33

Previous State Compression Next Economics Disclaimer Privacy Policy EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 5:43 PM Actions and Blinks | Solana https://solana.com/docs/advanced/actions 33/33


---

# Terminology _ Solana.pdf

### Page 1

Solana Documentation Terminology The following terms are used throughout the Solana documentation and development ecosystem. account A record in the Solana ledger that either holds data or is an executable program. Like an account at a traditional bank, a Solana account may hold funds called lamports. Like a ﬁle in Linux, it is addressable by a key, often referred to as a public key or pubkey. The key may be one of: an ed25519 public key a program-derived account address (32byte value forced off the ed25519 curve) a hash of an ed25519 public key with a 32 character string account owner Documentation API Cookbook Courses Guides Get Support Table of Contents genesis conﬁg 2/8/25, 6:03 PM Terminology | Solana https://solana.com/docs/terminology 1/20


---

### Page 2

The address of the program that owns the account. Only the owning program is capable of modifying the account. See also authority. app A front-end application that interacts with a Solana cluster. authority The address of a user that has some kind of permission over an account. For example: The ability to mint new tokens is given to the account that is the 'mint authority' for the token mint. The ability to upgrade a program is given to the account that is the 'upgrade authority' of a program. bank state The result of interpreting all programs on the ledger at a given tick height. It includes at least the set of all accounts holding nonzero native tokens. block A contiguous set of entries on the ledger covered by a vote. A leader produces at most one block per slot. 2/8/25, 6:03 PM Terminology | Solana https://solana.com/docs/terminology 2/20


---

### Page 3

blockhash A unique value (hash) that identiﬁes a record (block). Solana computes a blockhash from the last entry id of the block. block height The number of blocks beneath the current block. The ﬁrst block after the genesis block has height one. bootstrap validator The validator that produces the genesis (ﬁrst) block of a block chain. BPF loader The Solana program that owns and loads BPF onchain programs, allowing the program to interface with the runtime. client A computer program that accesses the Solana server network cluster. commitment A measure of the network conﬁrmation for the block. 2/8/25, 6:03 PM Terminology | Solana https://solana.com/docs/terminology 3/20


---

### Page 4

cluster A set of validators maintaining a single ledger. compute budget The maximum number of compute units consumed per transaction. compute units The smallest unit of measure for consumption of computational resources of the blockchain. confirmation time The wallclock duration between a leader creating a tick entry and creating a conﬁrmed block. confirmed block A block that has received a super majority of ledger votes. control plane A gossip network connecting all nodes of a cluster. cooldown period 2/8/25, 6:03 PM Terminology | Solana https://solana.com/docs/terminology 4/20


---

### Page 5

Some number of epochs after stake has been deactivated while it progressively becomes available for withdrawal. During this period, the stake is considered to be "deactivating". More info about: warmup and cooldown credit See vote credit. cross-program invocation (CPI) A call from one onchain program to another. For more information, see calling between programs. data plane A multicast network used to efficiently validate entries and gain consensus. drone An offchain service that acts as a custodian for a user's private key. It typically serves to validate and sign transactions. entry An entry on the ledger either a tick or a transaction's entry. entry id 2/8/25, 6:03 PM Terminology | Solana https://solana.com/docs/terminology 5/20


---

### Page 6

A preimage resistant hash over the ﬁnal contents of an entry, which acts as the entry's globally unique identiﬁer. The hash serves as evidence of: The entry being generated after a duration of time The speciﬁed transactions are those included in the entry The entry's position with respect to other entries in ledger See proof of history. epoch The time, i.e. number of slots, for which a leader schedule is valid. fee account The fee account in the transaction is the account that pays for the cost of including the transaction in the ledger. This is the ﬁrst account in the transaction. This account must be declared as Read-Write (writable) in the transaction since paying for the transaction reduces the account balance. finality When nodes representing 2/3rd of the stake have a common root. fork A ledger derived from common entries but then diverged. 2/8/25, 6:03 PM Terminology | Solana https://solana.com/docs/terminology 6/20


---

### Page 7

genesis block The ﬁrst block in the chain. genesis config The conﬁguration ﬁle that prepares the ledger for the genesis block. hash A digital ﬁngerprint of a sequence of bytes. inflation An increase in token supply over time used to fund rewards for validation and to fund continued development of Solana. inner instruction See cross-program invocation. instruction A call to invoke a speciﬁc instruction handler in a program. An instruction also speciﬁes which accounts it wants to read or modify, and additional data that serves as auxiliary input to the instruction handler. A client must include at least one instruction in a transaction, and all instructions must complete for the transaction to be considered successful. 2/8/25, 6:03 PM Terminology | Solana https://solana.com/docs/terminology 7/20


---

### Page 8

instruction handler Instruction handlers are program functions that process instructions from transactions. An instruction handler may contain one or more cross-program invocations. keypair A public key and corresponding private key for accessing an account. lamport A fractional native token with the value of 0.000000001 sol. “Within the compute budget, a quantity of micro-lamports is used in the calculation of prioritization fees.” leader The role of a validator when it is appending entries to the ledger. leader schedule A sequence of validator public keys mapped to slots. The cluster uses the leader schedule to determine which validator is the leader at any moment in time. ledger 2/8/25, 6:03 PM Terminology | Solana https://solana.com/docs/terminology 8/20


---

### Page 9

A list of entries containing transactions signed by clients. Conceptually, this can be traced back to the genesis block, but an actual validator's ledger may have only newer blocks to reduce storage, as older ones are not needed for validation of future blocks by design. ledger vote A hash of the validator's state at a given tick height. It comprises a validator's affirmation that a block it has received has been veriﬁed, as well as a promise not to vote for a conﬂicting block (i.e. fork) for a speciﬁc amount of time, the lockout period. light client A type of client that can verify it's pointing to a valid cluster. It performs more ledger veriﬁcation than a thin client and less than a validator. loader A program with the ability to interpret the binary encoding of other onchain programs. lockout The duration of time for which a validator is unable to vote on another fork. message The structured contents of a transaction. Generally containing a header, array of account addresses, recent blockhash, and an array of instructions. 2/8/25, 6:03 PM Terminology | Solana https://solana.com/docs/terminology 9/20


---

### Page 10

Learn more about the message formatting inside of transactions here. Nakamoto coefficient A measure of decentralization, the Nakamoto Coefficient is the smallest number of independent entities that can act collectively to shut down a blockchain. The term was coined by Balaji S. Srinivasan and Leland Lee in Quantifying Decentralization. native token The token used to track work done by nodes in a cluster. node A computer participating in a cluster. node count The number of validators participating in a cluster. onchain program The executable code on Solana blockchain that interprets the instructions sent inside of each transaction to read and modify accounts over which it has control. These programs are often referred to as "smart contracts" on other blockchains. PoH 2/8/25, 6:03 PM Terminology | Solana https://solana.com/docs/terminology 10/20


---

### Page 11

See Proof of History. point A weighted credit in a rewards regime. In the validator rewards regime, the number of points owed to a stake during redemption is the product of the vote credits earned and the number of lamports staked. private key The private key of a keypair. program See onchain program. program derived account (PDA) An account whose signing authority is a program and thus is not controlled by a private key like other accounts. program id The public key of the account containing a program. proof of history (PoH) 2/8/25, 6:03 PM Terminology | Solana https://solana.com/docs/terminology 11/20


---

### Page 12

A stack of proofs, each of which proves that some data existed before the proof was created and that a precise duration of time passed before the previous proof. Like a VDF, a Proof of History can be veriﬁed in less time than it took to produce. prioritization fee An additional fee user can specify in the compute budget instruction to prioritize their transactions. The prioritization fee is calculated by multiplying the requested maximum compute units by the compute-unit price (speciﬁed in increments of 0.000001 lamports per compute unit) rounded up to the nearest lamport. Transactions should request the minimum amount of compute units required for execution to minimize fees. public key (pubkey) The public key of a keypair. rent Fee paid by Accounts and Programs to store data on the blockchain. When accounts do not have enough balance to pay rent, they may be Garbage Collected. See also rent exempt below. Learn more about rent here: What is rent?. rent exempt 2/8/25, 6:03 PM Terminology | Solana https://solana.com/docs/terminology 12/20


---

### Page 13

Accounts that maintain a minimum lamport balance that is proportional to the amount of data stored on the account. All newly created accounts are stored on- chain permanently until the account is closed. It is not possible to create an account that falls below the rent exemption threshold. root A block or slot that has reached maximum lockout on a validator. The root is the highest block that is an ancestor of all active forks on a validator. All ancestor blocks of a root are also transitively a root. Blocks that are not an ancestor and not a descendant of the root are excluded from consideration for consensus and can be discarded. runtime The component of a validator responsible for program execution. Sealevel Solana's parallel run-time for onchain programs. shred A fraction of a block; the smallest unit sent between validators. signature A 64-byte ed25519 signature of R (32-bytes) and S (32-bytes). With the requirement that R is a packed Edwards point not of small order and S is a scalar in the range of 0 2/8/25, 6:03 PM Terminology | Solana https://solana.com/docs/terminology 13/20


---

### Page 14

<= S < L. This requirement ensures no signature malleability. Each transaction must have at least one signature for fee account. Thus, the ﬁrst signature in transaction can be treated as transaction id skip rate The percentage of skipped slots out of the total leader slots in the current epoch. This metric can be misleading as it has high variance after the epoch boundary when the sample size is small, as well as for validators with a low number of leader slots, however can also be useful in identifying node misconﬁgurations at times. skipped slot A past slot that did not produce a block, because the leader was offline or the fork containing the slot was abandoned for a better alternative by cluster consensus. A skipped slot will not appear as an ancestor for blocks at subsequent slots, nor increment the block height, nor expire the oldest recent_blockhash. Whether a slot has been skipped can only be determined when it becomes older than the latest rooted (thus not-skipped) slot. slot The period of time for which each leader ingests transactions and produces a block. Collectively, slots create a logical clock. Slots are ordered sequentially and non- overlapping, comprising roughly equal real-world time as per PoH. smart contract 2/8/25, 6:03 PM Terminology | Solana https://solana.com/docs/terminology 14/20


---

### Page 15

See onchain program. SOL The native token of a Solana cluster. Solana Program Library (SPL) A library of programs on Solana such as spl-token that facilitates tasks such as creating and using tokens. stake Tokens forfeit to the cluster if malicious validator behavior can be proven. stake-weighted quality of service (SWQoS) SWQoS allows preferential treatment for transactions that come from staked validators. supermajority 2/3 of a cluster. sysvar A system account. Sysvars provide cluster state information such as current tick height, rewards points values, etc. Programs can access Sysvars via a Sysvar 2/8/25, 6:03 PM Terminology | Solana https://solana.com/docs/terminology 15/20


---

### Page 16

account (pubkey) or by querying via a syscall. thin client A type of client that trusts it is communicating with a valid cluster. tick A ledger entry that estimates wallclock duration. tick height The Nth tick in the ledger. token A digitally transferable asset. Token Extensions Program The Token Extensions Program has the program ID TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb and includes all the same features as the Token Program, but comes with extensions such as conﬁdential transfers, custom transfer logic, extended metadata, and much more. token mint 2/8/25, 6:03 PM Terminology | Solana https://solana.com/docs/terminology 16/20


---

### Page 17

An account that can produce (or 'mint') tokens. Different tokens are distinguished by their unique token mint addresses. Token Program The Token Program has the program ID TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA, and provides the basic capabilities of transferring, freezing, and minting tokens. tps Transactions per second. tpu Transaction processing unit. transaction One or more instructions signed by a client using one or more keypairs and executed atomically with only two possible outcomes: success or failure. transaction id The ﬁrst signature in a transaction, which can be used to uniquely identify the transaction across the complete ledger. 2/8/25, 6:03 PM Terminology | Solana https://solana.com/docs/terminology 17/20


---

### Page 18

transaction confirmations The number of conﬁrmed blocks since the transaction was accepted onto the ledger. A transaction is ﬁnalized when its block becomes a root. transactions entry A set of transactions that may be executed in parallel. tvu Transaction validation unit. validator A full participant in a Solana network cluster that produces new blocks. A validator validates the transactions added to the ledger VDF See veriﬁable delay function. verifiable delay function (VDF) A function that takes a ﬁxed amount of time to execute that produces a proof that it ran, which can then be veriﬁed in less time than it took to produce. 2/8/25, 6:03 PM Terminology | Solana https://solana.com/docs/terminology 18/20


---

### Page 19

vote See ledger vote. vote credit A reward tally for validators. A vote credit is awarded to a validator in its vote account when the validator reaches a root. wallet A collection of keypairs that allows users to manage their funds. warmup period Some number of epochs after stake has been delegated while it progressively becomes effective. During this period, the stake is considered to be "activating". More info about: warmup and cooldown Last updated on 2/4/2025 Loading comments… Previous Managed by 2/8/25, 6:03 PM Terminology | Solana https://solana.com/docs/terminology 19/20


---

### Page 20

getStakeActivation SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 6:03 PM Terminology | Solana https://solana.com/docs/terminology 20/20


---

# Fees on Solana _ Solana.pdf

### Page 1

Solana Documentation Core Concepts Fees on Solana The Solana blockchain has a few different types of fees and costs that are incurred to use the permissionless network. These can be segmented into a few speciﬁc types: Transaction Fees - A fee to have validators process transactions/instructions Prioritization Fees - An optional fee to boost transactions processing order Rent - A withheld balance to keep data stored on-chain Transaction Fees The small fee paid to process logic (instruction) within an on-chain program on the Solana blockchain is known as a "transaction fee". As each transaction (which contains one or more instructions) is sent through the network, it gets processed by the current validator leader. Once conﬁrmed as a global state transaction, this transaction fee is paid to the network to help support the economic design of the Solana blockchain. “Transaction fees are different from account data storage deposit fee of rent. While transaction fees are paid to process instructions on the Solana network, a Documentation API Cookbook Courses Guides Get Support Table of Contents Transaction Fees 2/8/25, 5:38 PM Fees on Solana | Solana https://solana.com/docs/core/fees 1/14


---

### Page 2

rent deposit is withheld in an account to store its data on the blockchain and reclaimable.” Currently, the base Solana transaction fee is set at a static value of 5k lamports per signature. On top of this base fee, any additional prioritization fees can be added. Why pay transaction fees? Transaction fees offer many beneﬁts in the Solana economic design, mainly they: provide compensation to the validator network for the expended CPU/GPU compute resources necessary to process transactions reduce network spam by introducing a real cost to transactions provide long-term economic stability to the network through a protocol-captured minimum fee amount per transaction Basic economic design Many blockchain networks (including Bitcoin and Ethereum), rely on inﬂationary protocol-based rewards to secure the network in the short-term. Over the long-term, these networks will increasingly rely on transaction fees to sustain security. The same is true on Solana. Speciﬁcally: A ﬁxed proportion (initially 50%) of each transaction fee is burned (destroyed), with the remaining going to the current leader processing the transaction. A scheduled global inﬂation rate provides a source for rewards distributed to Solana Validators. Fee collection Transactions are required to have at least one account which has signed the transaction and is writable. These writable signer accounts are serialized ﬁrst in the list of accounts and the ﬁrst of these is always used as the "fee payer". 2/8/25, 5:38 PM Fees on Solana | Solana https://solana.com/docs/core/fees 2/14


---

### Page 3

Before any transaction instructions are processed, the fee payer account balance will be deducted to pay for transaction fees. If the fee payer balance is not sufficient to cover transaction fees, the transaction processing will halt and result in a failed transaction. If the balance was sufficient, the fees will be deducted and the transaction's instructions will begin execution. Should any of the instructions result in an error, transaction processing will halt and ultimately be recorded as a failed transaction in the Solana ledger. The fee is still collected by the runtime for these failed transactions. Should any of the instructions return an error or violate runtime restrictions, all account changes except the transaction fee deduction will be rolled back. This is because the validator network has already expended computational resources to collect transactions and begin the initial processing. Fee distribution Transaction fees are partially burned and the remaining fees are collected by the validator that produced the block that the corresponding transactions were included in. Speciﬁcally, 50% are burned and 50% percent are distributed to the validator that produced the block. Why burn some fees? As mentioned above, a ﬁxed proportion of each transaction fee is burned (destroyed). This is intended to cement the economic value of SOL and thus sustain the network's security. Unlike a scheme where transactions fees are completely burned, leaders are still incentivized to include as many transactions as possible in their slots (opportunity to create a block). Burnt fees can also help prevent malicious validators from censoring transactions by being considered in fork selection. Example of an attack: 2/8/25, 5:38 PM Fees on Solana | Solana https://solana.com/docs/core/fees 3/14


---

### Page 4

In the case of a Proof of History (PoH) fork with a malicious or censoring leader: due to the fees lost from censoring, we would expect the total fees burned to be less than a comparable honest fork if the censoring leader is to compensate for these lost protocol fees, they would have to replace the burnt fees on their fork themselves thus potentially reducing the incentive to censor in the ﬁrst place Calculating transaction fees The complete fee for a given transaction is calculated based on two main parts: a statically set base fee per signature, and the computational resources used during the transaction, measured in "compute units" Since each transaction may require a different amount of computational resources, each is allotted a maximum number of compute units per transaction as part of the compute budget. Compute Budget To prevent abuse of computational resources, each transaction is allocated a "compute budget". This budget speciﬁes details about compute units and includes: the compute costs associated with different types of operations the transaction may perform (compute units consumed per operation), the maximum number of compute units that a transaction can consume (compute unit limit), and the operational bounds the transaction must adhere to (like account data size limits) 2/8/25, 5:38 PM Fees on Solana | Solana https://solana.com/docs/core/fees 4/14


---

### Page 5

When the transaction consumes its entire compute budget (compute budget exhaustion), or exceeds a bound such as attempting to exceed the max call stack depth or max loaded account data size limit, the runtime halts the transaction processing and returns an error. Resulting in a failed transaction and no state changes (aside from the transaction fee being collected). Accounts data size limit A transaction may specify the maximum bytes of account data it is allowed to load by including a SetLoadedAccountsDataSizeLimit instruction (not to exceed the runtime's absolute max). If no SetLoadedAccountsDataSizeLimit is provided, the transaction defaults to use the runtime's MAX_LOADED_ACCOUNTS_DATA_SIZE_BYTES value. The ComputeBudgetInstruction::set_loaded_accounts_data_size_limit function can be used to create this instruction: Compute units All the operations performed on-chain within a transaction require different amounts of computation resources be expended by validators when processing (compute cost). The smallest unit of measure for the consumption of these resources is called a "compute unit". As a transaction is processed, compute units are incrementally consumed by each of its instructions being executed on-chain (consuming the budget). Since each instruction is executing different logic (writing to accounts, cpi, performing syscalls, etc), each may consume a different amount of compute units. “A program can log details about its compute usage, including how much remains in its allotted compute budget. You can also ﬁnd more information in this guide for optimizing your compute usage.” let instruction = ComputeBudgetInstruction::set_loaded_accounts_data_size_limi 2/8/25, 5:38 PM Fees on Solana | Solana https://solana.com/docs/core/fees 5/14


---

### Page 6

Each transaction is allotted a compute unit limit, either with the default limit set by the runtime or by explicitly requesting a higher limit. After a transaction exceeds its compute unit limit, its processing is halted resulting in a transaction failure. The following are some common operations that incur a compute cost: executing instructions passing data between programs performing syscalls using sysvars logging with the msg! macro logging pubkeys creating program addresses (PDAs) cross-program invocations (CPI) cryptographic operations “For cross-program invocations, the instruction invoked inherits the compute budget and limits of their parent. If an invoked instruction consumes the transaction's remaining budget, or exceeds a bound, the entire invocation chain and the top level transaction processing are halted.” You can ﬁnd more details about all the operations that consume compute units within the Solana runtime's ComputeBudget. Compute unit limit Each transaction has a maximum number of compute units (CU) it can consume called the "compute unit limit". Per transaction, the Solana runtime has an absolute max compute unit limit of 1.4 million CU and sets a default requested max limit of 200k CU per instruction. 2/8/25, 5:38 PM Fees on Solana | Solana https://solana.com/docs/core/fees 6/14


---

### Page 7

A transaction can request a more speciﬁc and optimal compute unit limit by including a single SetComputeUnitLimit instruction. Either a higher or lower limit. But it may never request higher than the absolute max limit per transaction. While a transaction's default compute unit limit will work in most cases for simple transactions, they are often less than optimal (both for the runtime and the user). For more complex transactions, like invoking programs that perform multiple CPIs, you may need to request a higher compute unit limit for the transaction. Requesting the optimal compute unit limits for your transaction is essential to help you pay less for your transaction and to help schedule your transaction better on the network. Wallets, dApps, and other services should ensure their compute unit requests are optimal to provide the best experience possible for their users. “For more details and best practices, read this guide on requesting optimal compute limits.” Compute unit price When a transaction desires to pay a higher fee to boost its processing prioritization, it can set a "compute unit price". This price, used in combination with compute unit limit, will be used to determine a transaction's prioritization fee. By default, there is no compute unit price set resulting in no additional prioritization fee. Prioritization Fees As part of the Compute Budget, the runtime supports transactions paying an optional fee known as a "prioritization fee". Paying this additional fee helps boost how a transaction is prioritized against others when processing, resulting in faster execution times. 2/8/25, 5:38 PM Fees on Solana | Solana https://solana.com/docs/core/fees 7/14


---

### Page 8

How the prioritization fee is calculated A transaction's prioritization fee is calculated by multiplying its compute unit limit by the compute unit price (measured in micro-lamports). These values can be set once per transaction by including the following Compute Budget instructions: SetComputeUnitLimit - setting the maximum number of compute units the transaction can consume SetComputeUnitPrice - setting the desired additional fee the transaction is willing to pay to boost its prioritization If no SetComputeUnitLimit instruction is provided, the default compute unit limit will be used. If no SetComputeUnitPrice instruction is provided, the transaction will default to no additional elevated fee and the lowest priority (i.e. no prioritization fee). How to set the prioritization fee A transaction's prioritization fee is set by including a SetComputeUnitPrice instruction, and optionally a SetComputeUnitLimit instruction. The runtime will use these values to calculate the prioritization fee, which will be used to prioritize the given transaction within the block. You can craft each of these instructions via their Rust or @solana/web3.js functions. Each instruction can then be included in the transaction and sent to the cluster like normal. See also the best practices below. Unlike other instructions inside a Solana transaction, Compute Budget instructions do NOT require any accounts. A transaction with multiple of either of the instructions will fail. Transactions can only contain one of each type of compute budget instruction. Duplicate instruction types will result in an TransactionError::DuplicateInstruction error, and ultimately transaction failure. 2/8/25, 5:38 PM Fees on Solana | Solana https://solana.com/docs/core/fees 8/14


---

### Page 9

Rust The rust solana-sdk crate includes functions within ComputeBudgetInstruction to craft instructions for setting the compute unit limit and compute unit price: Javascript The @solana/web3.js library includes functions within the ComputeBudgetProgram class to craft instructions for setting the compute unit limit and compute unit price: Prioritization fee best practices Below you can ﬁnd general information on the best practices for prioritization fees. You can also ﬁnd more detailed information in this guide on how to request optimal compute, including how to simulate a transaction to determine its approximate compute usage. Request the minimum compute units let instruction = ComputeBudgetInstruction::set_compute_unit_limit(300_000); let instruction = ComputeBudgetInstruction::set_compute_unit_price(1); const instruction = ComputeBudgetProgram.setComputeUnitLimit({ units: 300_000, }); const instruction = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1, }); 2/8/25, 5:38 PM Fees on Solana | Solana https://solana.com/docs/core/fees 9/14


---

### Page 10

Transactions should request the minimum amount of compute units required for execution to minimize fees. Also note that fees are not adjusted when the number of requested compute units exceeds the number of compute units actually consumed by an executed transaction. Get recent prioritization fees Prior to sending a transaction to the cluster, you can use the getRecentPrioritizationFees RPC method to get a list of the recent paid prioritization fees within the recent blocks processed by the node. You could then use this data to estimate an appropriate prioritization fee for your transaction to both (a) better ensure it gets processed by the cluster and (b) minimize the fees paid. Rent The fee deposited into every Solana Account to keep its associated data available on-chain is called "rent". This fee is withheld in the normal lamport balance on every account and reclaimable when the account is closed. “Rent is different from transaction fees. Rent is "paid" (withheld in an Account) to keep data stored on the Solana blockchain and can be reclaimed. Whereas transaction fees are paid to process instructions on the network.” All accounts are required to maintain a high enough lamport balance (relative to its allocated space) to become rent exempt and remain on the Solana blockchain. Any transaction that attempts to reduce an account's balance below its respective minimum balance for rent exemption will fail (unless the balance is reduced to exactly zero). When an account's owner no longer desires to keep this data on-chain and available in the global state, the owner can close the account and reclaim the rent deposit. 2/8/25, 5:38 PM Fees on Solana | Solana https://solana.com/docs/core/fees 10/14


---

### Page 11

This is accomplished by withdrawing (transferring) the account's entire lamport balance to another account (i.e. your wallet). By reducing the account's balance to exactly 0, the runtime will remove the account and its associated data from the network in the process of "garbage collection". Rent rate The Solana rent rate is set on a network wide basis, primarily based on a runtime set "lamports per byte per year". Currently, the rent rate is a static amount and stored in the Rent sysvar. This rent rate is used to calculate the exact amount of rent required to be withheld inside an account for the space allocated to the account (i.e. the amount of data that can be stored in the account). The more space an account allocates, the higher the withheld rent deposit will be. Rent exempt Accounts must maintain a lamport balance greater than the minimum required to store its respective data on-chain. This is called "rent exempt" and that balance is called the "minimum balance for rent exemption". “New accounts (and programs) on Solana are REQUIRED to be initialized with enough lamports to become rent exempt. This was not always the case. Previously, the runtime would periodically and automatically collect a fee from each account below its minimum balance for rent exemption. Eventually reducing those accounts to a balance of zero and garbage collecting them from the global state (unless manually topped up).” In the process of creating a new account, you must ensure you deposit enough lamports to be above this minimum balance. Anything lower that this minimum threshold will result in a failed transaction. Every time an account's balance is reduced, the runtime performs a check to see if the account will still be above this minimum balance for rent exemption. Unless they 2/8/25, 5:38 PM Fees on Solana | Solana https://solana.com/docs/core/fees 11/14


---

### Page 12

reduce the ﬁnal balance to exactly 0 (closing the account), transactions that would cause an account's balance to drop below the rent exempt threshold will fail. The speciﬁc minimum balance for an account to become rent exempt is dependant on the blockchain's current rent rate and the desired amount of storage space an account wants to allocate (account size). Therefore, it is recommended to use the getMinimumBalanceForRentExemption RPC endpoint to calculate the speciﬁc balance for a given account size. The required rent deposit amount can also be estimated via the solana rent CLI subcommand: Garbage collection Accounts that do not maintain a lamport balance greater than zero are removed from the network in a process known as garbage collection. This process is done to help reduce the network wide storage of no longer used/maintained data. After a transaction successfully reduces an accounts balance to exactly 0, garbage collection happens automatically by the runtime. Any transaction that attempts to reduce an accounts balance lower that its minimum balance for rent exemption (that is not exactly zero) will fail. It's important to note that garbage collection happens after the transaction execution is completed. If there is an instruction to "close" an account by reducing the account balance to zero, the account can be "reopened" within the same transaction via a later instruction. If the account state was not cleared in the "close" instruction, the later "reopen" instruction will have the same account state. It's a security concern, so it's good to know the exact timing garbage collection takes effect. solana rent 15000 # output Rent per byte-year: 0.00000348 SOL Rent per epoch: 0.000288276 SOL Rent-exempt minimum: 0.10529088 SOL 2/8/25, 5:38 PM Fees on Solana | Solana https://solana.com/docs/core/fees 12/14


---

### Page 13

Even after an account has been removed from the network (via garbage collection), it may still have transactions associated with it's address (either past history or in the future). Even though a Solana block explorer may display an "account not found" type of message, you may still be able to view transaction history associated with that account. You can read the validator implemented proposal for garbage collection to learn more. Last updated on 2/5/2025 Loading comments… Previous Transactions and Instructions Next Programs on SolanaManaged by SOLANA Grants Break Solana Media Kit Careers Disclaimer GET CONNECTED Blog Newsletter 2/8/25, 5:38 PM Fees on Solana | Solana https://solana.com/docs/core/fees 13/14


---

### Page 14

Privacy Policy EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 5:38 PM Fees on Solana | Solana https://solana.com/docs/core/fees 14/14


---

# Inflation Related Terminology _ Solana.pdf

### Page 1

Solana Documentation Economics Inﬂation Inflation Related Terminology Many terms are thrown around when discussing inﬂation and the related components (e.g. rewards/yield/interest), we try to deﬁne and clarify some commonly used concept here: Total Current Supply [SOL] The total amount of tokens (locked or unlocked) that have been generated (via genesis block or protocol inﬂation) minus any tokens that have been burnt (via transaction fees or other mechanism) or slashed. At network launch, 500,000,000 SOL were instantiated in the genesis block. Since then the Total Current Supply has been reduced by the burning of transaction fees and a planned token reduction event. Solana's Total Current Supply can be found at https://explorer.solana.com/supply Inﬂation Rate [%] The Solana protocol will automatically create new tokens on a predetermined inﬂation schedule (discussed below). The Inﬂation Rate [%] is the annualized growth rate of the Total Current Supply at any point in time. Inﬂation Schedule Documentation API Cookbook Courses Guides Get Support Table of Contents Total Current Supply [SOL] 2/8/25, 5:44 PM Inﬂation Related Terminology | Solana https://solana.com/docs/economics/inﬂation/terminology 1/5


---

### Page 2

A deterministic description of token issuance over time. The Solana Foundation is proposing a disinﬂationary Inﬂation Schedule. I.e. Inﬂation starts at its highest value, the rate reduces over time until stabilizing at a predetermined long-term inﬂation rate (see discussion below). This schedule is completely and uniquely parameterized by three numbers: Initial Inﬂation Rate [%]: The starting Inﬂation Rate for when inﬂation is ﬁrst enabled. Token issuance rate can only decrease from this point. Disinﬂation Rate [%]: The rate at which the Inﬂation Rate is reduced. Long-term Inﬂation Rate [%]: The stable, long-term Inﬂation Rate to be expected. Effective Inﬂation Rate [%] The inﬂation rate actually observed on the Solana network after accounting for other factors that might decrease the Total Current Supply. Note that it is not possible for tokens to be created outside of what is described by the Inﬂation Schedule. While the Inﬂation Schedule determines how the protocol issues SOL, this neglects the concurrent elimination of tokens in the ecosystem due to various factors. The primary token burning mechanism is the burning of a portion of each transaction fee. 50% of each transaction fee is burned, with the remaining fee retained by the validator that processes the transaction. Additional factors such as loss of private keys and slashing events should also be considered in a holistic analysis of the Effective Inﬂation Rate. For example, it's estimated that 10-20% of all BTC have been lost and are unrecoverable and that networks may experience similar yearly losses at the rate of 1-2%. Staking Yield [%] The rate of return (aka interest) earned on SOL staked on the network. It is often quoted as an annualized rate (e.g. "the network staking yield is currently 10% per year"). 2/8/25, 5:44 PM Inﬂation Related Terminology | Solana https://solana.com/docs/economics/inﬂation/terminology 2/5


---

### Page 3

Staking yield is of great interest to validators and token holders who wish to delegate their tokens to avoid token dilution due to inﬂation (the extent of which is discussed below). 100% of inﬂationary issuances are to be distributed to staked token-holders in proportion to their staked SOL and to validators who charge a commission on the rewards earned by their delegated SOL. There may be future consideration for an additional split of inﬂation issuance with the introduction of Archivers into the economy. Archivers are network participants who provide a decentralized storage service and should also be incentivized with token distribution from inﬂation issuances for this service. - Similarly, early designs speciﬁed a ﬁxed percentage of inﬂationary issuance to be delivered to the Foundation treasury for operational expenses and future grants. However, inﬂation will be launching without any portion allocated to the Foundation. Staking yield can be calculated from the Inﬂation Schedule along with the fraction of the Total Current Supply that is staked at any given time. The explicit relationship is given by: Token Dilution [%] Dilution is deﬁned here as the change in proportional representation of a set of tokens within a larger set due to the introduction of new tokens. In practical terms, we discuss the dilution of staked or un-staked tokens due to the introduction and distribution of inﬂation issuance across the network. As will be shown below, while dilution impacts every token holder, the relative dilution between staked and un- staked tokens should be the primary concern to un-staked token holders. Staking tokens, which will receive their proportional distribution of inﬂation issuance, should assuage any dilution concerns for staked token holders. I.e. dilution from 'inﬂation' is offset by the distribution of new tokens to staked token holders, nullifying the 'dilutive' effects of the inﬂation for that group. Adjusted Staking Yield [%] 2/8/25, 5:44 PM Inﬂation Related Terminology | Solana https://solana.com/docs/economics/inﬂation/terminology 3/5


---

### Page 4

A complete appraisal of earning potential from staking tokens should take into account staked Token Dilution and its impact on the Staking Yield. For this, we deﬁne the Adjusted Staking Yield as the change in fractional token supply ownership of staked tokens due to the distribution of inﬂation issuance. I.e. the positive dilutive effects of inﬂation. Last updated on 2/4/2025 1 reaction 👍 1 0 comments– powered by giscus Previous Proposed Inﬂation Schedule Next Staking Managed by SOLANA Grants Break Solana Media Kit GET CONNECTED Blog Newsletter 2/8/25, 5:44 PM Inﬂation Related Terminology | Solana https://solana.com/docs/economics/inﬂation/terminology 4/5


---

### Page 5

Careers Disclaimer Privacy Policy EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 5:44 PM Inﬂation Related Terminology | Solana https://solana.com/docs/economics/inﬂation/terminology 5/5


---

# How to create a Solana mobile app _ Solana.pdf

### Page 1

Solana Documentation The Solana Toolkit Creating a Project Mobile App with a Solana Program Connection “This is a beta version of the Solana Toolkit, and is still a WIP. Please post all feedback as a GitHub issue here.” Overview This will initialize a new project using the Expo framework that is speciﬁcally designed for creating mobile applications that interact with the Solana blockchain. Follow this template's guide for "Running the app" in order to launch the template as a custom development build and get it running on your Android emulator. Once you have built the program and are running a dev client with Expo, the emulator will automatically update every time you save your code. Prerequisites yarn create expo-app --template @solana-mobile/solana-mobile-expo-template Documentation API Cookbook Courses Guides Get Support Table of Contents Overview 2/8/25, 6:01 PM How to create a Solana mobile app | Solana https://solana.com/docs/toolkit/projects/mobile-app 1/3


---

### Page 2

To use this template, you will also need to set up the following: Android Studio and Emulator React Native EAS CLI and Account Additional Resources Solana Mobile Development Mobile App Example - Cash App Clone Anchor book Getting Started with Anchor Program Examples Last updated on 2/5/2025 Loading comments… Previous Web App Next Existing Projects 2/8/25, 6:01 PM How to create a Solana mobile app | Solana https://solana.com/docs/toolkit/projects/mobile-app 2/3


---

### Page 3

Managed by SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 6:01 PM How to create a Solana mobile app | Solana https://solana.com/docs/toolkit/projects/mobile-app 3/3


---

# How to run code coverage for Solana programs _ Solana.pdf

### Page 1

Solana Documentation The Solana Toolkit Test Suite Solana Code Coverage Tool “This is a beta version of the Solana Toolkit, and is still a WIP. Please post all feedback as a GitHub issue here.” Overview This command will run a code coverage test on all of your Rust tests and then generates a report as an HTML page providing metrics on where additional tests may be needed to improve your current code coverage. “Currently, this tool only works on tests written in Rust and is not compatible with a JavaScript test suite.” Additional Resources Source Code mucho coverage Documentation API Cookbook Courses Guides Get Support Table of Contents Overview 2/8/25, 6:02 PM How to run code coverage for Solana programs | Solana https://solana.com/docs/toolkit/test-suite/code-coverage 1/3


---

### Page 2

Last updated on 2/4/2025 Loading comments… Previous Testing Basics Next Fuzz Tester Managed by SOLANA Grants Break Solana Media Kit Careers Disclaimer GET CONNECTED Blog Newsletter 2/8/25, 6:02 PM How to run code coverage for Solana programs | Solana https://solana.com/docs/toolkit/test-suite/code-coverage 2/3


---

### Page 3

Privacy Policy EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 6:02 PM How to run code coverage for Solana programs | Solana https://solana.com/docs/toolkit/test-suite/code-coverage 3/3


---

# Stake Accounts _ Solana.pdf

### Page 1

Solana Documentation Economics Staking Stake Accounts A stake account on Solana can be used to delegate tokens to validators on the network to potentially earn rewards for the owner of the stake account. Stake accounts are created and managed differently than a traditional wallet address, known as a system account. A system account is only able to send and receive SOL from other accounts on the network, whereas a stake account supports more complex operations needed to manage a delegation of tokens. Stake accounts on Solana also work differently than those of other Proof-of-Stake blockchain networks that you may be familiar with. This document describes the high-level structure and functions of a Solana stake account. Account Address Each stake account has a unique address which can be used to look up the account information in the command line or in any network explorer tools. However, unlike a wallet address in which the holder of the address's keypair controls the wallet, the keypair associated with a stake account address does not necessarily have any control over the account. In fact, a keypair or private key may not even exist for a stake account's address. The only time a stake account's address has a keypair ﬁle is when creating a stake account using the command line tools. A new keypair ﬁle is created ﬁrst only to Documentation API Cookbook Courses Guides Get Support Table of Contents Account Address 2/8/25, 5:44 PM Stake Accounts | Solana https://solana.com/docs/economics/staking/stake-accounts 1/6


---

### Page 2

ensure that the stake account's address is new and unique. Understanding Account Authorities Certain types of accounts may have one or more signing authorities associated with a given account. An account authority is used to sign certain transactions for the account it controls. This is different from some other blockchain networks where the holder of the keypair associated with the account's address controls all of the account's activity. Each stake account has two signing authorities speciﬁed by their respective address, each of which is authorized to perform certain operations on the stake account. The stake authority is used to sign transactions for the following operations: Delegating stake Deactivating the stake delegation Splitting the stake account, creating a new stake account with a portion of the funds in the ﬁrst account Merging two stake accounts into one Setting a new stake authority The withdraw authority signs transactions for the following: Withdrawing un-delegated stake into a wallet address Setting a new withdraw authority Setting a new stake authority The stake authority and withdraw authority are set when the stake account is created, and they can be changed to authorize a new signing address at any time. The stake and withdraw authority can be the same address or two different addresses. 2/8/25, 5:44 PM Stake Accounts | Solana https://solana.com/docs/economics/staking/stake-accounts 2/6


---

### Page 3

The withdraw authority keypair holds more control over the account as it is needed to liquidate the tokens in the stake account, and can be used to reset the stake authority if the stake authority keypair becomes lost or compromised. Securing the withdraw authority against loss or theft is of utmost importance when managing a stake account. Multiple Delegations Each stake account may only be used to delegate to one validator at a time. All of the tokens in the account are either delegated or un-delegated, or in the process of becoming delegated or un-delegated. To delegate a fraction of your tokens to a validator, or to delegate to multiple validators, you must create multiple stake accounts. This can be accomplished by creating multiple stake accounts from a wallet address containing some tokens, or by creating a single large stake account and using the stake authority to split the account into multiple accounts with token balances of your choosing. The same stake and withdraw authorities can be assigned to multiple stake accounts. Merging stake accounts Two stake accounts that have the same authorities and lockup can be merged into a single resulting stake account. A merge is possible between two stakes in the following states with no additional conditions: two deactivated stakes an inactive stake into an activating stake during its activation epoch For the following cases, the voter pubkey and vote credits observed must match: two activated stakes 2/8/25, 5:44 PM Stake Accounts | Solana https://solana.com/docs/economics/staking/stake-accounts 3/6


---

### Page 4

two activating accounts that share an activation epoch, during the activation epoch All other combinations of stake states will fail to merge, including all "transient" states, where a stake is activating or deactivating with a non-zero effective stake. Delegation Warmup and Cooldown When a stake account is delegated, or a delegation is deactivated, the operation does not take effect immediately. A delegation or deactivation takes several epochs to complete, with a fraction of the delegation becoming active or inactive at each epoch boundary after the transaction containing the instructions has been submitted to the cluster. There is also a limit on how much total stake can become delegated or deactivated in a single epoch, to prevent large sudden changes in stake across the network as a whole. Since warmup and cooldown are dependent on the behavior of other network participants, their exact duration is difficult to predict. Details on the warmup and cooldown timing can be found here. Lockups Stake accounts can have a lockup which prevents the tokens they hold from being withdrawn before a particular date or epoch has been reached. While locked up, the stake account can still be delegated, un-delegated, or split, and its stake authority can be changed as normal. Only withdrawal into another wallet or updating the withdraw authority is not allowed. A lockup can only be added when a stake account is ﬁrst created, but it can be modiﬁed later, by the lockup authority or custodian, the address of which is also set when the account is created. Destroying a Stake Account 2/8/25, 5:44 PM Stake Accounts | Solana https://solana.com/docs/economics/staking/stake-accounts 4/6


---

### Page 5

Like other types of accounts on the Solana network, a stake account that has a balance of 0 SOL is no longer tracked. If a stake account is not delegated and all of the tokens it contains are withdrawn to a wallet address, the account at that address is effectively destroyed, and will need to be manually re-created for the address to be used again. Viewing Stake Accounts Stake account details can be viewed on the Solana Explorer by copying and pasting an account address into the search bar. Last updated on 2/4/2025 Loading comments… Previous Staking Next Stake Programming Managed by SOLANA Grants GET CONNECTED Blog 2/8/25, 5:44 PM Stake Accounts | Solana https://solana.com/docs/economics/staking/stake-accounts 5/6


---

### Page 6

Break Solana Media Kit Careers Disclaimer Privacy Policy Newsletter EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 5:44 PM Stake Accounts | Solana https://solana.com/docs/economics/staking/stake-accounts 6/6


---

# How to structure a Solana program and repo _ Solana.pdf

### Page 1

Solana Documentation The Solana Toolkit Creating a Project Program File Structure “This is a beta version of the Solana Toolkit, and is still a WIP. Please post all feedback as a GitHub issue here.” Typically Solana smart contracts (aka programs) workspaces will be have the following ﬁle structure: The main program is the lib.rs ﬁle, which lives insides the programs directory, as shown below: . ├── app ├── migrations ├── node_modules ├── programs ├── target └── tests . ├── app ├── migrations ├── node_modules ├── programs ├── src Documentation API Cookbook Courses Guides Get Support Table of Contents 2/8/25, 6:01 PM How to structure a Solana program and repo | Solana https://solana.com/docs/toolkit/projects/project-layout 1/4


---

### Page 2

As the program gets more cumbersome, you'll typically want to separate the logic into multiple ﬁles, as shown below: For native rust program development, you need to explicitly write out the entrypoint and processor for the program, so you'll need a few more ﬁles: Last updated on 2/4/2025 ├── lib.rs ├── target └── tests ├── programs ├── src ├── state.rs ├── instructions ├── instruction_1.rs ├── instruction_2.rs ├── instruction_3.rs ├── lib.rs ├── constants.rs ├── error.rs ├── mod.rs ├── program.rs │ ├── src.rs │ │ ├──assertions.rs │ │ ├──entrypoint.rs │ │ ├──error.rs │ │ ├──instruction.rs │ │ ├──lib.rs │ │ ├──processor.rs │ │ ├──state.rs │ │ ├──utils.rs │ ├── Cargo.toml │ ├── keypair.json │ ├── README.md 2/8/25, 6:01 PM How to structure a Solana program and repo | Solana https://solana.com/docs/toolkit/projects/project-layout 2/4


---

### Page 3

Loading comments… Previous Existing Projects Next Best Practices Managed by SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN 2/8/25, 6:01 PM How to structure a Solana program and repo | Solana https://solana.com/docs/toolkit/projects/project-layout 3/4


---

### Page 4

© 2025 Solana Foundation. All rights reserved. 2/8/25, 6:01 PM How to structure a Solana program and repo | Solana https://solana.com/docs/toolkit/projects/project-layout 4/4


---

# How to create a Solana program with Anchor _ Solana.pdf

### Page 1

Solana Documentation The Solana Toolkit Creating a Project Basic Anchor Programs “This is a beta version of the Solana Toolkit, and is still a WIP. Please post all feedback as a GitHub issue here.” Overview This initializes a simplistic workspace set up for Anchor program development, with the following structure: Anchor.toml: Anchor conﬁguration ﬁle. Cargo.toml: Rust workspace conﬁguration ﬁle. package.json: JavaScript dependencies ﬁle. programs/: Directory for Solana program crates. app/: Directory for your application frontend. tests/: Directory for JavaScript integration tests. migrations/deploy.js: Deploy script. anchor init <project_name> Documentation API Cookbook Courses Guides Get Support Table of Contents Overview 2/8/25, 6:01 PM How to create a Solana program with Anchor | Solana https://solana.com/docs/toolkit/projects/anchor-init 1/4


---

### Page 2

The Anchor framework abstracts away many complexities enabling fast program development. Build and Test To test out this project before making any modiﬁcations, just build and test: To start writing your own Anchor program, navigate to programs/src/lib.rs. File Structure Template For more complex programs, using a more structured project template would be the best practice. This can be generated with: Which creates the following layout inside of programs/src: anchor build anchor test anchor init --template multiple ├── constants.rs ├── error.rs ├── instructions │ ├── initialize.rs │ └── mod.rs ├── lib.rs └── state └── mod.rs 2/8/25, 6:01 PM How to create a Solana program with Anchor | Solana https://solana.com/docs/toolkit/projects/anchor-init 2/4


---

### Page 3

For project ﬁle structure best practices, review this document. Additional Resources Anchor book Getting Started with Anchor Program Examples Last updated on 2/5/2025 Loading comments… Previous Overview Next Solana Programs Managed by 2/8/25, 6:01 PM How to create a Solana program with Anchor | Solana https://solana.com/docs/toolkit/projects/anchor-init 3/4


---

### Page 4

SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 6:01 PM How to create a Solana program with Anchor | Solana https://solana.com/docs/toolkit/projects/anchor-init 4/4


---

# Developing Programs in Rust _ Solana.pdf

### Page 1

Solana Documentation Developing Programs Developing Programs in Rust Solana programs are primarily developed using the Rust programming language. This page focuses on writing Solana programs in Rust without using the Anchor framework, an approach often referred to as writing "native Rust" programs. Native Rust development provides developers with direct control over their Solana programs. However, this approach requires more manual setup and boilerplate code compared to using the Anchor framework. This method is recommended for developers who: Seek granular control over program logic and optimizations Want to learn the underlying concepts before moving to higher-level frameworks For beginners, we recommend starting with the Anchor framework. See the Anchor section for more information. Prerequisites For detailed installation instructions, visit the installation page. Before you begin, ensure you have the following installed: Documentation API Cookbook Courses Guides Get Support Table of Contents Prerequisites 2/8/25, 6:02 PM Developing Programs in Rust | Solana https://solana.com/docs/programs/rust 1/14


---

### Page 2

Rust: The programming language for building Solana programs. Solana CLI: Command-line tool for Solana development. Getting Started The example below covers the basic steps to create your ﬁrst Solana program written in Rust. We'll create a minimal program that prints "Hello, world!" to the program log. Create a new Program First, create a new Rust project using the standard cargo init command with the --lib ﬂag. Navigate to the project directory. You should see the default src/lib.rs and Cargo.toml ﬁles Next, add the solana-program dependency. This is the minimum dependency required to build a Solana program. 1 Terminal cargo init hello_world --lib Terminal cd hello_world Terminal cargo add solana-program@1.18.26 2/8/25, 6:02 PM Developing Programs in Rust | Solana https://solana.com/docs/programs/rust 2/14


---

### Page 3

Next, add the following snippet to Cargo.toml. If you don't include this conﬁg, the target/deploy directory will not be generated when you build the program. Your Cargo.toml ﬁle should look like the following: Next, replace the contents of src/lib.rs with the following code. This is a minimal Solana program that prints "Hello, world!" to the program log when the program is invoked. The msg! macro is used in Solana programs to print a message to the program log. Cargo.toml [lib] crate-type = ["cdylib", "lib"] Cargo.toml [package] name = "hello_world" version = "0.1.0" edition = "2021" [lib] crate-type = ["cdylib", "lib"] [dependencies] solana-program = "1.18.26" lib.rs use solana_program::{ account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, ms }; entrypoint!(process_instruction); 2/8/25, 6:02 PM Developing Programs in Rust | Solana https://solana.com/docs/programs/rust 3/14


---

### Page 4

Build the Program Next, build the program using the cargo build-sbf command. This command generates a target/deploy directory containing two important ﬁles: 1. A .so ﬁle (e.g., hello_world.so): This is the compiled Solana program that will be deployed to the network as a "smart contract". 2. A keypair ﬁle (e.g., hello_world-keypair.json): The public key of this keypair is used as the program ID when deploying the program. To view the program ID, run the following command in your terminal. This command prints the public key of the keypair at the speciﬁed ﬁle path: Example output: pub fn process_instruction( _program_id: &Pubkey, _accounts: &[AccountInfo], _instruction_data: &[u8], ) -> ProgramResult { msg!("Hello, world!"); Ok(()) } 2 Terminal cargo build-sbf Terminal solana address -k ./target/deploy/hello_world-keypair.json 2/8/25, 6:02 PM Developing Programs in Rust | Solana https://solana.com/docs/programs/rust 4/14


---

### Page 5

Test the Program Next, test the program using the solana-program-test crate. Add the following dependencies to Cargo.toml. Add the following test to src/lib.rs, below the program code. This is a test module that invokes the hello world program. 4Ujf5fXfLx2PAwRqcECCLtgDxHKPznoJpa43jUBxFfMz 3 Terminal cargo add solana-program-test@1.18.26 --dev cargo add solana-sdk@1.18.26 --dev cargo add tokio --dev lib.rs #[cfg(test)] mod test { use super::*; use solana_program_test::*; use solana_sdk::{signature::Signer, transaction::Transaction}; #[tokio::test] async fn test_hello_world() { let program_id = Pubkey::new_unique(); let (mut banks_client, payer, recent_blockhash) = ProgramTest::new("hello_world", program_id, processor!(proce .start() .await; // Create the instruction to invoke the program let instruction = solana_program::instruction::Instruction::new_with_borsh(pro // Add the instruction to a new transaction let mut transaction = Transaction::new_with_payer(&[instruction] transaction.sign(&[&payer], recent_blockhash); 2/8/25, 6:02 PM Developing Programs in Rust | Solana https://solana.com/docs/programs/rust 5/14


---

### Page 6

Run the test using the cargo test-sbf command. The program log will display "Hello, world!". Example output: Deploy the Program Next, deploy the program. When developing locally, we can use the solana- test-validator. First, conﬁgure the Solana CLI to use the local Solana cluster. // Process the transaction let transaction_result = banks_client.process_transaction(transa assert!(transaction_result.is_ok()); } } Terminal cargo test-sbf Terminal running 1 test [2024-10-18T21:24:54.889570000Z INFO solana_program_test] "hello_world" [2024-10-18T21:24:54.974294000Z DEBUG solana_runtime::message_processor: [2024-10-18T21:24:54.974814000Z DEBUG solana_runtime::message_processor: [2024-10-18T21:24:54.976848000Z DEBUG solana_runtime::message_processor: [2024-10-18T21:24:54.976868000Z DEBUG solana_runtime::message_processor: test test::test_hello_world ... ok test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered o 4 Terminal 2/8/25, 6:02 PM Developing Programs in Rust | Solana https://solana.com/docs/programs/rust 6/14


---

### Page 7

Example output: Open a new terminal and run the solana-test-validators command to start the local validator. While the test validator is running, run the solana program deploy command in a separate terminal to deploy the program to the local validator. Example output: solana config set -ul Config File: /.config/solana/cli/config.yml RPC URL: http://localhost:8899 WebSocket URL: ws://localhost:8900/ (computed) Keypair Path: /.config/solana/id.json Commitment: confirmed Terminal solana-test-validator Terminal solana program deploy ./target/deploy/hello_world.so Program Id: 4Ujf5fXfLx2PAwRqcECCLtgDxHKPznoJpa43jUBxFfMz Signature: 5osMiNMiDZGM7L1e2tPHxU8wdB8gwG8fDnXLg5G7SbhwFz4dHshYgAijk4wSQL5cXiu8z1MM 2/8/25, 6:02 PM Developing Programs in Rust | Solana https://solana.com/docs/programs/rust 7/14


---

### Page 8

You can inspect the program ID and transaction signature on Solana Explorer. Note that the cluster on Solana Explorer must also be localhost. The "Custom RPC URL" option on Solana Explorer defaults to http://localhost:8899. Invoke the Program Next, we'll demonstrate how to invoke the program using a Rust client. First create an examples directory and a client.rs ﬁle. Add the following to Cargo.toml. Add the solana-client dependency. Add the following code to examples/client.rs. This is a Rust client script that funds a new keypair to pay for transaction fees and then invokes the hello world program. 5 Terminal mkdir -p examples touch examples/client.rs Cargo.toml [[example]] name = "client" path = "examples/client.rs" Terminal cargo add solana-client@1.18.26 --dev 2/8/25, 6:02 PM Developing Programs in Rust | Solana https://solana.com/docs/programs/rust 8/14


---

### Page 9

Before running the script, replace the program ID in the code snippet above with the one for your program. You can get your program ID by running the following command. example/client.rs use solana_client::rpc_client::RpcClient; use solana_sdk::{ commitment_config::CommitmentConfig, instruction::Instruction, pubkey::Pubkey, signature::{Keypair, Signer}, transaction::Transaction, }; use std::str::FromStr; #[tokio::main] async fn main() { // Program ID (replace with your actual program ID) let program_id = Pubkey::from_str("4Ujf5fXfLx2PAwRqcECCLtgDxHKPznoJp // Connect to the Solana devnet let rpc_url = String::from("http://127.0.0.1:8899"); let client = RpcClient::new_with_commitment(rpc_url, CommitmentConfi // Generate a new keypair for the payer let payer = Keypair::new(); // Request airdrop let airdrop_amount = 1_000_000_000; // 1 SOL let signature = client .request_airdrop(&payer.pubkey(), airdrop_amount) .expect("Failed to request airdrop"); // Wait for airdrop confirmation { Terminal solana address -k ./target/deploy/hello_world-keypair.json #[tokio::main] 2/8/25, 6:02 PM Developing Programs in Rust | Solana https://solana.com/docs/programs/rust 9/14


---

### Page 10

Run the client script with the following command. Example output: You can inspect the transaction signature on Solana Explorer (local cluster) to see "Hello, world!" in the program log. Update the Program Solana programs can be updated by redeploying to the same program ID. Update the program in src/lib.rs to print "Hello, Solana!" instead of "Hello, world!". async fn main() { - let program_id = Pubkey::from_str("4Ujf5fXfLx2PAwRqcECCLtgDxHKPzno + let program_id = Pubkey::from_str("YOUR_PROGRAM_ID).unwrap(); } } Terminal cargo run --example client Transaction Signature: 54TWxKi3Jsi3UTeZbhLGUFX6JQH7TspRJjRRFZ8NFnwG5BXM9 6 lib.rs 2/8/25, 6:02 PM Developing Programs in Rust | Solana https://solana.com/docs/programs/rust 10/14


---

### Page 11

Test the updated program by running the cargo test-sbf command. You should see "Hello, Solana!" in the program log. Run the cargo build-sbf command to generate an updated .so ﬁle. pub fn process_instruction( _program_id: &Pubkey, _accounts: &[AccountInfo], _instruction_data: &[u8], ) -> ProgramResult { - msg!("Hello, world!"); + msg!("Hello, Solana!"); Ok(()) } Terminal cargo test-sbf Terminal running 1 test [2024-10-23T19:28:28.842639000Z INFO solana_program_test] "hello_world" [2024-10-23T19:28:28.934854000Z DEBUG solana_runtime::message_processor: [2024-10-23T19:28:28.936735000Z DEBUG solana_runtime::message_processor: [2024-10-23T19:28:28.938774000Z DEBUG solana_runtime::message_processor: [2024-10-23T19:28:28.938793000Z DEBUG solana_runtime::message_processor: test test::test_hello_world ... ok test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered o Terminal cargo build-sbf 2/8/25, 6:02 PM Developing Programs in Rust | Solana https://solana.com/docs/programs/rust 11/14


---

### Page 12

Redeploy the program using the solana program deploy command. Run the client code again and inspect the transaction signature on Solana Explorer to see "Hello, Solana!" in the program log. Close the Program You can close your Solana program to reclaim the SOL allocated to the account. Closing a program is irreversible, so it should be done with caution. To close a program, use the solana program close <PROGRAM_ID> command. For example: Example output: Terminal solana program deploy ./target/deploy/hello_world.so Terminal cargo run --example client 7 Terminal solana program close 4Ujf5fXfLx2PAwRqcECCLtgDxHKPznoJpa43jUBxFfMz --bypass-warning Closed Program Id 4Ujf5fXfLx2PAwRqcECCLtgDxHKPznoJpa43jUBxFfMz, 0.135058 reclaimed 2/8/25, 6:02 PM Developing Programs in Rust | Solana https://solana.com/docs/programs/rust 12/14


---

### Page 13

Last updated on 2/5/2025 Loading comments… Previous JavaScript / TypeScript Next Program Structure Managed by SOLANA GET CONNECTED Note that once a program is closed, its program ID cannot be reused. Attempting to deploy a program with a previously closed program ID will result in an error. If you need to redeploy a program with the same source code after closing a program, you must generate a new program ID. To generate a new keypair for the program, run the following command: Alternatively, you can delete the existing keypair ﬁle (e.g. ./target/deploy/hello_world-keypair.json) and run cargo build-sbf again, which will generate a new keypair ﬁle. Error: Program 4Ujf5fXfLx2PAwRqcECCLtgDxHKPznoJpa43jUBxFfMz has been clo a new Program Id Terminal solana-keygen new -o ./target/deploy/hello_world-keypair.json --force 2/8/25, 6:02 PM Developing Programs in Rust | Solana https://solana.com/docs/programs/rust 13/14


---

### Page 14

Grants Break Solana Media Kit Careers Disclaimer Privacy Policy Blog Newsletter EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 6:02 PM Developing Programs in Rust | Solana https://solana.com/docs/programs/rust 14/14


---

# Cross Program Invocation (CPI) _ Solana.pdf

### Page 1

Solana Documentation Core Concepts Cross Program Invocation (CPI) A Cross Program Invocation (CPI) refers to when one program invokes the instructions of another program. This mechanism allows for the composability of Solana programs. You can think of instructions as API endpoints that a program exposes to the network and a CPI as one API internally invoking another API. InvokesInstruction Transaction Instruction Program A Instruction Program B Invokes Wallet Account Signs and Sends Cross Program Invocation When a program initiates a Cross Program Invocation (CPI) to another program: The signer privileges from the initial transaction invoking the caller program (A) extend to the callee (B) program The callee (B) program can make further CPIs to other programs, up to a maximum depth of 4 (ex. B→C, C→D) The programs can "sign" on behalf of the PDAs derived from its program ID Documentation API Cookbook Courses Guides Get Support Table of Contents Key Points 2/8/25, 5:39 PM Cross Program Invocation (CPI) | Solana https://solana.com/docs/core/cpi 1/5


---

### Page 2

“The Solana program runtime deﬁnes a constant called max_invoke_stack_height, which is set to a value of 5. This represents the maximum height of the program instruction invocation stack. The stack height begins at 1 for transaction instructions, increases by 1 each time a program invokes another instruction. This setting effectively limits invocation depth for CPIs to 4.” Key Points CPIs enable Solana program instructions to directly invoke instructions on another program. Signer privileges from a caller program are extended to the callee program. When making a CPI, programs can "sign" on behalf of PDAs derived from their own program ID. The callee program can make additional CPIs to other programs, up to a maximum depth of 4. How to write a CPI Writing an instruction for a CPI follows the same pattern as building an instruction to add to a transaction. Under the hood, each CPI instruction must specify the following information: Program address: Speciﬁes the program being invoked Accounts: Lists every account the instruction reads from or writes to, including other programs Instruction Data: Speciﬁes which instruction on the program to invoke, plus any additional data required by the instruction (function arguments) 2/8/25, 5:39 PM Cross Program Invocation (CPI) | Solana https://solana.com/docs/core/cpi 2/5


---

### Page 3

Depending on the program you are making the call to, there may be crates available with helper functions for building the instruction. Programs then execute CPIs using either one of the following functions from the solana_program crate: invoke - used when there are no PDA signers invoke_signed - used when the caller program needs to sign with a PDA derived from its program ID Basic CPI The invoke function is used when making a CPI that does not require PDA signers. When making CPIs, signers provided to the caller program automatically extend to the callee program. Here is an example program on Solana Playground that makes a CPI using the invoke function to call the transfer instruction on the System Program. You can also reference the Basic CPI guide for further details. CPI with PDA Signer The invoke_signed function is used when making a CPI that requires PDA signers. The seeds used to derive the signer PDAs are passed into the invoke_signed function as signer_seeds. You can reference the Program Derived Address page for details on how PDAs are derived. pub fn invoke( instruction: &Instruction, account_infos: &[AccountInfo<'_>] ) -> Result<(), ProgramError> pub fn invoke_signed( instruction: &Instruction, 2/8/25, 5:39 PM Cross Program Invocation (CPI) | Solana https://solana.com/docs/core/cpi 3/5


---

### Page 4

The runtime uses the privileges granted to the caller program to determine what privileges can be extended to the callee. Privileges in this context refer to signers and writable accounts. For example, if the instruction the caller is processing contains a signer or writable account, then the caller can invoke an instruction that also contains that signer and/or writable account. While PDAs have no private keys, they can still act as a signer in an instruction via a CPI. To verify that a PDA is derived from the calling program, the seeds used to generate the PDA must be included as signers_seeds. When the CPI is processed, the Solana runtime internally calls create_program_address using the signers_seeds and the program_id of the calling program. If a valid PDA is found, the address is added as a valid signer. Here is an example program on Solana Playground that makes a CPI using the invoke_signed function to call the transfer instruction on the System Program with a PDA signer. You can reference the CPI with PDA Signer guide for further details. Last updated on 2/4/2025 Loading comments… account_infos: &[AccountInfo<'_>], signers_seeds: &[&[&[u8]]] ) -> Result<(), ProgramError> 2/8/25, 5:39 PM Cross Program Invocation (CPI) | Solana https://solana.com/docs/core/cpi 4/5


---

### Page 5

Previous Program Derived Address Next Tokens on Solana Managed by SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 5:39 PM Cross Program Invocation (CPI) | Solana https://solana.com/docs/core/cpi 5/5


---

# Rust Program Structure _ Solana.pdf

### Page 1

Solana Documentation Developing Programs Rust Programs Rust Program Structure Solana programs written in Rust have minimal structural requirements, allowing for ﬂexibility in how code is organized. The only requirement is that a program must have an entrypoint, which deﬁnes where the execution of a program begins. Program Structure While there are no strict rules for ﬁle structure, Solana programs typically follow a common pattern: entrypoint.rs: Deﬁnes the entrypoint that routes incoming instructions. state.rs: Deﬁne program-speciﬁc state (account data). instructions.rs: Deﬁnes the instructions that the program can execute. processor.rs: Deﬁnes the instruction handlers (functions) that implement the business logic for each instruction. error.rs: Deﬁnes custom errors that the program can return. You can ﬁnd examples in the Solana Program Library. Example Program Documentation API Cookbook Courses Guides Get Support Table of Contents Program Structure 2/8/25, 6:02 PM Rust Program Structure | Solana https://solana.com/docs/programs/rust/program-structure 1/15


---

### Page 2

To demonstrate how to build a native Rust program with multiple instructions, we'll walk through a simple counter program that implements two instructions: 1. InitializeCounter: Creates and initializes a new account with an initial value. 2. IncrementCounter: Increments the value stored in an existing account. For simplicity, the program will be implemented in a single lib.rs ﬁle, though in practice you may want to split larger programs into multiple ﬁles. Full Program Code Create a new Program First, create a new Rust project using the standard cargo init command with the --lib ﬂag. Navigate to the project directory. You should see the default src/lib.rs and Cargo.toml ﬁles Next, add the solana-program dependency. This is the minimum dependency required to build a Solana program. 1 Terminal cargo init counter_program --lib Terminal cd counter_program Terminal 2/8/25, 6:02 PM Rust Program Structure | Solana https://solana.com/docs/programs/rust/program-structure 2/15


---

### Page 3

Next, add the following snippet to Cargo.toml. If you don't include this conﬁg, the target/deploy directory will not be generated when you build the program. Your Cargo.toml ﬁle should look like the following: Program Entrypoint A Solana program entrypoint is the function that gets called when a program is invoked. The entrypoint has the following raw deﬁnition and developers are free to create their own implementation of the entrypoint function. For simplicity, use the entrypoint! macro from the solana_program crate to deﬁne the entrypoint in your program. cargo add solana-program@1.18.26 Cargo.toml [lib] crate-type = ["cdylib", "lib"] Cargo.toml [package] name = "counter_program" version = "0.1.0" edition = "2021" [lib] crate-type = ["cdylib", "lib"] [dependencies] solana-program = "1.18.26" 2 #[no_mangle] 2/8/25, 6:02 PM Rust Program Structure | Solana https://solana.com/docs/programs/rust/program-structure 3/15


---

### Page 4

Replace the default code in lib.rs with the following code. This snippet: 1. Imports the required dependencies from solana_program 2. Deﬁnes the program entrypoint using the entrypoint! macro 3. Implements the process_instruction function that will route instructions to the appropriate handler functions The entrypoint! macro requires a function with the the following type signature as an argument: pub unsafe extern "C" fn entrypoint(input: *mut u8) -> u64; lib.rs use solana_program::{ account_info::{next_account_info, AccountInfo}, entrypoint, entrypoint::ProgramResult, msg, program::invoke, program_error::ProgramError, pubkey::Pubkey, system_instruction, sysvar::{rent::Rent, Sysvar}, }; entrypoint!(process_instruction); pub fn process_instruction( program_id: &Pubkey, accounts: &[AccountInfo], instruction_data: &[u8], ) -> ProgramResult { // Your program logic Ok(()) } 2/8/25, 6:02 PM Rust Program Structure | Solana https://solana.com/docs/programs/rust/program-structure 4/15


---

### Page 5

When a Solana program is invoked, the entrypoint deserializes the input data (provided as bytes) into three values and passes them to the process_instruction function: program_id: The public key of the program being invoked (current program) accounts: The AccountInfo for accounts required by the instruction being invoked instruction_data: Additional data passed to the program which speciﬁes the instruction to execute and its required arguments These three parameters directly correspond to the data that clients must provide when building an instruction to invoke a program. Deﬁne Program State When building a Solana program, you'll typically start by deﬁning your program's state - the data that will be stored in accounts created and owned by your program. Program state is deﬁned using Rust structs that represent the data layout of your program's accounts. You can deﬁne multiple structs to represent different types of accounts for your program. When working with accounts, you need a way to convert your program's data types to and from the raw bytes stored in an account's data ﬁeld: Serialization: Converting your data types into bytes to store in an account's data ﬁeld Deserialization: Converting the bytes stored in an account back into your data types pub type ProcessInstruction = fn(program_id: &Pubkey, accounts: &[AccountInfo], instruction_data: 3 2/8/25, 6:02 PM Rust Program Structure | Solana https://solana.com/docs/programs/rust/program-structure 5/15


---

### Page 6

While you can use any serialization format for Solana program development, Borsh is commonly used. To use Borsh in your Solana program: 1. Add the borsh crate as a dependency to your Cargo.toml: 2. Import the Borsh traits and use the derive macro to implement the traits for your structs: Add the CounterAccount struct to lib.rs to deﬁne the program state. This struct will be used in both the initialization and increment instructions. Terminal cargo add borsh use borsh::{BorshSerialize, BorshDeserialize}; // Define struct representing our counter account's data #[derive(BorshSerialize, BorshDeserialize, Debug)] pub struct CounterAccount { count: u64, } lib.rs use solana_program::{ account_info::{next_account_info, AccountInfo}, entrypoint, entrypoint::ProgramResult, msg, program::invoke, program_error::ProgramError, pubkey::Pubkey, system_instruction, sysvar::{rent::Rent, Sysvar}, }; use borsh::{BorshSerialize, BorshDeserialize}; 2/8/25, 6:02 PM Rust Program Structure | Solana https://solana.com/docs/programs/rust/program-structure 6/15


---

### Page 7

Deﬁne Instructions Instructions refer to the different operations that your Solana program can perform. Think of them as public APIs for your program - they deﬁne what actions users can take when interacting with your program. Instructions are typically deﬁned using a Rust enum where: Each enum variant represents a different instruction The variant's payload represents the instruction's parameters Note that Rust enum variants are implicitly numbered starting from 0. Below is an example of an enum deﬁning two instructions: When a client invokes your program, they must provide instruction data (as a buffer of bytes) where: entrypoint!(process_instruction); pub fn process_instruction( program_id: &Pubkey, accounts: &[AccountInfo], instruction_data: &[u8], ) -> ProgramResult { // Your program logic Ok(()) } #[derive(BorshSerialize, BorshDeserialize, Debug)] pub struct CounterAccount { count: u64, } 4 #[derive(BorshSerialize, BorshDeserialize, Debug)] pub enum CounterInstruction { InitializeCounter { initial_value: u64 }, // variant 0 IncrementCounter, // variant 1 } 2/8/25, 6:02 PM Rust Program Structure | Solana https://solana.com/docs/programs/rust/program-structure 7/15


---

### Page 8

The ﬁrst byte identiﬁes which instruction variant to execute (0, 1, etc.) The remaining bytes contain the serialized instruction parameters (if required) To convert the instruction data (bytes) into a variant of the enum, it is common to implement a helper method. This method: 1. Splits the ﬁrst byte to get the instruction variant 2. Matches on the variant and parses any additional parameters from the remaining bytes 3. Returns the corresponding enum variant For example, the unpack method for the CounterInstruction enum: Add the following code to lib.rs to deﬁne the instructions for the counter program. impl CounterInstruction { pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> { // Get the instruction variant from the first byte let (&variant, rest) = input .split_first() .ok_or(ProgramError::InvalidInstructionData)?; // Match instruction type and parse the remaining bytes based on match variant { 0 => { // For InitializeCounter, parse a u64 from the remaining let initial_value = u64::from_le_bytes( rest.try_into() .map_err(|_| ProgramError::InvalidInstructionDat ); Ok(Self::InitializeCounter { initial_value }) } 1 => Ok(Self::IncrementCounter), // No additional data neede _ => Err(ProgramError::InvalidInstructionData), } } } 2/8/25, 6:02 PM Rust Program Structure | Solana https://solana.com/docs/programs/rust/program-structure 8/15


---

### Page 9

Instruction Handlers Instruction handlers refer to the functions that contain the business logic for each instruction. It's common to name handler functions as process_<instruction_name>, but you're free to choose any naming convention. Add the following code to lib.rs. This code uses the CounterInstruction enum and unpack method deﬁned in the previous step to route incoming instructions to the appropriate handler functions: lib.rs use borsh::{BorshDeserialize, BorshSerialize}; use solana_program::{ account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, ms program_error::ProgramError, pubkey::Pubkey, }; entrypoint!(process_instruction); pub fn process_instruction( program_id: &Pubkey, accounts: &[AccountInfo], instruction_data: &[u8], ) -> ProgramResult { // Your program logic Ok(()) } #[derive(BorshSerialize, BorshDeserialize, Debug)] pub enum CounterInstruction { InitializeCounter { initial_value: u64 }, // variant 0 IncrementCounter, // variant 1 } impl CounterInstruction { pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> { // Get the instruction variant from the first byte let (&variant, rest) = input .split_first() .ok_or(ProgramError::InvalidInstructionData)?; 5 2/8/25, 6:02 PM Rust Program Structure | Solana https://solana.com/docs/programs/rust/program-structure 9/15


---

### Page 10

Next, add the implementation of the process_initialize_counter function. This instruction handler: 1. Creates and allocates space for a new account to store the counter data 2. Initializing the account data with initial_value passed to the instruction lib.rs entrypoint!(process_instruction); pub fn process_instruction( program_id: &Pubkey, accounts: &[AccountInfo], instruction_data: &[u8], ) -> ProgramResult { // Unpack instruction data let instruction = CounterInstruction::unpack(instruction_data)?; // Match instruction type match instruction { CounterInstruction::InitializeCounter { initial_value } => { process_initialize_counter(program_id, accounts, initial_val } CounterInstruction::IncrementCounter => process_increment_counte }; } fn process_initialize_counter( program_id: &Pubkey, accounts: &[AccountInfo], initial_value: u64, ) -> ProgramResult { // Implementation details... Ok(()) } fn process_increment_counter(program_id: &Pubkey, accounts: &[AccountInf Explanation lib.rs 2/8/25, 6:02 PM Rust Program Structure | Solana https://solana.com/docs/programs/rust/program-structure 10/15


---

### Page 11

Next, add the implementation of the process_increment_counter function. This instruction increments the value of an existing counter account. // Initialize a new counter account fn process_initialize_counter( program_id: &Pubkey, accounts: &[AccountInfo], initial_value: u64, ) -> ProgramResult { let accounts_iter = &mut accounts.iter(); let counter_account = next_account_info(accounts_iter)?; let payer_account = next_account_info(accounts_iter)?; let system_program = next_account_info(accounts_iter)?; // Size of our counter account let account_space = 8; // Size in bytes to store a u64 // Calculate minimum balance for rent exemption let rent = Rent::get()?; let required_lamports = rent.minimum_balance(account_space); // Create the counter account invoke( &system_instruction::create_account( payer_account.key, // Account paying for the new account counter_account.key, // Account to be created required_lamports, // Amount of lamports to transfer to t account_space as u64, // Size in bytes to allocate for the d program_id, // Set program owner to our program ), &[ () Explanation lib.rs // Update an existing counter's value fn process_increment_counter(program_id: &Pubkey, accounts: &[AccountInf let accounts_iter = &mut accounts.iter(); let counter_account = next_account_info(accounts_iter)?; // Verify account ownership 2/8/25, 6:02 PM Rust Program Structure | Solana https://solana.com/docs/programs/rust/program-structure 11/15


---

### Page 12

Instruction Testing To test the program instructions, add the following dependencies to Cargo.toml. Then add the following test module to lib.rs and run cargo test-sbf to execute the tests. Optionally, use the --nocapture ﬂag to see the print statements in the output. if counter_account.owner != program_id { return Err(ProgramError::IncorrectProgramId); } // Mutable borrow the account data let mut data = counter_account.data.borrow_mut(); // Deserialize the account data into our CounterAccount struct let mut counter_data: CounterAccount = CounterAccount::try_from_slic // Increment the counter value counter_data.count = counter_data .count .checked_add(1) .ok_or(ProgramError::InvalidAccountData)?; // Serialize the updated counter data back into the account counter_data.serialize(&mut &mut data[..])?; msg!("Counter incremented to: {}", counter_data.count); Ok(()) } 6 Terminal cargo add solana-program-test@1.18.26 --dev cargo add solana-sdk@1.18.26 --dev cargo add tokio --dev Terminal 2/8/25, 6:02 PM Rust Program Structure | Solana https://solana.com/docs/programs/rust/program-structure 12/15


---

### Page 13

Example output: cargo test-sbf -- --nocapture Explanation lib.rs #[cfg(test)] mod test { use super::*; use solana_program_test::*; use solana_sdk::{ instruction::{AccountMeta, Instruction}, signature::{Keypair, Signer}, system_program, transaction::Transaction, }; #[tokio::test] async fn test_counter_program() { let program_id = Pubkey::new_unique(); let (mut banks_client, payer, recent_blockhash) = ProgramTest::n "counter_program", program_id, processor!(process_instruction), ) .start() .await; // Create a new keypair to use as the address for our counter ac let counter_keypair = Keypair::new(); let initial_value: u64 = 42; // Step 1: Initialize the counter println!("Testing counter initialization..."); Terminal 2/8/25, 6:02 PM Rust Program Structure | Solana https://solana.com/docs/programs/rust/program-structure 13/15


---

### Page 14

Last updated on 2/4/2025 Loading comments… Previous Rust Programs Next Deploying Programs Managed by SOLANA GET CONNECTED running 1 test [2024-10-29T20:51:13.783708000Z INFO solana_program_test] "counter_prog [2024-10-29T20:51:13.855204000Z DEBUG solana_runtime::message_processor: [2024-10-29T20:51:13.856052000Z DEBUG solana_runtime::message_processor: [2024-10-29T20:51:13.856135000Z DEBUG solana_runtime::message_processor: [2024-10-29T20:51:13.856242000Z DEBUG solana_runtime::message_processor: [2024-10-29T20:51:13.856285000Z DEBUG solana_runtime::message_processor: [2024-10-29T20:51:13.856307000Z DEBUG solana_runtime::message_processor: [2024-10-29T20:51:13.860038000Z DEBUG solana_runtime::message_processor: [2024-10-29T20:51:13.860333000Z DEBUG solana_runtime::message_processor: [2024-10-29T20:51:13.860355000Z DEBUG solana_runtime::message_processor: [2024-10-29T20:51:13.860375000Z DEBUG solana_runtime::message_processor: test test::test_counter_program ... ok test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered o 2/8/25, 6:02 PM Rust Program Structure | Solana https://solana.com/docs/programs/rust/program-structure 14/15


---

### Page 15

Grants Break Solana Media Kit Careers Disclaimer Privacy Policy Blog Newsletter EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 6:02 PM Rust Program Structure | Solana https://solana.com/docs/programs/rust/program-structure 15/15


---

# Program Examples _ Solana.pdf

### Page 1

Solana Documentation Developing Programs Program Examples The Solana Program Examples repository on GitHub offers several subfolders, each containing code examples for different Solana programming paradigms and languages, designed to help developers learn and experiment with Solana blockchain development. You can ﬁnd the examples in the solana-developers/program-examples together with README ﬁles that explain you how to run the different examples. Most examples are self-contained and are available in native Rust (ie, with no framework) and Anchor. It also contains a list of examples that we would love to see as contributions. Within the repo you will ﬁnd the following subfolder, each with assorted example programs within them: Basics Compression Oracles Tokens Token 2022 (Token Extensions) Break Build and Run Documentation API Cookbook Courses Guides Get Support Table of Contents Basics 2/8/25, 6:03 PM Program Examples | Solana https://solana.com/docs/programs/examples 1/8


---

### Page 2

Basics Contains a series of examples that demonstrate the foundational steps for building Solana programs using native Rust libraries. These examples are designed to help developers understand the core concepts of Solana programming. Example Name Description Language Account Data Saving an address with name, house number, street and city in an account. Native, Anchor Checking Accounts Security lessons that shows how to do account checks Native, Anchor Close Account Show you how to close accounts to get its rent back. Native, Anchor Counter A simple counter program in all the different architectures. Native, Anchor, mpl-stack Create Account How to create a system account within a program. Native, Anchor Cross Program Invocation Using a hand and lever analogy this shows you how to call another program from within a program. Native, Anchor hello solana Hello world example which just prints hello world in the transaction logs. Native, Anchor Pda Rent payer Shows you how you can use the lamports from a PDA to pay for a new account. Native, Anchor Processing Instructions Shows you how to handle instruction data string and u32. Native, Anchor Program Derived Addresses Shows how to use seeds to refer to a PDA and save data in it. Native, Anchor 2/8/25, 6:03 PM Program Examples | Solana https://solana.com/docs/programs/examples 2/8


---

### Page 3

Compression Contains a series of examples that demonstrate how to use state compression on Solana. Mainly focused on compressed NFTs (cNFTs). Oracles Example Name Description Language Realloc Shows you how to increase and decrease the size of an existing account. Native, Anchor Rent Here you will learn how to calculate rent requirements within a program. Native, Anchor Repository Layout Recommendations on how to structure your program layout. Native, Anchor Transfer SOL Different methods of transferring SOL for system accounts and PDAs. Native, Anchor, Seahorse Example Name Description Language cNFT-burn To destroy a cNFT it can be burnt. This examples shows how to do that in a program. Anchor cNFT-Vault How to custody a cNFT in a program and send it out again. Anchor cutils A suite utils to for example mint and verify cNFTs in a program. Anchor 2/8/25, 6:03 PM Program Examples | Solana https://solana.com/docs/programs/examples 3/8


---

### Page 4

Oracles allow to use off chain data in programs. Tokens Most tokens on Solana use the Solana Program Library (SPL) token standard. Here you can ﬁnd many examples on how to mint, transfer, burn tokens and even how to interact with them in programs. Example Name Description Language Pyth Pyth makes price data of tokens available in on chain programs. Anchor Example Name Description Language Create Token How to create a token and add metaplex metadata to it. Anchor, Native NFT Minter Minting only one amount of a token and then removing the mint authority. Anchor, Native PDA Mint Authority Shows you how to change the mint authority of a mint, to mint tokens from within a program. Anchor, Native SPL Token Minter Explains how to use Associated Token Accounts to be able to keep track of token accounts. Anchor, Native Token Swap Extensive example that shows you how to build an AMM (automated market maker) pool for SPL tokens. Anchor 2/8/25, 6:03 PM Program Examples | Solana https://solana.com/docs/programs/examples 4/8


---

### Page 5

Token 2022 (Token Extensions) Token 2022 is a new standard for tokens on Solana. It is a more ﬂexible and lets you add 16 different extensions to a token mint to add more functionality to it. A full list of the extensions can be found in the Getting Started Guide Example Name Description Language Transfer Tokens Shows how to transfer SPL token using CPIs into the token program. Anchor, Native Token-2022 See Token 2022 (Token extensions). Anchor, Native Example Name Description Language Basics How to create a token, mint and transfer it. Anchor Default account state This extension lets you create token accounts with a certain state, for example frozen. Native Mint Close Authority With the old token program it was not possible to close a mint. Now it is. Native Multiple Extensions Shows you how you can add multiple extensions to a single mint Native NFT Metadata pointer It is possible to use the metadata extension to create NFTs and add dynamic on chain metadata. Anchor 2/8/25, 6:03 PM Program Examples | Solana https://solana.com/docs/programs/examples 5/8


---

### Page 6

Break Break is a React app that gives users a visceral feeling for just how fast and high- performance the Solana network really is. Can you break the Solana blockchain? During a 15 second play-through, each click of a button or keystroke sends a new transaction to the cluster. Smash the keyboard as fast as you can and watch your transactions get ﬁnalized in real-time while the network takes it all in stride! Break can be played on our Devnet, Testnet and Mainnet Beta networks. Plays are free on Devnet and Testnet, where the session is funded by a network faucet. On Mainnet Beta, users pay to play 0.08 SOL per game. The session account can be funded by a local keystore wallet or by scanning a QR code from Trust Wallet to transfer the tokens. Click here to play Break Build and Run First fetch the latest version of the example code: Example Name Description Language Not Transferable Useful for example for achievements, referral programs or any soul bound tokens. Native Transfer fee Every transfer of the tokens hold some tokens back in the token account which can then be collected. Native Transfer Hook Four examples to add additional functionality to your token using a CPI from the token program into your program. Anchor 2/8/25, 6:03 PM Program Examples | Solana https://solana.com/docs/programs/examples 6/8


---

### Page 7

Next, follow the steps in the git repository's README. Last updated on 2/5/2025 Loading comments… Previous Deploying Programs Next Limitations Managed by SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN git clone https://github.com/solana-labs/break.git cd break 2/8/25, 6:03 PM Program Examples | Solana https://solana.com/docs/programs/examples 7/8


---

### Page 8

© 2025 Solana Foundation. All rights reserved. 2/8/25, 6:03 PM Program Examples | Solana https://solana.com/docs/programs/examples 8/8


---

# Cross Program Invocation _ Solana.pdf

### Page 1

Solana Documentation Getting Started Quick Start Cross Program Invocation In this section, we'll update the CRUD program from the previous PDA section by adding Cross Program Invocations (CPIs), a feature that enables Solana programs to invoke each other. We'll also demonstrate how programs can "sign" for Program Derived Addresses (PDAs) when making Cross Program Invocations. We'll modify the update and delete instructions to handle SOL transfers between accounts by invoking the System Program. The purpose of this section is to walk through the process of implementing CPIs in a Solana program using the Anchor framework, building upon the PDA concepts we explored in the previous section. For more details, refer to the Cross Program Invocation page. For reference, here is the ﬁnal code after completing both the PDA and CPI sections. Here is the starter code for this section, with just the PDA section completed. Modify Update Instruction First, we'll implement a simple "pay-to-update" mechanism by modifying the Update struct and update function. 1 Documentation API Cookbook Courses Guides Get Support Table of Contents Modify Update Instruction 2/8/25, 5:59 PM Cross Program Invocation | Solana https://solana.com/docs/intro/quick-start/cross-program-invocation 1/10


---

### Page 2

Begin by updating the lib.rs ﬁle to bring into scope items from the system_program module. Next, update the Update struct to include an additional account called vault_account. This account, controlled by our program, will receive SOL from a user when they update their message account. Next, implement the CPI logic in the update instruction to transfer 0.001 SOL from the user's account to the vault account. lib.rs use anchor_lang::system_program::{transfer, Transfer}; Diff lib.rs #[account( mut, seeds = [b"vault", user.key().as_ref()], bump, )] pub vault_account: SystemAccount<'info>, Diff Explanation lib.rs let transfer_accounts = Transfer { from: ctx.accounts.user.to_account_info(), to: ctx.accounts.vault_account.to_account_info(), 2/8/25, 5:59 PM Cross Program Invocation | Solana https://solana.com/docs/intro/quick-start/cross-program-invocation 2/10


---

### Page 3

Rebuild the program. Modify Delete Instruction We'll now implement a "refund on delete" mechanism by modifying the Delete struct and delete function. First, update the Delete struct to include the vault_account. This allows us to transfer any SOL in the vault back to the user when they close their message account. }; let cpi_context = CpiContext::new( ctx.accounts.system_program.to_account_info(), transfer_accounts, ); transfer(cpi_context, 1_000_000)?; Diff Explanation Terminal build 2 lib.rs #[account( mut, seeds = [b"vault", user.key().as_ref()], bump, )] pub vault_account: SystemAccount<'info>, 2/8/25, 5:59 PM Cross Program Invocation | Solana https://solana.com/docs/intro/quick-start/cross-program-invocation 3/10


---

### Page 4

Also add the system_program as the CPI for the transfer requires invoking the System Program. Next, implement the CPI logic in the delete instruction to transfer SOL from the vault account back to the user's account. Note that we updated _ctx: Context<Delete> to ctx: Context<Delete> as we'll be using the context in the body of the function. lib.rs pub system_program: Program<'info, System>, Diff Explanation lib.rs let user_key = ctx.accounts.user.key(); let signer_seeds: &[&[&[u8]]] = &[&[b"vault", user_key.as_ref(), &[ctx.bumps.vault_account]]]; let transfer_accounts = Transfer { from: ctx.accounts.vault_account.to_account_info(), to: ctx.accounts.user.to_account_info(), }; let cpi_context = CpiContext::new( ctx.accounts.system_program.to_account_info(), transfer_accounts, ).with_signer(signer_seeds); transfer(cpi_context, ctx.accounts.vault_account.lamports())?; Diff Explanation 2/8/25, 5:59 PM Cross Program Invocation | Solana https://solana.com/docs/intro/quick-start/cross-program-invocation 4/10


---

### Page 5

Rebuild the program. Redeploy Program After making these changes, we need to redeploy our updated program. This ensures that our modiﬁed program is available for testing. On Solana, updating a program simply requires deploying the program at the same program ID. Ensure your Playground wallet has devnet SOL. Get devnet SOL from the Solana Faucet. Update Test File Next, we'll update our anchor.test.ts ﬁle to include the new vault account in our instructions. This requires deriving the vault PDA and including it in our update and delete instruction calls. Derive Vault PDA First, add the vault PDA derivation: Terminal build 3 Terminal deploy Output Explanation 4 2/8/25, 5:59 PM Cross Program Invocation | Solana https://solana.com/docs/intro/quick-start/cross-program-invocation 5/10


---

### Page 6

Modify Update Test Then, update the update instruction to include the vaultAccount. Modify Delete Test Then, update the delete instruction to include the vaultAccount. anchor.test.ts const [vaultPda, vaultBump] = PublicKey.findProgramAddressSync( [Buffer.from("vault"), wallet.publicKey.toBuffer()], program.programId, ); Diff anchor.test.ts const transactionSignature = await program.methods .update(message) .accounts({ messageAccount: messagePda, vaultAccount: vaultPda, }) .rpc({ commitment: "confirmed" }); Diff anchor.test.ts const transactionSignature = await program.methods .delete() .accounts({ messageAccount: messagePda, vaultAccount: vaultPda, 2/8/25, 5:59 PM Cross Program Invocation | Solana https://solana.com/docs/intro/quick-start/cross-program-invocation 6/10


---

### Page 7

Rerun Test After making these changes, run the tests to ensure everything is working as expected: You can then inspect the SolanaFM links to view the transaction details, where you'll ﬁnd the CPIs for the transfer instructions within the update and delete instructions. }) .rpc({ commitment: "confirmed" }); Diff 5 Terminal test Output 2/8/25, 5:59 PM Cross Program Invocation | Solana https://solana.com/docs/intro/quick-start/cross-program-invocation 7/10


---

### Page 8

Next Steps Congratulations on completing the Solana Quickstart guide! You've gained hands-on experience with key Solana concepts including: Update CPI Delete CPI If you encounter any errors, you can reference the ﬁnal code. 2/8/25, 5:59 PM Cross Program Invocation | Solana https://solana.com/docs/intro/quick-start/cross-program-invocation 8/10


---

### Page 9

Fetching and reading data from accounts Building and sending transactions Deploying and updating Solana programs Working with Program Derived Addresses (PDAs) Making Cross-Program Invocations (CPIs) To deepen your understanding of these concepts, check out the Core Concepts documentation which provides detailed explanations of the topics covered in this guide. Explore More Examples If you prefer learning by example, check out the Program Examples Repository for a variety of example programs. Solana Playground offers a convenient feature allowing you to import or view projects using their GitHub links. For example, open this Solana Playground link to view the Anchor project from this Github repo. Click the Import button and enter a project name to add it to your list of projects in Solana Playground. Once a project is imported, all changes are automatically saved and persisted. Last updated on 2/4/2025 Previous Next Managed by 2/8/25, 5:59 PM Cross Program Invocation | Solana https://solana.com/docs/intro/quick-start/cross-program-invocation 9/10


---

### Page 10

Creating Deterministic Accounts InstallationSOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 5:59 PM Cross Program Invocation | Solana https://solana.com/docs/intro/quick-start/cross-program-invocation 10/10


---

# Retrying Transactions _ Solana.pdf

### Page 1

Solana Documentation Advanced Topics Retrying Transactions Retrying Transactions On some occasions, a seemingly valid transaction may be dropped before it is included in a block. This most often occurs during periods of network congestion, when an RPC node fails to rebroadcast the transaction to the leader. To an end-user, it may appear as if their transaction disappears entirely. While RPC nodes are equipped with a generic rebroadcasting algorithm, application developers are also capable of developing their own custom rebroadcasting logic. TLDR; RPC nodes will attempt to rebroadcast transactions using a generic algorithm Application developers can implement their own custom rebroadcasting logic Developers should take advantage of the maxRetries parameter on the sendTransaction JSON-RPC method Developers should enable preﬂight checks to raise errors before transactions are submitted Before re-signing any transaction, it is very important to ensure that the initial transaction's blockhash has expired Documentation API Cookbook Courses Guides Get Support Table of Contents Retrying Transactions 2/8/25, 5:43 PM Retrying Transactions | Solana https://solana.com/docs/advanced/retry 1/11


---

### Page 2

The Journey of a Transaction How Clients Submit Transactions In Solana, there is no concept of a mempool. All transactions, whether they are initiated programmatically or by an end-user, are efficiently routed to leaders so that they can be processed into a block. There are two main ways in which a transaction can be sent to leaders: 1. By proxy via an RPC server and the sendTransaction JSON-RPC method 2. Directly to leaders via a TPU Client The vast majority of end-users will submit transactions via an RPC server. When a client submits a transaction, the receiving RPC node will in turn attempt to broadcast the transaction to both the current and next leaders. Until the transaction is processed by a leader, there is no record of the transaction outside of what the client and the relaying RPC nodes are aware of. In the case of a TPU client, rebroadcast and leader forwarding is handled entirely by the client software. Overview of a transactions journey, from client to leader 2/8/25, 5:43 PM Retrying Transactions | Solana https://solana.com/docs/advanced/retry 2/11


---

### Page 3

How RPC Nodes Broadcast Transactions After an RPC node receives a transaction via sendTransaction, it will convert the transaction into a UDP packet before forwarding it to the relevant leaders. UDP allows validators to quickly communicate with one another, but does not provide any guarantees regarding transaction delivery. Because Solana's leader schedule is known in advance of every epoch (~2 days), an RPC node will broadcast its transaction directly to the current and next leaders. This is in contrast to other gossip protocols such as Ethereum that propagate transactions randomly and broadly across the entire network. By default, RPC nodes will try to forward transactions to leaders every two seconds until either the transaction is ﬁnalized or the transaction's blockhash expires (150 blocks or ~1 minute 19 seconds as of the time of this writing). If the outstanding rebroadcast queue size is greater than 10,000 transactions, newly submitted transactions are dropped. There are command-line arguments that RPC operators can adjust to change the default behavior of this retry logic. When an RPC node broadcasts a transaction, it will attempt to forward the transaction to a leader's Transaction Processing Unit (TPU). The TPU processes transactions in ﬁve distinct phases: Fetch Stage SigVerify Stage Banking Stage Proof of History Service Broadcast Stage 2/8/25, 5:43 PM Retrying Transactions | Solana https://solana.com/docs/advanced/retry 3/11


---

### Page 4

Overview of the Transaction Processing Unit (TPU) Of these ﬁve phases, the Fetch Stage is responsible for receiving transactions. Within the Fetch Stage, validators will categorize incoming transactions according to three ports: tpu handles regular transactions such as token transfers, NFT mints, and program instructions tpu_vote focuses exclusively on voting transactions tpu_forwards forwards unprocessed packets to the next leader if the current leader is unable to process all transactions For more information on the TPU, please refer to this excellent writeup by Jito Labs. How Transactions Get Dropped Throughout a transaction's journey, there are a few scenarios in which the transaction can be unintentionally dropped from the network. 2/8/25, 5:43 PM Retrying Transactions | Solana https://solana.com/docs/advanced/retry 4/11


---

### Page 5

Before a transaction is processed If the network drops a transaction, it will most likely do so before the transaction is processed by a leader. UDP packet loss is the simplest reason why this might occur. During times of intense network load, it's also possible for validators to become overwhelmed by the sheer number of transactions required for processing. While validators are equipped to forward surplus transactions via tpu_forwards, there is a limit to the amount of data that can be forwarded. Furthermore, each forward is limited to a single hop between validators. That is, transactions received on the tpu_forwards port are not forwarded on to other validators. There are also two lesser known reasons why a transaction may be dropped before it is processed. The ﬁrst scenario involves transactions that are submitted via an RPC pool. Occasionally, part of the RPC pool can be sufficiently ahead of the rest of the pool. This can cause issues when nodes within the pool are required to work together. In this example, the transaction's recentBlockhash is queried from the advanced part of the pool (Backend A). When the transaction is submitted to the lagging part of the pool (Backend B), the nodes will not recognize the advanced blockhash and will drop the transaction. This can be detected upon transaction submission if developers enable preﬂight checks on sendTransaction. Transaction dropped via an RPC Pool 2/8/25, 5:43 PM Retrying Transactions | Solana https://solana.com/docs/advanced/retry 5/11


---

### Page 6

Temporary network forks can also result in dropped transactions. If a validator is slow to replay its blocks within the Banking Stage, it may end up creating a minority fork. When a client builds a transaction, it's possible for the transaction to reference a recentBlockhash that only exists on the minority fork. After the transaction is submitted, the cluster can then switch away from its minority fork before the transaction is processed. In this scenario, the transaction is dropped due to the blockhash not being found. Transaction dropped due to minority fork (before processed) After a transaction is processed and before it is ﬁnalized In the event a transaction references a recentBlockhash from a minority fork, it's still possible for the transaction to be processed. In this case, however, it would be processed by the leader on the minority fork. When this leader attempts to share its processed transactions with the rest of the network, it would fail to reach consensus with the majority of validators that do not recognize the minority fork. At this time, the transaction would be dropped before it could be ﬁnalized. 2/8/25, 5:43 PM Retrying Transactions | Solana https://solana.com/docs/advanced/retry 6/11


---

### Page 7

Transaction dropped due to minority fork (after processed) Handling Dropped Transactions While RPC nodes will attempt to rebroadcast transactions, the algorithm they employ is generic and often ill-suited for the needs of speciﬁc applications. To prepare for times of network congestion, application developers should customize their own rebroadcasting logic. An In-Depth Look at sendTransaction When it comes to submitting transactions, the sendTransaction RPC method is the primary tool available to developers. sendTransaction is only responsible for relaying a transaction from a client to an RPC node. If the node receives the transaction, sendTransaction will return the transaction id that can be used to track the transaction. A successful response does not indicate whether the transaction will be processed or ﬁnalized by the cluster. Request Parameters 2/8/25, 5:43 PM Retrying Transactions | Solana https://solana.com/docs/advanced/retry 7/11


---

### Page 8

transaction: string - fully-signed Transaction, as encoded string (optional) configuration object: object skipPreflight: boolean - if true, skip the preﬂight transaction checks (default: false) (optional) preflightCommitment: string - Commitment level to use for preﬂight simulations against the bank slot (default: "ﬁnalized"). (optional) encoding: string - Encoding used for the transaction data. Either "base58" (slow), or "base64". (default: "base58"). (optional) maxRetries: usize - Maximum number of times for the RPC node to retry sending the transaction to the leader. If this parameter is not provided, the RPC node will retry the transaction until it is ﬁnalized or until the blockhash expires. Response: transaction id: string - First transaction signature embedded in the transaction, as base-58 encoded string. This transaction id can be used with getSignatureStatuses to poll for status updates. Customizing Rebroadcast Logic In order to develop their own rebroadcasting logic, developers should take advantage of sendTransaction's maxRetries parameter. If provided, maxRetries will override an RPC node's default retry logic, allowing developers to manually control the retry process within reasonable bounds. A common pattern for manually retrying transactions involves temporarily storing the lastValidBlockHeight that comes from getLatestBlockhash. Once stashed, an application can then poll the cluster's blockheight and manually retry the transaction at an appropriate interval. In times of network congestion, it's advantageous to set maxRetries to 0 and manually rebroadcast via a custom algorithm. While some applications may employ an exponential backoff algorithm, others such as Mango 2/8/25, 5:43 PM Retrying Transactions | Solana https://solana.com/docs/advanced/retry 8/11


---

### Page 9

opt to continuously resubmit transactions at a constant interval until some timeout has occurred. When polling via getLatestBlockhash, applications should specify their intended commitment level. By setting its commitment to confirmed (voted on) or finalized (~30 blocks after confirmed), an application can avoid polling a blockhash from a minority fork. If an application has access to RPC nodes behind a load balancer, it can also choose to divide its workload amongst speciﬁc nodes. RPC nodes that serve data-intensive requests such as getProgramAccounts may be prone to falling behind and can be ill- suited for also forwarding transactions. For applications that handle time-sensitive import { Keypair, Connection, LAMPORTS_PER_SOL, SystemProgram, Transaction, } from "@solana/web3.js"; import * as nacl from "tweetnacl"; const sleep = async (ms: number) => { return new Promise(r => setTimeout(r, ms)); }; (async () => { const payer = Keypair.generate(); const toAccount = Keypair.generate().publicKey; const connection = new Connection("http://127.0.0.1:8899", "confirmed"); const airdropSignature = await connection.requestAirdrop( payer.publicKey, LAMPORTS_PER_SOL, ); await connection.confirmTransaction({ signature: airdropSignature }); const blockhashResponse = await connection.getLatestBlockhash(); const lastValidBlockHeight = blockhashResponse.lastValidBlockHeight - 150; ({ 2/8/25, 5:43 PM Retrying Transactions | Solana https://solana.com/docs/advanced/retry 9/11


---

### Page 10

transactions, it may be prudent to have dedicated nodes that only handle sendTransaction. The Cost of Skipping Preﬂight By default, sendTransaction will perform three preﬂight checks prior to submitting a transaction. Speciﬁcally, sendTransaction will: Verify that all signatures are valid Check that the referenced blockhash is within the last 150 blocks Simulate the transaction against the bank slot speciﬁed by the preflightCommitment In the event that any of these three preﬂight checks fail, sendTransaction will raise an error prior to submitting the transaction. Preﬂight checks can often be the difference between losing a transaction and allowing a client to gracefully handle an error. To ensure that these common errors are accounted for, it is recommended that developers keep skipPreflight set to false. When to Re-Sign Transactions Despite all attempts to rebroadcast, there may be times in which a client is required to re-sign a transaction. Before re-signing any transaction, it is very important to ensure that the initial transaction's blockhash has expired. If the initial blockhash is still valid, it is possible for both transactions to be accepted by the network. To an end-user, this would appear as if they unintentionally sent the same transaction twice. In Solana, a dropped transaction can be safely discarded once the blockhash it references is older than the lastValidBlockHeight received from getLatestBlockhash. Developers should keep track of this lastValidBlockHeight by querying getEpochInfo and comparing with blockHeight in the response. Once a blockhash is invalidated, clients may re-sign with a newly-queried blockhash. 2/8/25, 5:43 PM Retrying Transactions | Solana https://solana.com/docs/advanced/retry 10/11


---

### Page 11

Last updated on 2/4/2025 Previous Conﬁrmation & Expiration Next Versioned TransactionsManaged by SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 5:43 PM Retrying Transactions | Solana https://solana.com/docs/advanced/retry 11/11


---

# Writing to Network _ Solana.pdf

### Page 1

Solana Documentation Getting Started Quick Start Writing to Network In the previous section, we learned how to read data from the Solana network. Now let's explore how to write data to it. Writing to the Solana network involves sending transactions that contain one or more instructions. These instructions are processed by programs (smart contracts) that contain the business logic for each respective instruction. When you submit a transaction, the Solana runtime executes each instruction in sequence and atomically (meaning either all instructions succeed or the entire transaction fails). In this section, we'll walk through two basic examples: 1. Transferring SOL between accounts 2. Creating a new token These examples demonstrate how to build and send transactions to invoke Solana programs. For more details, refer to the Transactions and Instructions and Fees on Solana pages. Transfer SOL Documentation API Cookbook Courses Guides Get Support Table of Contents Transfer SOL 2/8/25, 5:59 PM Writing to Network | Solana https://solana.com/docs/intro/quick-start/writing-to-network 1/8


---

### Page 2

Let's start with a simple example of transferring SOL between accounts. To transfer SOL from our Playground wallet, we need to invoke the System Program's transfer instruction. A key concept of Solana's account model is that only the program that owns an account can deduct an account's lamport (SOL) balance. This means if you want to transfer SOL from a wallet account, you must invoke the System Program since it is the program speciﬁed in the owner ﬁeld of the account. Open Example Click this link to open the example in Solana Playground. You'll see the following code: 1 client.ts import { LAMPORTS_PER_SOL, SystemProgram, Transaction, sendAndConfirmTransaction, Keypair, } from "@solana/web3.js"; const sender = pg.wallet.keypair; const receiver = new Keypair(); const transferInstruction = SystemProgram.transfer({ fromPubkey: sender.publicKey, toPubkey: receiver.publicKey, lamports: 0.01 * LAMPORTS_PER_SOL, }); const transaction = new Transaction().add(transferInstruction); const transactionSignature = await sendAndConfirmTransaction( pg.connection, transaction, [sender], ); console.log( 2/8/25, 5:59 PM Writing to Network | Solana https://solana.com/docs/intro/quick-start/writing-to-network 2/8


---

### Page 3

Run Example Run the code using the run command. Ensure your Playground wallet has devnet SOL. Get devnet SOL from the Solana Faucet. Click on the output link to view the transaction details on the SolanaFM explorer. Transfer SOL "Transaction Signature:", `https://solana.fm/tx/${transactionSignature}?cluster=devnet-solana`, ); Explanation 2 Terminal run Output 2/8/25, 5:59 PM Writing to Network | Solana https://solana.com/docs/intro/quick-start/writing-to-network 3/8


---

### Page 4

Create a Token Next, let's create a new token using the Token Extensions Program. This requires two invoking instructions: 1. Create a new account using the System Program 2. Initialize the account's data as a Mint using the Token Extensions Program Congratulations! You've just sent your ﬁrst transaction on Solana! Let's break down what happened: First, we created an instruction specifying what we wanted to do Then, we added that instruction to a transaction Finally, we sent the transaction to be processed by the Solana network This is the basic pattern for building transactions to interact with the programs on the Solana. Open Example Click this link to open the example in Solana Playground. You'll see the following code: 1 client.ts import { Connection, Keypair, SystemProgram, Transaction, clusterApiUrl, sendAndConfirmTransaction, } from "@solana/web3.js"; import { MINT_SIZE, TOKEN_2022_PROGRAM_ID, 2/8/25, 5:59 PM Writing to Network | Solana https://solana.com/docs/intro/quick-start/writing-to-network 4/8


---

### Page 5

Run Example Run the code using the run command. Ensure your Playground wallet has devnet SOL. Get devnet SOL from the Solana Faucet. You'll see two links printed to the Playground terminal: One for the transaction details One for the newly created mint account createInitializeMint2Instruction, getMinimumBalanceForRentExemptMint, } from "@solana/spl-token"; const wallet = pg.wallet; const connection = new Connection(clusterApiUrl("devnet"), "confirmed"); // Generate keypair to use as address of mint account const mint = new Keypair(); // Calculate minimum lamports for space required by mint account const rentLamports = await getMinimumBalanceForRentExemptMint(connection // Instruction to create new account with space for new mint account const createAccountInstruction = SystemProgram.createAccount({ fromPubkey: wallet.publicKey, newAccountPubkey: mint.publicKey, space:MINTSIZE, Explanation 2 Terminal run 2/8/25, 5:59 PM Writing to Network | Solana https://solana.com/docs/intro/quick-start/writing-to-network 5/8


---

### Page 6

Click the links to inspect the transaction details and the newly created mint account on SolanaFM. Create Token Mint Account In this example, we demonstrated how to combine multiple instructions into a single transaction. The transaction contains two key instructions: Output 2/8/25, 5:59 PM Writing to Network | Solana https://solana.com/docs/intro/quick-start/writing-to-network 6/8


---

### Page 7

Last updated on 2/4/2025 Previous Reading from Network Next Deploying Programs Managed by SOLANA Grants GET CONNECTED Blog 1. Creating a new account using the System Program 2. Initializing that account as a token mint using the Token Extensions Program This pattern of combining multiple instructions from different programs into one transaction is common when building more complex Solana transactions. It allows you to sequentially and atomically execute multiple instructions, ensuring they either all succeed or all fail together. 2/8/25, 5:59 PM Writing to Network | Solana https://solana.com/docs/intro/quick-start/writing-to-network 7/8


---

### Page 8

Break Solana Media Kit Careers Disclaimer Privacy Policy Newsletter EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 5:59 PM Writing to Network | Solana https://solana.com/docs/intro/quick-start/writing-to-network 8/8


---

# Reading from Network _ Solana.pdf

### Page 1

Solana Documentation Getting Started Quick Start Reading from Network Now, let's explore how to read data from the Solana network. We'll fetch a few different accounts to understand the structure of a Solana account. On Solana, all data is contained in what we call "accounts". You can think of data on Solana as a public database with a single "Accounts" table, where each entry in this table is an individual account with the same base Account type. Accounts Accounts on Solana can store "state" or "executable" programs, all of which can be thought of as entries in the same "Accounts" table. Each account has an "address" (public key) that serves as its unique ID used to locate its corresponding on-chain data. Documentation API Cookbook Courses Guides Get Support Table of Contents Fetch Playground Wallet 2/8/25, 5:59 PM Reading from Network | Solana https://solana.com/docs/intro/quick-start/reading-from-network 1/8


---

### Page 2

Solana accounts contain either: State: This is data that's meant to be read from and persisted. It could be information about tokens, user data, or any other type of data deﬁned within a program. Executable Programs: These are accounts that contain the actual code of Solana programs. They contain the instructions that can be executed on the network. This separation of program code and program state is a key feature of Solana's Account Model. For more details, refer to the Solana Account Model page. Fetch Playground Wallet Let's start by looking at a familiar account - your own Playground Wallet! We'll fetch this account and examine its structure to understand what a basic Solana account looks like. Open Example Click this link to open the example in Solana Playground. You'll see the following code: Run Example 1 client.ts const address = pg.wallet.publicKey; const accountInfo = await pg.connection.getAccountInfo(address); console.log(JSON.stringify(accountInfo, null, 2)); Explanation 2 2/8/25, 5:59 PM Reading from Network | Solana https://solana.com/docs/intro/quick-start/reading-from-network 2/8


---

### Page 3

Fetch Token Program Next, we'll examine the Token Extensions program, an executable program for interacting with tokens on Solana. In the Playground terminal, type the run command and hit enter: When you run the code, you'll see the account details for your wallet displayed in the terminal. The output should look similar to the following: Terminal run Output Explanation Open Example Click this link to open the example in Solana Playground. You'll see the following code: 1 client.ts import { PublicKey } from "@solana/web3.js"; const address = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxu const accountInfo = await pg.connection.getAccountInfo(address); console.log(JSON.stringify(accountInfo, null, 2)); 2/8/25, 5:59 PM Reading from Network | Solana https://solana.com/docs/intro/quick-start/reading-from-network 3/8


---

### Page 4

Fetch Mint Account In this step, we'll examine a Mint account, which represents a unique token on the Solana network. Instead of fetching your Playground wallet, here we fetch the Token Extensions Program account. Run Example Run the code using the run command in the terminal. Examine the output and how this program account differs from your wallet account. 2 Terminal run Output Explanation Open Example Click this link to open the example in Solana Playground. You'll see the following code: 1 client.ts import { PublicKey } from "@solana/web3.js"; const address = new PublicKey("C33qt1dZGZSsqTrHdtLKXPZNoxs6U1ZBfyDkzmj6m 2/8/25, 5:59 PM Reading from Network | Solana https://solana.com/docs/intro/quick-start/reading-from-network 4/8


---

### Page 5

In this example, we'll fetch the address of an existing Mint account on devnet. Run Example Run the code using the run command. Deserialize Mint Account Data An account's data ﬁeld contains bytes that need to be further deserialized into the expected data type. The structure of this data is deﬁned by the program that owns the account. To help with deserialization, most program developers provide helper functions in their client libraries that handle converting the raw bytes into the appropriate data type. For example, the @solana/spl-token library provides functions like getMint() to help deserialize a token mint account's bytes into the Mint data type. Open this next example in Solana Playground. You'll see the following code: const accountInfo = await pg.connection.getAccountInfo(address); console.log(JSON.stringify(accountInfo, null, 2)); 2 Terminal run Output Explanation 3 2/8/25, 5:59 PM Reading from Network | Solana https://solana.com/docs/intro/quick-start/reading-from-network 5/8


---

### Page 6

This example uses the getMint helper function to automatically deserialize the data ﬁeld of the Mint account. Run the code using the run command. You should see the following deserialized Mint account data. client.ts import { PublicKey } from "@solana/web3.js"; import { getMint, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token"; const address = new PublicKey("C33qt1dZGZSsqTrHdtLKXPZNoxs6U1ZBfyDkzmj6m const mintData = await getMint( pg.connection, address, "confirmed", TOKEN_2022_PROGRAM_ID, ); console.log( JSON.stringify( mintData, (key, value) => { // Convert BigInt to String if (typeof value === "bigint") { return value.toString(); } // Handle Buffer objects if (Buffer.isBuffer(value)) { return `<Buffer ${value.toString("hex")}>`; } return value; }, 2, ), ); Terminal run 2/8/25, 5:59 PM Reading from Network | Solana https://solana.com/docs/intro/quick-start/reading-from-network 6/8


---

### Page 7

Last updated on 2/4/2025 Loading comments… Previous Quick Start Next Writing to Network Managed by SOLANA Grants Break Solana Media Kit Careers Disclaimer GET CONNECTED Blog Newsletter Output Explanation 2/8/25, 5:59 PM Reading from Network | Solana https://solana.com/docs/intro/quick-start/reading-from-network 7/8


---

### Page 8

Privacy Policy EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 5:59 PM Reading from Network | Solana https://solana.com/docs/intro/quick-start/reading-from-network 8/8


---

# Transaction Confirmation & Expiration _ Solana.pdf

### Page 1

Solana Documentation Advanced Topics Transaction Confirmation & Expiration Problems relating to transaction conﬁrmation are common with many newer developers while building applications. This article aims to boost the overall understanding of the conﬁrmation mechanism used on the Solana blockchain, including some recommended best practices. Brief background on transactions Before diving into how Solana transaction conﬁrmation and expiration works, let's brieﬂy set the base understanding of a few things: what a transaction is the lifecycle of a transaction what a blockhash is and a brief understanding of Proof of History (PoH) and how it relates to blockhashes What is a transaction? Transactions consist of two components: a message and a list of signatures. The transaction message is where the magic happens and at a high level it consists of Documentation API Cookbook Courses Guides Get Support Table of Contents Brief background on transactions 2/8/25, 5:43 PM Transaction Conﬁrmation & Expiration | Solana https://solana.com/docs/advanced/conﬁrmation 1/12


---

### Page 2

four components: a header with metadata about the transaction, a list of instructions to invoke, a list of accounts to load, and a “recent blockhash.” In this article, we're going to be focusing a lot on a transaction's recent blockhash because it plays a big role in transaction conﬁrmation. Transaction lifecycle refresher Below is a high level view of the lifecycle of a transaction. This article will touch on everything except steps 1 and 4. 1. Create a header and a list of instructions along with the list of accounts that instructions need to read and write 2. Fetch a recent blockhash and use it to prepare a transaction message 3. Simulate the transaction to ensure it behaves as expected 4. Prompt user to sign the prepared transaction message with their private key 5. Send the transaction to an RPC node which attempts to forward it to the current block producer 6. Hope that a block producer validates and commits the transaction into their produced block 7. Conﬁrm the transaction has either been included in a block or detect when it has expired What is a Blockhash? A “blockhash” refers to the last Proof of History (PoH) hash for a “slot” (description below). Since Solana uses PoH as a trusted clock, a transaction's recent blockhash can be thought of as a timestamp. 2/8/25, 5:43 PM Transaction Conﬁrmation & Expiration | Solana https://solana.com/docs/advanced/conﬁrmation 2/12


---

### Page 3

Proof of History refresher Solana's Proof of History mechanism uses a very long chain of recursive SHA-256 hashes to build a trusted clock. The “history” part of the name comes from the fact that block producers hash transaction id's into the stream to record which transactions were processed in their block. PoH hash calculation: next_hash = hash(prev_hash, hash(transaction_ids)) PoH can be used as a trusted clock because each hash must be produced sequentially. Each produced block contains a blockhash and a list of hash checkpoints called “ticks” so that validators can verify the full chain of hashes in parallel and prove that some amount of time has actually passed. Transaction Expiration By default, all Solana transactions will expire if not committed to a block in a certain amount of time. The vast majority of transaction conﬁrmation issues are related to how RPC nodes and validators detect and handle expired transactions. A solid understanding of how transaction expiration works should help you diagnose the bulk of your transaction conﬁrmation issues. How does transaction expiration work? Each transaction includes a “recent blockhash” which is used as a PoH clock timestamp and expires when that blockhash is no longer “recent enough”. As each block is ﬁnalized (i.e. the maximum tick height is reached, reaching the "block boundary"), the ﬁnal hash of the block is added to the BlockhashQueue which stores a maximum of the 300 most recent blockhashes. During transaction processing, Solana Validators will check if each transaction's recent blockhash is recorded within the most recent 151 stored hashes (aka "max processing age"). If the transaction's recent blockhash is older than this max processing age, the transaction is not processed. 2/8/25, 5:43 PM Transaction Conﬁrmation & Expiration | Solana https://solana.com/docs/advanced/conﬁrmation 3/12


---

### Page 4

“Due to the current max processing age of 150 and the "age" of a blockhash in the queue being 0-indexed, there are actually 151 blockhashes that are considered "recent enough" and valid for processing.” Since slots (aka the time period a validator can produce a block) are conﬁgured to last about 400ms, but may ﬂuctuate between 400ms and 600ms, a given blockhash can only be used by transactions for about 60 to 90 seconds before it will be considered expired by the runtime. Example of transaction expiration Let's walk through a quick example: 1. A validator is actively producing a new block for the current slot 2. The validator receives a transaction from a user with the recent blockhash abcd... 3. The validator checks this blockhash abcd... against the list of recent blockhashes in the BlockhashQueue and discovers that it was created 151 blocks ago 4. Since it is exactly 151 blockhashes old, the transaction has not expired yet and can still be processed! 5. But wait: before actually processing the transaction, the validator ﬁnished creating the next block and added it to the BlockhashQueue. The validator then starts producing the block for the next slot (validators get to produce blocks for 4 consecutive slots) 6. The validator checks that same transaction again and ﬁnds it is now 152 blockhashes old and rejects it because it's too old :( Why do transactions expire? There's a very good reason for this actually, it's to help validators avoid processing the same transaction twice. 2/8/25, 5:43 PM Transaction Conﬁrmation & Expiration | Solana https://solana.com/docs/advanced/conﬁrmation 4/12


---

### Page 5

A naive brute force approach to prevent double processing could be to check every new transaction against the blockchain's entire transaction history. But by having transactions expire after a short amount of time, validators only need to check if a new transaction is in a relatively small set of recently processed transactions. Other blockchains Solana's approach to prevent double processing is quite different from other blockchains. For example, Ethereum tracks a counter (nonce) for each transaction sender and will only process transactions that use the next valid nonce. Ethereum's approach is simple for validators to implement, but it can be problematic for users. Many people have encountered situations when their Ethereum transactions got stuck in a pending state for a long time and all the later transactions, which used higher nonce values, were blocked from processing. Advantages on Solana There are a few advantages to Solana's approach: 1. A single fee payer can submit multiple transactions at the same time that are allowed to be processed in any order. This might happen if you're using multiple applications at the same time. 2. If a transaction doesn't get committed to a block and expires, users can try again knowing that their previous transaction will NOT ever be processed. By not using counters, the Solana wallet experience may be easier for users to understand because they can get to success, failure, or expiration states quickly and avoid annoying pending states. Disadvantages on Solana Of course there are some disadvantages too: 2/8/25, 5:43 PM Transaction Conﬁrmation & Expiration | Solana https://solana.com/docs/advanced/conﬁrmation 5/12


---

### Page 6

1. Validators have to actively track a set of all processed transaction id's to prevent double processing. 2. If the expiration time period is too short, users might not be able to submit their transaction before it expires. These disadvantages highlight a tradeoff in how transaction expiration is conﬁgured. If the expiration time of a transaction is increased, validators need to use more memory to track more transactions. If expiration time is decreased, users don't have enough time to submit their transaction. Currently, Solana clusters require that transactions use blockhashes that are no more than 151 blocks old. “This GitHub issue contains some calculations that estimate that mainnet-beta validators need about 150MB of memory to track transactions. This could be slimmed down in the future if necessary without decreasing expiration time as are detailed in that issue.” Transaction confirmation tips As mentioned before, blockhashes expire after a time period of only 151 blocks which can pass as quickly as one minute when slots are processed within the target time of 400ms. One minute is not a lot of time considering that a client needs to fetch a recent blockhash, wait for the user to sign, and ﬁnally hope that the broadcasted transaction reaches a leader that is willing to accept it. Let's go through some tips to help avoid conﬁrmation failures due to transaction expiration! Fetch blockhashes with the appropriate commitment level Given the short expiration time frame, it's imperative that clients and applications help users create transactions with a blockhash that is as recent as possible. 2/8/25, 5:43 PM Transaction Conﬁrmation & Expiration | Solana https://solana.com/docs/advanced/conﬁrmation 6/12


---

### Page 7

When fetching blockhashes, the current recommended RPC API is called getLatestBlockhash. By default, this API uses the finalized commitment level to return the most recently ﬁnalized block's blockhash. However, you can override this behavior by setting the commitment parameter to a different commitment level. Recommendation The confirmed commitment level should almost always be used for RPC requests because it's usually only a few slots behind the processed commitment and has a very low chance of belonging to a dropped fork. But feel free to consider the other options: Choosing processed will let you fetch the most recent blockhash compared to other commitment levels and therefore gives you the most time to prepare and process a transaction. But due to the prevalence of forking in the Solana blockchain, roughly 5% of blocks don't end up being ﬁnalized by the cluster so there's a real chance that your transaction uses a blockhash that belongs to a dropped fork. Transactions that use blockhashes for abandoned blocks won't ever be considered recent by any blocks that are in the ﬁnalized blockchain. Using the default commitment level finalized will eliminate any risk that the blockhash you choose will belong to a dropped fork. The tradeoff is that there is typically at least a 32 slot difference between the most recent conﬁrmed block and the most recent ﬁnalized block. This tradeoff is pretty severe and effectively reduces the expiration of your transactions by about 13 seconds but this could be even more during unstable cluster conditions. Use an appropriate preﬂight commitment level If your transaction uses a blockhash that was fetched from one RPC node then you send, or simulate, that transaction with a different RPC node, you could run into issues due to one node lagging behind the other. When RPC nodes receive a sendTransaction request, they will attempt to determine the expiration block of your transaction using the most recent ﬁnalized block or with 2/8/25, 5:43 PM Transaction Conﬁrmation & Expiration | Solana https://solana.com/docs/advanced/conﬁrmation 7/12


---

### Page 8

the block selected by the preflightCommitment parameter. A VERY common issue is that a received transaction's blockhash was produced after the block used to calculate the expiration for that transaction. If an RPC node can't determine when your transaction expires, it will only forward your transaction one time and afterwards will then drop the transaction. Similarly, when RPC nodes receive a simulateTransaction request, they will simulate your transaction using the most recent ﬁnalized block or with the block selected by the preflightCommitment parameter. If the block chosen for simulation is older than the block used for your transaction's blockhash, the simulation will fail with the dreaded “blockhash not found” error. Recommendation Even if you use skipPreflight, ALWAYS set the preflightCommitment parameter to the same commitment level used to fetch your transaction's blockhash for both sendTransaction and simulateTransaction requests. Be wary of lagging RPC nodes when sending transactions When your application uses an RPC pool service or when the RPC endpoint differs between creating a transaction and sending a transaction, you need to be wary of situations where one RPC node is lagging behind the other. For example, if you fetch a transaction blockhash from one RPC node then you send that transaction to a second RPC node for forwarding or simulation, the second RPC node might be lagging behind the ﬁrst. Recommendation For sendTransaction requests, clients should keep resending a transaction to a RPC node on a frequent interval so that if an RPC node is slightly lagging behind the cluster, it will eventually catch up and detect your transaction's expiration properly. For simulateTransaction requests, clients should use the replaceRecentBlockhash parameter to tell the RPC node to replace the simulated transaction's blockhash with a blockhash that will always be valid for simulation. 2/8/25, 5:43 PM Transaction Conﬁrmation & Expiration | Solana https://solana.com/docs/advanced/conﬁrmation 8/12


---

### Page 9

Avoid reusing stale blockhashes Even if your application has fetched a very recent blockhash, be sure that you're not reusing that blockhash in transactions for too long. The ideal scenario is that a recent blockhash is fetched right before a user signs their transaction. Recommendation for applications Poll for new recent blockhashes on a frequent basis to ensure that whenever a user triggers an action that creates a transaction, your application already has a fresh blockhash that's ready to go. Recommendation for wallets Poll for new recent blockhashes on a frequent basis and replace a transaction's recent blockhash right before they sign the transaction to ensure the blockhash is as fresh as possible. Use healthy RPC nodes when fetching blockhashes By fetching the latest blockhash with the confirmed commitment level from an RPC node, it's going to respond with the blockhash for the latest conﬁrmed block that it's aware of. Solana's block propagation protocol prioritizes sending blocks to staked nodes so RPC nodes naturally lag about a block behind the rest of the cluster. They also have to do more work to handle application requests and can lag a lot more under heavy user traffic. Lagging RPC nodes can therefore respond to getLatestBlockhash requests with blockhashes that were conﬁrmed by the cluster quite awhile ago. By default, a lagging RPC node detects that it is more than 150 slots behind the cluster will stop responding to requests, but just before hitting that threshold they can still return a blockhash that is just about to expire. Recommendation 2/8/25, 5:43 PM Transaction Conﬁrmation & Expiration | Solana https://solana.com/docs/advanced/conﬁrmation 9/12


---

### Page 10

Monitor the health of your RPC nodes to ensure that they have an up-to-date view of the cluster state with one of the following methods: 1. Fetch your RPC node's highest processed slot by using the getSlot RPC API with the processed commitment level and then call the getMaxShredInsertSlot RPC API to get the highest slot that your RPC node has received a “shred” of a block for. If the difference between these responses is very large, the cluster is producing blocks far ahead of what the RPC node has processed. 2. Call the getLatestBlockhash RPC API with the confirmed commitment level on a few different RPC API nodes and use the blockhash from the node that returns the highest slot for its context slot. Wait long enough for expiration Recommendation When calling the getLatestBlockhash RPC API to get a recent blockhash for your transaction, take note of the lastValidBlockHeight in the response. Then, poll the getBlockHeight RPC API with the confirmed commitment level until it returns a block height greater than the previously returned last valid block height. Consider using “durable” transactions Sometimes transaction expiration issues are really hard to avoid (e.g. offline signing, cluster instability). If the previous tips are still not sufficient for your use-case, you can switch to using durable transactions (they just require a bit of setup). To start using durable transactions, a user ﬁrst needs to submit a transaction that invokes instructions that create a special on-chain “nonce” account and stores a “durable blockhash” inside of it. At any point in the future (as long as the nonce account hasn't been used yet), the user can create a durable transaction by following these 2 rules: 2/8/25, 5:43 PM Transaction Conﬁrmation & Expiration | Solana https://solana.com/docs/advanced/conﬁrmation 10/12


---

### Page 11

1. The instruction list must start with an “advance nonce” system instruction which loads their on-chain nonce account 2. The transaction's blockhash must be equal to the durable blockhash stored by the on-chain nonce account Here's how these durable transactions are processed by the Solana runtime: 1. If the transaction's blockhash is no longer “recent”, the runtime checks if the transaction's instruction list begins with an “advance nonce” system instruction 2. If so, it then loads the nonce account speciﬁed by the “advance nonce” instruction 3. Then it checks that the stored durable blockhash matches the transaction's blockhash 4. Lastly it makes sure to advance the nonce account's stored blockhash to the latest recent blockhash to ensure that the same transaction can never be processed again For more details about how these durable transactions work, you can read the original proposal and check out an example in the Solana docs. Last updated on 2/4/2025 Loading comments… Previous FAQ Next Retrying Transactions 2/8/25, 5:43 PM Transaction Conﬁrmation & Expiration | Solana https://solana.com/docs/advanced/conﬁrmation 11/12


---

### Page 12

Managed by SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 5:43 PM Transaction Conﬁrmation & Expiration | Solana https://solana.com/docs/advanced/conﬁrmation 12/12


---

# Rust Client for Solana _ Solana.pdf

### Page 1

Solana Documentation Solana Clients Rust Client for Solana Solana's Rust crates are published to crates.io and can be found on docs.rs with the solana- preﬁx. Hello World: Get started with Solana development To quickly get started with Solana development and build your ﬁrst Rust program, take a look at these detailed quick start guides: Build and deploy your ﬁrst Solana program using only your browser. No installation needed. Setup your local environment and use the local test validator. Rust Crates The following are the most important and commonly used Rust crates for Solana development: solana-program — Imported by programs running on Solana, compiled to SBF. This crate contains many fundamental data types and is re-exported from solana-sdk, which cannot be imported from a Solana program. solana-sdk — The basic offchain SDK, it re-exports solana-program and adds more APIs on top of that. Most Solana programs that do not run on-chain will Documentation API Cookbook Courses Guides Get Support Table of Contents Rust Crates 2/8/25, 6:02 PM Rust Client for Solana | Solana https://solana.com/docs/clients/rust 1/3


---

### Page 2

import this. solana-client — For interacting with a Solana node via the JSON RPC API. solana-cli-config — Loading and saving the Solana CLI conﬁguration ﬁle. solana-clap-utils — Routines for setting up a CLI, using clap, as used by the main Solana CLI. Includes functions for loading all types of signers supported by the CLI. Last updated on 2/6/2025 0 reactions 0 comments Previous Troubleshooting Next JavaScript / TypeScript Managed by 2/8/25, 6:02 PM Rust Client for Solana | Solana https://solana.com/docs/clients/rust 2/3


---

### Page 3

SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 6:02 PM Rust Client for Solana | Solana https://solana.com/docs/clients/rust 3/3


---

# Deploying Your First Solana Program _ Solana.pdf

### Page 1

Solana Documentation Getting Started Quick Start Deploying Your First Solana Program In this section, we'll build, deploy, and test a simple Solana program (smart contract) using the Anchor framework. By the end, you'll have deployed your ﬁrst program to the Solana blockchain! The purpose of this section is to familiarize you with the Solana Playground. We'll walk through a more detailed example in the PDA and CPI sections. For more details, refer to the Programs on Solana page. Create Anchor Project First, open https://beta.solpg.io in a new browser tab. Click the "Create a new project" button on the left-side panel. Enter a project name, select Anchor as the framework, then click the "Create" button. 1 Documentation API Cookbook Courses Guides Get Support Table of Contents Create Anchor Project 2/8/25, 5:59 PM Deploying Your First Solana Program | Solana https://solana.com/docs/intro/quick-start/deploying-programs 1/8


---

### Page 2

New Project You'll see a new project created with the program code in the src/lib.rs ﬁle. This is a basic Solana program that creates a new account and stores a number in it. The program has one instruction (initialize) that takes a u64 number as input, creates a new account, and saves that number in the account's data. When the instruction is invoked, it also logs a message to the transaction's program logs. lib.rs use anchor_lang::prelude::*; // This is your program's public key and it will update // automatically when you build the project. declare_id!("11111111111111111111111111111111"); #[program] mod hello_anchor { use super::*; pub fn initialize(ctx: Context<Initialize>, data: u64) -> Result<()> ctx.accounts.new_account.data = data; msg!("Changed data to: {}!", data); // Message will show up in t Ok(()) } 2/8/25, 5:59 PM Deploying Your First Solana Program | Solana https://solana.com/docs/intro/quick-start/deploying-programs 2/8


---

### Page 3

Build and Deploy Program To build the program, simply run build in the terminal. Note that the address in declare_id!() has been updated. This is your program's on-chain address. Once the program is built, run deploy in the terminal to deploy the program to the network (devnet by default). To deploy a program, SOL must be allocated to the on-chain account that stores the program. Before deployment, ensure you have enough SOL. You can get devnet SOL by either running solana airdrop 5 in the Playground terminal or using the Web } #[derive(Accounts)] pub struct Initialize<'info> { // We must specify the space in order to initialize an account. // First 8 bytes are default account discriminator, // next 8 bytes come from NewAccount.data being type u64. // (u64 = 64 bits unsigned integer = 8 bytes) #[account(init, payer = signer, space = 8 + 8)] pub new_account: Account<'info, NewAccount>, #[account(mut)] pub signer: Signer<'info>, pub system_program: Program<'info, System>, } Explanation 2 Terminal build Output 2/8/25, 5:59 PM Deploying Your First Solana Program | Solana https://solana.com/docs/intro/quick-start/deploying-programs 3/8


---

### Page 4

Faucet. Alternatively, you can also use the Build and Deploy buttons on the left-side panel. Build and Deploy Once the program is deployed, you can now invoke its instructions. Test Program Included with the starter code is a test ﬁle found in tests/anchor.test.ts. This ﬁle demonstrates how to invoke the initialize instruction on the program from the client. Terminal deploy Output 3 2/8/25, 5:59 PM Deploying Your First Solana Program | Solana https://solana.com/docs/intro/quick-start/deploying-programs 4/8


---

### Page 5

To run the test ﬁle once the program is deployed, run test in the terminal. You should see an output indicating that the test passed successfully. anchor.test.ts // No imports needed: web3, anchor, pg and more are globally available describe("Test", () => { it("initialize", async () => { // Generate keypair for the new account const newAccountKp = new web3.Keypair(); // Send transaction const data = new BN(42); const txHash = await pg.program.methods .initialize(data) .accounts({ newAccount: newAccountKp.publicKey, signer: pg.wallet.publicKey, systemProgram: web3.SystemProgram.programId, }) .signers([newAccountKp]) .rpc(); console.log(`Use 'solana confirm -v ${txHash}' to see the logs`); // Confirm transaction await pg.connection.confirmTransaction(txHash); // Fetch the created account const newAccount = await pg.program.account.newAccount.fetch( newAccountKp.publicKey, ); console.log("On-chain data is:", newAccount.data.toString()); Terminal test Output 2/8/25, 5:59 PM Deploying Your First Solana Program | Solana https://solana.com/docs/intro/quick-start/deploying-programs 5/8


---

### Page 6

You can also use the Test button on the left-side panel. Run Test You can then view the transaction logs by running the solana confirm -v command and specifying the transaction hash (signature) from the test output: For example: Terminal solana confirm -v [TxHash] Terminal solana confirm -v 3TewJtiUz1EgtT88pLJHvKFzqrzDNuHVi8CfD2mWmHEBAaMfC5NAaH Output 2/8/25, 5:59 PM Deploying Your First Solana Program | Solana https://solana.com/docs/intro/quick-start/deploying-programs 6/8


---

### Page 7

Alternatively, you can view the transaction details on SolanaFM or Solana Explorer by searching for the transaction signature (hash). Reminder to update the cluster (network) connection on the Explorer you are using to match Solana Playground. Solana Playground's default cluster is devnet. Close Program Lastly, the SOL allocated to the on-chain program can be fully recovered by closing the program. You can close a program by running the following command and specifying the program address found in declare_id!(): For example: Congratulations! You've just built and deployed your ﬁrst Solana program using the Anchor framework! 4 Terminal solana program close [ProgramID] Terminal solana program close 2VvQ11q8xrn5tkPNyeraRsPaATdiPx8weLAD8aD4dn2r Output Explanation 2/8/25, 5:59 PM Deploying Your First Solana Program | Solana https://solana.com/docs/intro/quick-start/deploying-programs 7/8


---

### Page 8

Last updated on 2/4/2025 Previous Writing to Network Next Creating Deterministic Accounts Managed by SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 5:59 PM Deploying Your First Solana Program | Solana https://solana.com/docs/intro/quick-start/deploying-programs 8/8


---

# Address Lookup Tables _ Solana.pdf

### Page 1

Solana Documentation Advanced Topics Address Lookup Tables Address Lookup Tables, commonly referred to as "lookup tables" or "ALTs" for short, allow developers to create a collection of related addresses to efficiently load more addresses in a single transaction. Since each transaction on the Solana blockchain requires a listing of every address that is interacted with as part of the transaction, this listing would effectively be capped at 32 addresses per transaction. With the help of Address Lookup Tables, a transaction would now be able to raise that limit to 64 addresses per transaction. Compressing onchain addresses After all the desired addresses have been stored onchain in an Address Lookup Table, each address can be referenced inside a transaction by its 1-byte index within the table (instead of their full 32-byte address). This lookup method effectively "compresses" a 32-byte address into a 1-byte index value. This "compression" enables storing up to 256 addresses in a single lookup table for use inside any given transaction. Versioned Transactions Documentation API Cookbook Courses Guides Get Support Table of Contents Compressing onchain addresses 2/8/25, 5:43 PM Address Lookup Tables | Solana https://solana.com/docs/advanced/lookup-tables 1/7


---

### Page 2

To utilize an Address Lookup Table inside a transaction, developers must use v0 transactions that were introduced with the new Versioned Transaction format. How to create an address lookup table Creating a new lookup table with the @solana/web3.js library is similar to the older legacy transactions, but with some differences. Using the @solana/web3.js library, you can use the createLookupTable function to construct the instruction needed to create a new lookup table, as well as determine its address: “NOTE: Address lookup tables can be created with either a v0 transaction or a legacy transaction. But the Solana runtime can only retrieve and handle the additional addresses within a lookup table while using v0 Versioned Transactions.” const web3 = require("@solana/web3.js"); // connect to a cluster and get the current `slot` const connection = new web3.Connection(web3.clusterApiUrl("devnet")); const slot = await connection.getSlot(); // Assumption: // `payer` is a valid `Keypair` with enough SOL to pay for the execution const [lookupTableInst, lookupTableAddress] = web3.AddressLookupTableProgram.createLookupTable({ authority: payer.publicKey, payer: payer.publicKey, recentSlot: slot, }); console.log("lookup table address:", lookupTableAddress.toBase58()); // To create the Address Lookup Table onchain: // send the `lookupTableInst` instruction in a transaction 2/8/25, 5:43 PM Address Lookup Tables | Solana https://solana.com/docs/advanced/lookup-tables 2/7


---

### Page 3

Add addresses to a lookup table Adding addresses to a lookup table is known as "extending". Using the @solana/web3.js library, you can create a new extend instruction using the extendLookupTable method: “NOTE: Due to the same memory limits of legacy transactions, any transaction used to extend an Address Lookup Table is also limited in how many addresses can be added at a time. Because of this, you will need to use multiple transactions to extend any table with more addresses (~20) that can ﬁt within a single transaction's memory limits.” Once these addresses have been inserted into the table, and stored onchain, you will be able to utilize the Address Lookup Table in future transactions. Enabling up to 64 addresses in those future transactions. Fetch an Address Lookup Table Similar to requesting another account (or PDA) from the cluster, you can fetch a complete Address Lookup Table with the getAddressLookupTable method: // add addresses to the `lookupTableAddress` table via an `extend` instruction const extendInstruction = web3.AddressLookupTableProgram.extendLookupTable({ payer: payer.publicKey, authority: payer.publicKey, lookupTable: lookupTableAddress, addresses: [ payer.publicKey, web3.SystemProgram.programId, // list more `publicKey` addresses here ], }); // Send this `extendInstruction` in a transaction to the cluster // to insert the listing of `addresses` into your lookup table with address `l 2/8/25, 5:43 PM Address Lookup Tables | Solana https://solana.com/docs/advanced/lookup-tables 3/7


---

### Page 4

Our lookupTableAccount variable will now be an AddressLookupTableAccount object which we can parse to read the listing of all the addresses stored on chain in the lookup table: How to use an address lookup table in a transaction After you have created your lookup table, and stored your needed address on chain (via extending the lookup table), you can create a v0 transaction to utilize the onchain lookup capabilities. Just like older legacy transactions, you can create all the instructions your transaction will execute onchain. You can then provide an array of these instructions to the Message used in the v0 transaction. “NOTE: The instructions used inside a v0 transaction can be constructed using the same methods and functions used to create the instructions in the past. // define the `PublicKey` of the lookup table to fetch const lookupTableAddress = new web3.PublicKey(""); // get the table from the cluster const lookupTableAccount = ( await connection.getAddressLookupTable(lookupTableAddress) ).value; // `lookupTableAccount` will now be an `AddressLookupTableAccount` object console.log("Table address from cluster:", lookupTableAccount.key.toBase58()); // loop through and parse all the addresses stored in the table for (let i = 0; i < lookupTableAccount.state.addresses.length; i++) { const address = lookupTableAccount.state.addresses[i]; console.log(i, address.toBase58()); } 2/8/25, 5:43 PM Address Lookup Tables | Solana https://solana.com/docs/advanced/lookup-tables 4/7


---

### Page 5

There is no required change to the instructions used involving an Address Lookup Table.” “NOTE: When sending a VersionedTransaction to the cluster, it must be signed BEFORE calling the sendAndConfirmTransaction method. If you pass an array of Signer (like with legacy transactions) the method will trigger an error!” More Resources Read the proposal for Address Lookup Tables and Versioned transactions Example Rust program using Address Lookup Tables // Assumptions: // - `arrayOfInstructions` has been created as an `array` of `TransactionInstr // - we are using the `lookupTableAccount` obtained above // construct a v0 compatible transaction `Message` const messageV0 = new web3.TransactionMessage({ payerKey: payer.publicKey, recentBlockhash: blockhash, instructions: arrayOfInstructions, // note this is an array of instructions }).compileToV0Message([lookupTableAccount]); // create a v0 transaction from the v0 message const transactionV0 = new web3.VersionedTransaction(messageV0); // sign the v0 transaction using the file system wallet we created named `paye transactionV0.sign([payer]); // send and confirm the transaction // (NOTE: There is NOT an array of Signers here; see the note below...) const txid = await web3.sendAndConfirmTransaction(connection, transactionV0); console.log( `Transaction: https://explorer.solana.com/tx/${txid}?cluster=devnet`, ); 2/8/25, 5:43 PM Address Lookup Tables | Solana https://solana.com/docs/advanced/lookup-tables 5/7


---

### Page 6

Last updated on 2/5/2025 Loading comments… Previous Versioned Transactions Next State Compression Managed by SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN 2/8/25, 5:43 PM Address Lookup Tables | Solana https://solana.com/docs/advanced/lookup-tables 6/7


---

### Page 7

© 2025 Solana Foundation. All rights reserved. 2/8/25, 5:43 PM Address Lookup Tables | Solana https://solana.com/docs/advanced/lookup-tables 7/7


---

# Programs _ Solana.pdf

### Page 1

Solana Documentation Core Concepts Programs On Solana, "smart contracts" are called programs. Programs are deployed on-chain to accounts that contain the program's compiled executable binary. Users interact with programs by sending transactions containing instructions that tell the program what to do. Key Points Programs are accounts containing executable code, organized into functions called instructions. While programs are stateless, they can include instructions that create and update other accounts to store data. An upgrade authority can update programs. Once this authority is removed, the program becomes immutable. Users can verify an on-chain program account's data matches its public source code through veriﬁable builds. Writing Solana Programs Documentation API Cookbook Courses Guides Get Support Table of Contents Key Points 2/8/25, 5:38 PM Programs | Solana https://solana.com/docs/core/programs 1/4


---

### Page 2

Solana programs are predominantly written in the Rust programming language, with two common approaches for development: Anchor: A framework designed for Solana program development. It provides a faster and simpler way to write programs, using Rust macros to signiﬁcantly reduce boilerplate code. For beginners, it is recommended to start with the Anchor framework. Native Rust: This approach involves writing Solana programs in Rust without leveraging any frameworks. It offers more ﬂexibility but comes with increased complexity. Updating Solana Programs To learn more about deploying and upgrading programs, see the deploying programs page. On-chain programs can be directly modiﬁed by an account designated as the "upgrade authority", which is typically the account that originally deployed the program. If the upgrade authority is revoked and set to None, the program becomes immutable and can no longer be updated. Verifiable Programs Veriﬁable builds allow anyone to check if a program's on-chain code matches its public source code, making it possible to detect discrepancies between source and deployed versions. The Solana developer community has introduced tools to support veriﬁable builds, enabling both developers and users to verify that onchain programs accurately reﬂect their publicly shared source code. 2/8/25, 5:38 PM Programs | Solana https://solana.com/docs/core/programs 2/4


---

### Page 3

Searching for Veriﬁed Programs: To quickly check for veriﬁed programs, users can search for a program address on the SolanaFM Explorer and navigate to the "Veriﬁcation" tab. View an example of a veriﬁed program here. Veriﬁcation Tools: The Solana Veriﬁable Build CLI by Ellipsis Labs enables users to independently verify onchain programs against published source code. Support for Veriﬁable Builds in Anchor: Anchor provides built-in support for veriﬁable builds. Details can be found in the Anchor documentation. Berkeley Packet Filter (BPF) Solana uses LLVM to compile programs into ELF ﬁles. These ﬁles contain Solana's custom version of eBPF bytecode, called "Solana Bytecode Format" (sBPF). The ELF ﬁle contains the program's binary and is stored on-chain in an executable account when the program is deployed. Last updated on 2/5/2025 0 reactions 0 comments Previous Fees on Solana Next Program Derived Address 2/8/25, 5:38 PM Programs | Solana https://solana.com/docs/core/programs 3/4


---

### Page 4

Managed by SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 5:38 PM Programs | Solana https://solana.com/docs/core/programs 4/4


---

# FAQ _ Solana.pdf

### Page 1

Solana Documentation Developing Programs FAQ Post your questions on StackExchange. Berkeley Packet Filter (BPF) Solana onchain programs are compiled via the LLVM compiler infrastructure to an Executable and Linkable Format (ELF) containing a variation of the Berkeley Packet Filter (BPF) bytecode. Because Solana uses the LLVM compiler infrastructure, a program may be written in any programming language that can target the LLVM's BPF backend. BPF provides an efficient instruction set that can be executed in an interpreted virtual machine or as efficient just-in-time compiled native instructions. Memory map The virtual address memory map used by Solana SBF programs is ﬁxed and laid out as follows Program code starts at 0x100000000 Documentation API Cookbook Courses Guides Get Support Table of Contents Berkeley Packet Filter (BPF) 2/8/25, 6:03 PM FAQ | Solana https://solana.com/docs/programs/faq 1/7


---

### Page 2

Stack data starts at 0x200000000 Heap data starts at 0x300000000 Program input parameters start at 0x400000000 The above virtual addresses are start addresses but programs are given access to a subset of the memory map. The program will panic if it attempts to read or write to a virtual address that it was not granted access to, and an AccessViolation error will be returned that contains the address and size of the attempted violation. InvalidAccountData This program error can happen for a lot of reasons. Usually, it's caused by passing an account to the program that the program is not expecting, either in the wrong position in the instruction or an account not compatible with the instruction being executed. An implementation of a program might also cause this error when performing a cross-program instruction and forgetting to provide the account for the program that you are calling. InvalidInstructionData This program error can occur while trying to deserialize the instruction, check that the structure passed in matches exactly the instruction. There may be some padding between ﬁelds. If the program implements the Rust Pack trait then try packing and unpacking the instruction type T to determine the exact encoding the program expects. MissingRequiredSignature 2/8/25, 6:03 PM FAQ | Solana https://solana.com/docs/programs/faq 2/7


---

### Page 3

Some instructions require the account to be a signer; this error is returned if an account is expected to be signed but is not. An implementation of a program might also cause this error when performing a cross-program invocation that requires a signed program address, but the passed signer seeds passed to invoke_signed don't match the signer seeds used to create the program address create_program_address. Stack SBF uses stack frames instead of a variable stack pointer. Each stack frame is 4KB in size. If a program violates that stack frame size, the compiler will report the overrun as a warning. For example: The message identiﬁes which symbol is exceeding its stack frame, but the name might be mangled. “To demangle a Rust symbol use rustﬁlt.” The above warning came from a Rust program, so the demangled symbol name is: The reason a warning is reported rather than an error is because some dependent crates may include functionality that violates the stack frame restrictions even if the Error: Function _ZN16curve25519_dalek7edwards21EdwardsBasepointTable6create17h rustfilt _ZN16curve25519_dalek7edwards21EdwardsBasepointTable6create17h178b3d2 curve25519_dalek::edwards::EdwardsBasepointTable::create 2/8/25, 6:03 PM FAQ | Solana https://solana.com/docs/programs/faq 3/7


---

### Page 4

program doesn't use that functionality. If the program violates the stack size at runtime, an AccessViolation error will be reported. SBF stack frames occupy a virtual address range starting at 0x200000000. Heap size Programs have access to a runtime heap via the Rust alloc APIs. To facilitate fast allocations, a simple 32KB bump heap is utilized. The heap does not support free or realloc. Internally, programs have access to the 32KB memory region starting at virtual address 0x300000000 and may implement a custom heap based on the program's speciﬁc needs. Rust programs implement the heap directly by deﬁning a custom global_allocator Loaders Programs are deployed with and executed by runtime loaders, currently there are two supported loaders BPF Loader and BPF loader deprecated Loaders may support different application binary interfaces so developers must write their programs for and deploy them to the same loader. If a program written for one loader is deployed to a different one the result is usually an AccessViolation error due to mismatched deserialization of the program's input parameters. For all practical purposes program should always be written to target the latest BPF loader and the latest loader is the default for the command-line interface and the javascript APIs. Rust program entrypoints 2/8/25, 6:03 PM FAQ | Solana https://solana.com/docs/programs/faq 4/7


---

### Page 5

Deployment SBF program deployment is the process of uploading a BPF shared object into a program account's data and marking the account executable. A client breaks the SBF shared object into smaller pieces and sends them as the instruction data of Write instructions to the loader where loader writes that data into the program's account data. Once all the pieces are received the client sends a Finalize instruction to the loader, the loader then validates that the SBF data is valid and marks the program account as executable. Once the program account is marked executable, subsequent transactions may issue instructions for that program to process. When an instruction is directed at an executable SBF program the loader conﬁgures the program's execution environment, serializes the program's input parameters, calls the program's entrypoint, and reports any errors encountered. For further information, see deploying programs. Input Parameter Serialization SBF loaders serialize the program input parameters into a byte array that is then passed to the program's entrypoint, where the program is responsible for deserializing it on-chain. One of the changes between the deprecated loader and the current loader is that the input parameters are serialized in a way that results in various parameters falling on aligned offsets within the aligned byte array. This allows deserialization implementations to directly reference the byte array and provide aligned pointers to the program. Rust program parameter deserialization The latest loader serializes the program input parameters as follows (all encoding is little endian): 8 bytes unsigned number of accounts For each account 2/8/25, 6:03 PM FAQ | Solana https://solana.com/docs/programs/faq 5/7


---

### Page 6

1 byte indicating if this is a duplicate account, if not a duplicate then the value is 0xff, otherwise the value is the index of the account it is a duplicate of. If duplicate: 7 bytes of padding If not duplicate: 1 byte boolean, true if account is a signer 1 byte boolean, true if account is writable 1 byte boolean, true if account is executable 4 bytes of padding 32 bytes of the account public key 32 bytes of the account's owner public key 8 bytes unsigned number of lamports owned by the account 8 bytes unsigned number of bytes of account data x bytes of account data 10k bytes of padding, used for realloc enough padding to align the offset to 8 bytes. 8 bytes rent epoch 8 bytes of unsigned number of instruction data x bytes of instruction data 32 bytes of the program id Last updated on 2/5/2025 Loading comments… 2/8/25, 6:03 PM FAQ | Solana https://solana.com/docs/programs/faq 6/7


---

### Page 7

Previous Limitations Next Conﬁrmation & Expiration Managed by SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 6:03 PM FAQ | Solana https://solana.com/docs/programs/faq 7/7


---

# Solana Quick Start Guide _ Solana.pdf

### Page 1

Solana Documentation Getting Started Solana Quick Start Guide Welcome to the Solana Quick Start Guide! This hands-on guide will introduce you to the core concepts for building on Solana, regardless of your prior experience. What You'll Learn In this tutorial, you'll learn about: Solana Accounts: Learn how data is stored on the Solana network. Sending Transactions: Learn to interact with the Solana network by sending transactions. Building and Deploying Programs: Create your ﬁrst Solana program and deploy it to the network. Program Derived Addresses (PDAs): Learn how to use PDAs to create deterministic addresses for accounts. Cross-Program Invocations (CPIs): Learn how to call other programs from within your program, enabling complex interactions and composability between multiple programs on Solana. The best part? You don't need to install anything! We'll be using Solana Playground, a browser-based development environment. This means you can follow along, copy Documentation API Cookbook Courses Guides Get Support Table of Contents What You'll Learn 2/8/25, 5:57 PM Solana Quick Start Guide | Solana https://solana.com/docs/intro/quick-start 1/6


---

### Page 2

and paste code, and see results immediately, all from your web browser. Basic programming knowledge is helpful but not required. Let's dive in and start building on Solana! Solana Playground Solana Playground (Solpg) is a browser-based development environment that allows you to quickly develop, deploy, and test Solana programs! Open a new tab in your web browser and navigate to https://beta.solpg.io/. Create Playground Wallet If you're new to Solana Playground, the ﬁrst step is to create your Playground Wallet. This wallet will allow you to interact with the Solana network right from your browser. Step 1. Connect to Playground Click the "Not connected" button at the bottom left of the screen. 1 2/8/25, 5:57 PM Solana Quick Start Guide | Solana https://solana.com/docs/intro/quick-start 2/6


---

### Page 3

Not Connected Step 2. Create Your Wallet You'll be prompted to save your wallet's keypair. Once you are ready, click "Continue" to proceed. Create Playground Wallet 2/8/25, 5:57 PM Solana Quick Start Guide | Solana https://solana.com/docs/intro/quick-start 3/6


---

### Page 4

You should now see your wallet's address, SOL balance, and connected cluster (devnet by default) at the bottom of the window. Connected Your Playground Wallet will be saved in your browser's local storage. Clearing your browser cache will remove your saved wallet. Your Playground Wallet should only be used for testing and development. Do not send real assets (from mainnet) to this address. Some deﬁnitions you may ﬁnd helpful: wallet address: a 32-byte public key from a Ed25519 keypair, generally displayed as a base-58 encoded string (eg. 7MNj7pL1y7XpPnN7ZeuaE4ctwg3WeufbX5o85sA91J1). The corresponding private key is used to sign transactions from this address. On Solana, an address is the unique ideniﬁer for a user's wallet, a program (smart contract), or any other account on the network. connected cluster: the Solana network you're currently interacting with. Common clusters include: devnet: A development network for developer experimentation testnet: A network reserved for validator testing (do not use as app developer) mainnet-beta: The main Solana network for live transactions Get Devnet SOL Before we start building, we need to obtain some devnet SOL. As a developer, SOL is required for two main use cases: Creating new accounts to store data or deploy programs on the network 2 2/8/25, 5:57 PM Solana Quick Start Guide | Solana https://solana.com/docs/intro/quick-start 4/6


---

### Page 5

Paying transaction fees when interacting with the Solana network Below are two methods to fund your wallet with devnet SOL: Option 1: Using the Playground Terminal To fund your Playground wallet with devnet SOL. In the Playground terminal, run: Option 2: Using the Devnet Faucet If the airdrop command doesn't work (due to rate limits or errors), you can use the Web Faucet. Enter your wallet address (found at the bottom of the Playground screen) and select an amount Click "Conﬁrm Airdrop" to receive your devnet SOL Terminal solana airdrop 5 2/8/25, 5:57 PM Solana Quick Start Guide | Solana https://solana.com/docs/intro/quick-start 5/6


---

### Page 6

Last updated on 2/4/2025 4 reactions 👍 3 😄 1 0 comments– powered by giscus Next Reading from Network Managed by SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN © 2025 Solana Foundation. All rights reserved. Faucet Airdrop 2/8/25, 5:57 PM Solana Quick Start Guide | Solana https://solana.com/docs/intro/quick-start 6/6


---

# Install the Solana CLI and Anchor _ Solana.pdf

### Page 1

Solana Documentation Getting Started Installation This section covers the steps to set up your local environment for Solana development. Quick Installation On Mac and Linux, run this single command to install all dependencies. Windows users: Install WSL (see Install Dependencies), then run the command above in the Ubuntu (Linux) terminal. After installation, you should see output similar to the following: Terminal curl --proto '=https' --tlsv1.2 -sSfL https://raw.githubusercontent.com/solana Installed Versions: Rust: rustc 1.84.1 (e71f9a9a9 2025-01-27) Solana CLI: solana-cli 2.0.26 (src:3dccb3e7; feat:607245837, client:Agave) Anchor CLI: anchor-cli 0.30.1 Documentation API Cookbook Courses Guides Get Support Table of Contents Quick Installation 2/8/25, 5:59 PM Install the Solana CLI and Anchor | Solana https://solana.com/docs/intro/installation 1/15


---

### Page 2

If the quick installation command above doesn't work, please refer to the Install Dependencies section below for instructions to install each dependency individually. Install Dependencies The instructions below will guide you through installing each dependency individually. Windows users must ﬁrst install WSL (Windows subsystem for Linux) and then install the dependencies speciﬁed in the Linux section below. Linux users should ﬁrst install the dependencies speciﬁed in the Linux section below. Mac users should start with the Rust installation instructions below. Node.js: v23.7.0 Yarn: 1.22.1 Windows Subsystem for Linux (WSL) Linux Install Rust Solana programs are written in the Rust programming language. The recommended installation method for Rust is rustup. Run the following command to install Rust: 1 Terminal curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y 2/8/25, 5:59 PM Install the Solana CLI and Anchor | Solana https://solana.com/docs/intro/installation 2/15


---

### Page 3

You should see the following message after the installation completes: Run the following command to reload your PATH environment variable to include Cargo's bin directory: To verify that the installation was successful, check the Rust version: You should see output similar to the following: Install the Solana CLI The Solana CLI provides all the tools required to build and deploy Solana programs. Install the Solana CLI tool suite using the official install command: Successful Rust Install Message Terminal . "$HOME/.cargo/env" Terminal rustc --version rustc 1.84.1 (e71f9a9a9 2025-01-27) 2 Terminal sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)" 2/8/25, 5:59 PM Install the Solana CLI and Anchor | Solana https://solana.com/docs/intro/installation 3/15


---

### Page 4

You can replace stable with the release tag matching the software version of your desired release (i.e. v2.0.3), or use one of the three symbolic channel names: stable, beta, or edge. If it is your ﬁrst time installing the Solana CLI, you may see the following message prompting you to add a PATH environment variable: Linux Mac If you are using a Linux or WSL terminal, you can add the PATH environment variable to your shell conﬁguration ﬁle by running the command logged from the installation or by restarting your terminal. To verify that the installation was successful, check the Solana CLI version: You should see output similar to the following: You can view all available versions on the Agave Github repo. Close and reopen your terminal to apply the PATH changes or run the foll export PATH="/Users/test/.local/share/solana/install/active_release/bin: Terminal export PATH="$HOME/.local/share/solana/install/active_release/bin:$P Terminal solana --version solana-cli 2.0.26 (src:3dccb3e7; feat:607245837, client:Agave) 2/8/25, 5:59 PM Install the Solana CLI and Anchor | Solana https://solana.com/docs/intro/installation 4/15


---

### Page 5

Agave is the validator client from Anza, formerly known as Solana Labs validator client. To later update the Solana CLI to the latest version, you can use the following command: Install Anchor CLI Anchor is a framework for developing Solana programs. The Anchor framework leverages Rust macros to simplify the process of writing Solana programs. There are two ways to install the Anchor CLI and tooling: 1. Anchor Version Manager (AVM) - Recommended installation method 2. Without AVM - Install directly from GitHub AVM Without AVM The Anchor version manager (AVM) allows you to install and manage different Anchor versions on your system and easily update Anchor versions in the future. Install AVM with the following command: Check that AVM was installed successfully: Terminal agave-install update 3 Terminal cargo install --git https://github.com/coral-xyz/anchor avm --force 2/8/25, 5:59 PM Install the Solana CLI and Anchor | Solana https://solana.com/docs/intro/installation 5/15


---

### Page 6

Install the latest version of Anchor CLI using AVM: Alternatively, you can install a speciﬁc version of Anchor CLI by specifying the version number: Don't forget to run the avm use command to declare which Anchor CLI version should be used on your system. If you installed the latest version, run avm use latest. If you installed the version 0.30.1, run avm use 0.30.1. To verify that the installation was successful, check the Anchor CLI version: You should see output similar to the following: Terminal avm --version Terminal avm install latest avm use latest Terminal avm install 0.30.1 avm use 0.30.1 Terminal anchor --version 2/8/25, 5:59 PM Install the Solana CLI and Anchor | Solana https://solana.com/docs/intro/installation 6/15


---

### Page 7

When installing the Anchor CLI on Linux or WSL, you may encounter this error: If you see this error message, follow these steps: 1. Install the dependencies listed in the Linux section at the top of this page. 2. Retry installing the Anchor CLI. Node.js and Yarn Node.js and Yarn are required to run the default Anchor project test ﬁle (TypeScript) created with the anchor init command. (Rust test template is also available using anchor init --test-template rust) When running anchor build, if you encounter the following errors: After applying the solution above, attempt to run anchor build again. When running anchor test after creating a new Anchor project on Linux or WSL, you may encounter the following errors if Node.js or Yarn are not installed: anchor-cli 0.30.1 error: could not exec the linker cc = note: Permission denied (os Node Installation Yarn Installation error: not a directory lock ﬁle version 4 requires `-Znext-lockﬁle-bump 2/8/25, 5:59 PM Install the Solana CLI and Anchor | Solana https://solana.com/docs/intro/installation 7/15


---

### Page 8

Solana CLI Basics This section will walk through some common Solana CLI commands to get you started. Permission denied (os error 13) No such file or directory (os error 2) Solana Conﬁg To see your current conﬁg: You should see output similar to the following: The RPC URL and Websocket URL specify the Solana cluster the CLI will make requests to. By default this will be mainnet-beta. You can update the Solana CLI cluster using the following commands: 1 Terminal solana config get Config File: /Users/test/.config/solana/cli/config.yml RPC URL: https://api.mainnet-beta.solana.com WebSocket URL: wss://api.mainnet-beta.solana.com/ (computed) Keypair Path: /Users/test/.config/solana/id.json Commitment: confirmed 2/8/25, 5:59 PM Install the Solana CLI and Anchor | Solana https://solana.com/docs/intro/installation 8/15


---

### Page 9

You can also use the following short options: The Keypair Path points to the default Solana wallet (keypair) used by the Solana CLI to pay transaction fees and deploy programs. By default, this ﬁle is stored at ~/.config/solana/id.json. Create Wallet To send transactions using the Solana CLI, you need a Solana wallet funded with SOL. To generate a keypair at the default Keypair Path, run the following command: You should see output similar to the following: Terminal solana config set --url mainnet-beta solana config set --url devnet solana config set --url localhost solana config set --url testnet Terminal solana config set -um # For mainnet-beta solana config set -ud # For devnet solana config set -ul # For localhost solana config set -ut # For testnet 2 Terminal solana-keygen new Generating a new keypair 2/8/25, 5:59 PM Install the Solana CLI and Anchor | Solana https://solana.com/docs/intro/installation 9/15


---

### Page 10

If you already have a ﬁle system wallet saved at the default location, this command will NOT override it unless you explicitly force override using the --force ﬂag. To view your wallet's address (public key), run: Airdrop SOL Request an airdrop of SOL to your wallet to pay for transactions and program deployments. Set your cluster to the devnet: Then request an airdrop of devnet SOL: For added security, enter a BIP39 passphrase NOTE! This passphrase improves security of the recovery seed phrase NOT keypair file itself, which is stored as insecure plain text BIP39 Passphrase (empty for none): Wrote new keypair to /Users/test/.config/solana/id.json ======================================================================== pubkey: 8dBTPrjnkXyuQK3KDt9wrZBfizEZijmmUQXVHpFbVwGT ======================================================================== Save this seed phrase and your BIP39 passphrase to recover your new keyp cream bleak tortoise ocean nasty game gift forget fancy salon mimic amaz ======================================================================== Terminal solana address 3 Terminal solana config set -ud Terminal 2/8/25, 5:59 PM Install the Solana CLI and Anchor | Solana https://solana.com/docs/intro/installation 10/15


---

### Page 11

Anchor CLI Basics Devnet airdrops are limited to 5 SOL per request. If you hit rate limits or encounter errors, try using the Web Faucet instead. To check your wallet's SOL balance, run the following command: Run Local Validator The Solana CLI includes a built-in test validator for local development. In a separate terminal, run the following command to start a local validator: Remember to update your CLI to use localhost before running any commands: solana airdrop 2 Terminal solana balance 4 Terminal solana-test-validator Terminal solana config set -ul 2/8/25, 5:59 PM Install the Solana CLI and Anchor | Solana https://solana.com/docs/intro/installation 11/15


---

### Page 12

This section will walk through some common Anchor CLI commands to get you started. For more information on the Anchor CLI, see the Anchor documentation. Initialize Project To create a new Anchor project, run the following command: For example, to create a project called my-project, run: This command creates a new directory with the project name and initializes a new Anchor project with a basic Rust program and TypeScript test template. Navigate to the project directory: See the Anchor project's ﬁle structure. Build Program To build your project, run the following command: 1 Terminal anchor init <project-name> Terminal anchor init my-project Terminal cd <project-name> 2 2/8/25, 5:59 PM Install the Solana CLI and Anchor | Solana https://solana.com/docs/intro/installation 12/15


---

### Page 13

Last updated on 2/8/2025 The compiled program can be found in the /target/deploy directory. Deploy Program To deploy your project, run the following command: This command will deploy your program to the cluster speciﬁed in the Anchor.toml ﬁle. Test Program To test your project, run the following command: This command builds, deploys, and runs the tests for your project. When using localnet as the cluster in Anchor.toml, Anchor automatically starts a local validator, deploys your program, runs tests, and then stops the validator. Terminal anchor build 3 Terminal anchor deploy 4 Terminal anchor test 2/8/25, 5:59 PM Install the Solana CLI and Anchor | Solana https://solana.com/docs/intro/installation 13/15


---

### Page 14

Loading comments… Previous Composing Multiple Programs Next Core Concepts Managed by SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN 2/8/25, 5:59 PM Install the Solana CLI and Anchor | Solana https://solana.com/docs/intro/installation 14/15


---

### Page 15

© 2025 Solana Foundation. All rights reserved. 2/8/25, 5:59 PM Install the Solana CLI and Anchor | Solana https://solana.com/docs/intro/installation 15/15


---

# Solana Test Suite Overview _ Solana.pdf

### Page 1

Solana Documentation The Solana Toolkit Test Suite Solana Test Suite Overview “This is a beta version of the Solana Toolkit, and is still a WIP. Please post all feedback as a GitHub issue here.” Within the Solana Toolkit, there are several resources for testing Solana Smart Contracts, including: A fuzz tester. A code coverage tool. A framework for testing Solana programs in NodeJS that spins up a lightweight BanksServer that's like an RPC node but much faster and creates a BanksClient to talk to the server. A fast and lightweight library for testing Solana programs in Rust, which works by creating an in-process Solana VM optimized for program developers. A tool to scan your repo for common security vulnerabilities and provide suggestions for ﬁxes. Last updated on 2/4/2025 Documentation API Cookbook Courses Guides Get Support Table of Contents 2/8/25, 6:01 PM Solana Test Suite Overview | Solana https://solana.com/docs/toolkit/test-suite/overview 1/3


---

### Page 2

0 reactions 0 comments Write Preview Sign in to comment Sign in with GitHub Previous Local Validator Next Testing Basics Managed by SOLANA Grants Break Solana Media Kit GET CONNECTED Blog Newsletter 2/8/25, 6:01 PM Solana Test Suite Overview | Solana https://solana.com/docs/toolkit/test-suite/overview 2/3


---

### Page 3

Careers Disclaimer Privacy Policy EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 6:01 PM Solana Test Suite Overview | Solana https://solana.com/docs/toolkit/test-suite/overview 3/3


---

# How to check for security vulnerabilities in Solana programs _ Solana.pdf

### Page 1

Solana Documentation The Solana Toolkit Test Suite Security Vulnerability Scanner “This is a beta version of the Solana Toolkit, and is still a WIP. Please post all feedback as a GitHub issue here.” Static Analysis Tools Radar is static analysis tool for Anchor rust programs. It allows you to write, share, and utilize templates to identify security issues in rust-based programs using a powerful python based rule engine that enables automating detection of vulnerable code patterns through logical expressions. Xray is an open-source, cross-platform command-line interface (CLI) tool designed for static analysis of Solana programs and programs written in Rust. Common Security Exploits and Protections Read Sealevel Attacks for examples of common exploits unique to the Solana programming model and recommended idioms for avoiding these attacks using the Anchor framework. Documentation API Cookbook Courses Guides Get Support Table of Contents Static Analysis Tools 2/8/25, 6:02 PM How to check for security vulnerabilities in Solana programs | Solana https://solana.com/docs/toolkit/test-suite/security-scanner 1/3


---

### Page 2

Last updated on 2/4/2025 Loading comments… Previous Fuzz Tester Next JavaScript Tests Managed by SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN 2/8/25, 6:02 PM How to check for security vulnerabilities in Solana programs | Solana https://solana.com/docs/toolkit/test-suite/security-scanner 2/3


---

### Page 3

© 2025 Solana Foundation. All rights reserved. 2/8/25, 6:02 PM How to check for security vulnerabilities in Solana programs | Solana https://solana.com/docs/toolkit/test-suite/security-scanner 3/3


---

# What are best practices for Solana program development_ _ Solana.pdf

### Page 1

Solana Documentation The Solana Toolkit Solana Program Best Practices “This is a beta version of the Solana Toolkit, and is still a WIP. Please post all feedback as a GitHub issue here.” Optimize Compute Usage To prevent abuse of computational resources, each transaction is allocated a "compute budget". This budget speciﬁes details about compute units and includes: the compute costs associated with different types of operations the transaction may perform (compute units consumed per operation), the maximum number of compute units that a transaction can consume (compute unit limit), and the operational bounds the transaction must adhere to (like account data size limits) When the transaction consumes its entire compute budget (compute budget exhaustion), or exceeds a bound such as attempting to exceed the max call stack depth or max loaded account data size limit, the runtime halts the transaction processing and returns an error. Resulting in a failed transaction and no state changes (aside from the transaction fee being collected). Documentation API Cookbook Courses Guides Get Support Table of Contents Optimize Compute Usage 2/8/25, 6:01 PM What are best practices for Solana program development? | Solana https://solana.com/docs/toolkit/best-practices 1/5


---

### Page 2

Additional References How to Optimize Compute. How to Request Optimal Compute Saving Bumps “Program Derived Address (PDAs) are addresses that PDAs are addresses that are deterministically derived and look like standard public keys, but have no associated private keys. These PDAs are derived using a numerical value, called a "bump", to guarantee that the PDA is off-curve and cannot have an associated private key. It "bumps" the address off the cryptographic curve.” Saving the bump to your Solana smart contract account state ensures deterministic address generation, efficiency in address reconstruction, reduced transaction failure, and consistency across invocations. Additional References How to derive a PDA PDA Bumps Core Concepts Bump Seed Canonicalization Lesson Payer-Authority Pattern The Payer-Authority pattern is an elegant way to handle situations where the account’s funder (payer) differs from the account’s owner or manager (authority). By requiring separate signers and validating them in your onchain logic, you can maintain clear, robust, and ﬂexible ownership semantics in your program. Shank Example 2/8/25, 6:01 PM What are best practices for Solana program development? | Solana https://solana.com/docs/toolkit/best-practices 2/5


---

### Page 3

Anchor Example Additional References Metaplex Guide on Payer-Authority Pattern Helium Program Library using the Payer-Authority Pattern Invariants Implement invariants, which are functions that you can call at the end of your instruction to assert speciﬁc properties because they help ensure the correctness and reliability of programs. // Create a new account. #[account(0, writable, signer, name="account", desc = "The address of the new #[account(1, writable, signer, name="payer", desc = "The account paying for th #[account(2, optional, signer, name="authority", desc = "The authority signing #[account(3, name="system_program", desc = "The system program")] CreateAccountV1(CreateAccountV1Args), #[derive(Accounts)] pub struct CreateAccount<'info> { /// The address of the new account #[account(init, payer = payer_one, space = 8 + NewAccount::MAXIMUM_SIZE)] pub account: Account<'info, NewAccount>, /// The account paying for the storage fees #[account(mut)] pub payer: Signer<'info>, /// The authority signing for the account creation pub authority: Option<Signer<'info>>, // The system program pub system_program: Program<'info, System> } 2/8/25, 6:01 PM What are best practices for Solana program development? | Solana https://solana.com/docs/toolkit/best-practices 3/5


---

### Page 4

Additional References Complete Project Code Example Optimize Indexing You can make indexing easier by placing static size ﬁelds at the beginning and variable size ﬁelds at the end of your onchain structures. Last updated on 2/4/2025 Loading comments… Previous Project layout Next Local Validator require!(amount > 0, ErrorCode::InvalidAmount); 2/8/25, 6:01 PM What are best practices for Solana program development? | Solana https://solana.com/docs/toolkit/best-practices 4/5


---

### Page 5

Managed by SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 6:01 PM What are best practices for Solana program development? | Solana https://solana.com/docs/toolkit/best-practices 5/5


---

# Transactions and Instructions _ Solana.pdf

### Page 1

Solana Documentation Core Concepts Transactions and Instructions On Solana, we send transactions to interact with the network. Transactions include one or more instructions that specify operations to be processed. The execution logic for instructions are stored on programs deployed to the Solana network, where each program deﬁnes its own set of instructions. Below are key details about how transactions are processed: If a transaction includes multiple instructions, the instructions execute in the order they are added to the transaction Transactions are "atomic" - either all instructions process successfully, or the entire transaction fails and no changes are made. For simplicity, a transaction can be thought of as a request to process one or multiple instructions. Documentation API Cookbook Courses Guides Get Support Table of Contents Key Points 2/8/25, 5:38 PM Transactions and Instructions | Solana https://solana.com/docs/core/transactions 1/17


---

### Page 2

Instruction 1 Transaction Instruction 2 Instruction 3 Instruction Transaction Transaction Simpliﬁed Think of a transaction like an envelope containing forms. Each form is an instruction that tells the network what we are requesting to do. When you send the transaction, it's like mailing the envelope to get the forms processed. Key Points Solana transactions include instructions that are requests to invoke programs on the network. Transactions are atomic - if any instruction fails, the entire transaction fails and no changes occur. Instructions on a transaction are processed in sequential order. The maximum size of a transaction is 1232 bytes. Each instruction requires 3 pieces of information: 1. The address of the program to invoke 2. The accounts the instruction will read from or write to 3. Any additional data required by the instruction (e.g. function arguments) 2/8/25, 5:38 PM Transactions and Instructions | Solana https://solana.com/docs/core/transactions 2/17


---

### Page 3

Basic Example Below is a diagram representing a transaction with a single instruction to transfer SOL from a sender to a receiver. On Solana, accounts we refer to as "wallets" are owned by the System Program. Only the program owner can modify an account's data, so transferring SOL requires sending a transaction to invoke the System Program. AccountMeta AccountMeta Transaction Message Signers Instructions Recent Blockhash Instruction Transfer Amount Accounts: System Program is_signer: true is_writable: true Receiver Address is_signer: false is_writable: true Address Sender Wallet Account Signs and Sends Sender AddressSOL Transfer Instruction SOL Transfer The sender account must sign (is_signer) the transaction to authorize deducting its lamport balance. Both sender and recipient accounts need to be marked as writable (is_writable) since the lamport balances on these accounts will change. Once the transaction is sent, the System Program is invoked to process the transfer instruction. The System Program then updates the lamport balances of both the sender and recipient accounts accordingly. 2/8/25, 5:38 PM Transactions and Instructions | Solana https://solana.com/docs/core/transactions 3/17


---

### Page 4

Receiver Wallet Account System Program Sender Wallet Account AccountInfo Data: None AccountInfo Executable: False Lamports: ↓ Amount Owner: System Program Data: None Executable: False Lamports: ↑ Amount Owner: System Program Invokes Updates Updates Signs and Sends Instruction Transaction SOL Transfer Process Transfer SOL Here is a Solana Playground example of how to build a SOL transfer instruction using the SystemProgram.transfer method: Run the example by using the run command in the Playground terminal or clicking the "Run" button. Transfer SOL // Define the amount to transfer const transferAmount = 0.01; // 0.01 SOL // Create a transfer instruction for transferring SOL from wallet_1 to wallet_ const transferInstruction = SystemProgram.transfer({ fromPubkey: sender.publicKey, toPubkey: receiver.publicKey, lamports: transferAmount * LAMPORTS_PER_SOL, // Convert transferAmount to la }); // Add the transfer instruction to a new transaction const transaction = new Transaction().add(transferInstruction); 2/8/25, 5:38 PM Transactions and Instructions | Solana https://solana.com/docs/core/transactions 4/17


---

### Page 5

Ensure your Playground wallet has devnet SOL. Get devnet SOL from the Solana Faucet. In the sections below, we'll walk through the details of transactions and instructions. Transaction A Solana transaction consists of: 1. Signatures: An array of signatures included on the transaction. 2. Message: List of instructions to be processed atomically. Transaction Format The structure of a transaction message consists of: Message Header: Speciﬁes the number of signer and read-only account. Account Addresses: An array of account addresses required by the instructions on the transaction. Recent Blockhash: Acts as a timestamp for the transaction. Transaction pub struct Transaction { #[wasm_bindgen(skip)] #[serde(with = "short_vec")] pub signatures: Vec<Signature>, #[wasm_bindgen(skip)] pub message: Message, } 2/8/25, 5:38 PM Transactions and Instructions | Solana https://solana.com/docs/core/transactions 5/17


---

### Page 6

Instructions: An array of instructions to be executed. Transaction Message Transaction Size Solana transactions are limited to 1232 bytes. This limit comes from the IPv6 MTU size of 1280 bytes, minus 48 bytes for network headers (40 bytes IPv6 + 8 bytes fragment header). Message pub struct Message { /// The message header, identifying signed and read-only `account_keys`. pub header: MessageHeader, /// All the account keys used by this transaction. #[serde(with = "short_vec")] pub account_keys: Vec<Pubkey>, /// The id of a recent ledger entry. pub recent_blockhash: Hash, /// Programs that will be executed in sequence and committed in /// one atomic transaction if all succeed. #[serde(with = "short_vec")] pub instructions: Vec<CompiledInstruction>, } 2/8/25, 5:38 PM Transactions and Instructions | Solana https://solana.com/docs/core/transactions 6/17


---

### Page 7

A transaction's total size (signatures and message) must stay under this limit and consists of: Signatures: 64 bytes each Message: Header (3 bytes), account keys (32 bytes each), recent blockhash (32 bytes), and instructions Transaction Format Message Header The message header uses three bytes to deﬁne account privileges: 1. Required signatures and message version (eg. legacy vs v0) 2. Number of read-only signed accounts 3. Number of read-only unsigned accounts MessageHeader 2/8/25, 5:38 PM Transactions and Instructions | Solana https://solana.com/docs/core/transactions 7/17


---

### Page 8

Message Header Compact-Array Format A compact array in a transaction message refers to an array serialized in the following format: 1. The array length (encoded as compact-u16) 2. The array items listed one after another pub struct MessageHeader { /// The number of signatures required for this message to be considered /// valid. The signers of those signatures must match the first /// `num_required_signatures` of [`Message::account_keys`]. pub num_required_signatures: u8, /// The last `num_readonly_signed_accounts` of the signed keys are read-on /// accounts. pub num_readonly_signed_accounts: u8, /// The last `num_readonly_unsigned_accounts` of the unsigned keys are /// read-only accounts. pub num_readonly_unsigned_accounts: u8, } 2/8/25, 5:38 PM Transactions and Instructions | Solana https://solana.com/docs/core/transactions 8/17


---

### Page 9

Compact array format This format is used to encode the lengths of the Account Addresses and Instructions arrays in transaction messages. Array of Account Addresses A transaction message contains an array of account addresses required by its instructions. The array begins with a compact-u16 number indicating how many addresses it contains. The addresses are then ordered based on their privileges, which is determined by the message header. Accounts that are writable and signers Accounts that are read-only and signers Accounts that are writable and not signers Accounts that are read-only and not signers Compact array of account addresses 2/8/25, 5:38 PM Transactions and Instructions | Solana https://solana.com/docs/core/transactions 9/17


---

### Page 10

Recent Blockhash Every transaction requires a recent blockhash that serves two purposes: 1. Acts as a timestamp 2. Prevents duplicate transactions A blockhash expires after 150 blocks (about 1 minute assuming 400ms block times), after which the transaction cannot be processed. You can use the getLatestBlockhash RPC method to get the current blockhash and last block height at which the blockhash will be valid. Here is an example on Solana Playground. Array of Instructions A transaction message contains an array of instructions in the CompiledInstruction type. Instructions are converted to this type when added to a transaction. Like the account addresses array in the message, it starts with a compact-u16 length followed by the instruction data. Each instruction contains: 1. Program ID Index: An u8 index that points to the program's address in the account addresses array. This speciﬁes the program that will process the instruction. 2. Account Indexes: An array of u8 indexes that point to the account addresses required for this instruction. 3. Instruction Data: A byte array specifying which instruction to invoke on the program and any additional data required by the instruction (eg. function arguments). CompiledInstruction pub struct CompiledInstruction { /// Index into the transaction keys array indicating the program account t 2/8/25, 5:38 PM Transactions and Instructions | Solana https://solana.com/docs/core/transactions 10/17


---

### Page 11

Compact array of Instructions Example Transaction Structure Below is an example transaction including a single SOL transfer instruction. The transaction's components include: header: Speciﬁes read/write and signer privileges for addresses in the accountKeys array accountKeys: Array of all account addresses used in the transaction's instructions pub program_id_index: u8, /// Ordered indices into the transaction keys array indicating which accou #[serde(with = "short_vec")] pub accounts: Vec<u8>, /// The program input data. #[serde(with = "short_vec")] pub data: Vec<u8>, } 2/8/25, 5:38 PM Transactions and Instructions | Solana https://solana.com/docs/core/transactions 11/17


---

### Page 12

recentBlockhash: Blockhash used to timestamp the transaction instructions: Array of instructions to execute. Each account and programIdIndex in an instruction references the accountKeys array by index. signatures: Array including signatures for all accounts required as signers by the instructions on the transaction. A signature is created by signing the transaction message using the corresponding private key for an account. Instruction "transaction": { "message": { "header": { "numReadonlySignedAccounts": 0, "numReadonlyUnsignedAccounts": 1, "numRequiredSignatures": 1 }, "accountKeys": [ "3z9vL1zjN6qyAFHhHQdWYRTFAcy69pJydkZmSFBKHg1R", "5snoUseZG8s8CDFHrXY2ZHaCrJYsW457piktDmhyb5Jd", "11111111111111111111111111111111" ], "recentBlockhash": "DzfXchZJoLMG3cNftcf2sw7qatkkuwQf4xH15N5wkKAb", "instructions": [ { "accounts": [ 0, 1 ], "data": "3Bxs4NN8M2Yn4TLb", "programIdIndex": 2, "stackHeight": null } ], "indexToProgramIds": {} }, "signatures": [ "5LrcE2f6uvydKRquEJ8xp19heGxSvqsVbcqUeFoiWbXe8JNip7ftPQNTAVPyTK7ijVdpkzm ] } 2/8/25, 5:38 PM Transactions and Instructions | Solana https://solana.com/docs/core/transactions 12/17


---

### Page 13

An instruction on a deployed program can be thought of as a public function that can be called by anyone using the Solana network. Invoking a program's instruction requires providing three key pieces of information: Program ID: The program being invoked to execute the instruction Accounts: List of accounts the instruction requires Instruction Data: Byte array specifying the instruction on the program to invoke and any function arguments required by the instruction Instruction Transaction Program Address Accounts Instruction Data Instruction Transaction Instruction AccountMeta Each account required by an instruction must be provided as an AccountMeta that contains: Instruction pub struct Instruction { /// Pubkey of the program that executes this instruction. pub program_id: Pubkey, /// Metadata describing accounts that should be passed to the program. pub accounts: Vec<AccountMeta>, /// Opaque data passed to the program for its own interpretation. pub data: Vec<u8>, } 2/8/25, 5:38 PM Transactions and Instructions | Solana https://solana.com/docs/core/transactions 13/17


---

### Page 14

pubkey: Account's address is_signer: Whether the account must sign the transaction is_writable: Whether the instruction will modify the account's data Instruction Transaction Program Address Accounts Instruction Data pubkey AccountMeta is_signer is_writable AccountMeta Instruction pubkey is_signer is_writable AccountMeta By specifying up front which accounts an instruction will read from or write to, transactions that do not modify the same accounts can be processed in parallel. Example Instruction Structure Below is a simple example showing the structure of a SOL transfer instruction: AccountMeta pub struct AccountMeta { /// An account's public key. pub pubkey: Pubkey, /// True if an `Instruction` requires a `Transaction` signature matching ` pub is_signer: bool, /// True if the account data or metadata may be mutated during program exe pub is_writable: bool, } 2/8/25, 5:38 PM Transactions and Instructions | Solana https://solana.com/docs/core/transactions 14/17


---

### Page 15

keys: Includes the AccountMeta for each account required by an instruction. programId: The address of the program which contains the execution logic for the instruction invoked. data: The instruction data for the instruction as a buffer of bytes Expanded Example The details for building program instructions are often abstracted away by client libraries. However, if one is not available, you can always fall back to manually building the instruction. Transfer SOL Here is a Solana Playground example of how to manually build a SOL transfer instruction. Under the hood, the simple example using the SystemProgram.transfer method is functionally equivalent to the more verbose example below. The { "keys": [ { "pubkey": "3z9vL1zjN6qyAFHhHQdWYRTFAcy69pJydkZmSFBKHg1R", "isSigner": true, "isWritable": true }, { "pubkey": "BpvxsLYKQZTH42jjtWHZpsVSa7s6JVwLKwBptPSHXuZc", "isSigner": false, "isWritable": true } ], "programId": "11111111111111111111111111111111", "data": [2, 0, 0, 0, 128, 150, 152, 0, 0, 0, 0, 0] } 2/8/25, 5:38 PM Transactions and Instructions | Solana https://solana.com/docs/core/transactions 15/17


---

### Page 16

SystemProgram.transfer method simply abstracts away the details of creating the instruction data buffer and AccountMeta for each account required by the instruction. The snippets in the two tabs below are functionally equivalent. Build Instruction Manually Use Library Last updated on 2/5/2025 Managed by SOLANA Grants Break Solana Media Kit Careers GET CONNECTED Blog Newsletter // Define the amount to transfer const transferAmount = 0.01; // 0.01 SOL // Instruction index for the SystemProgram transfer instruction const transferInstructionIndex = 2; // Create a buffer for the data to be passed to the transfer instruction const instructionData = Buffer.alloc(4 + 8); // uint32 + uint64 // Write the instruction index to the buffer instructionData.writeUInt32LE(transferInstructionIndex, 0); // Write the transfer amount to the buffer instructionData.writeBigUInt64LE(BigInt(transferAmount * LAMPORTS_PER_SOL), 4 // Manually create a transfer instruction for transferring SOL from sender to const transferInstruction = new TransactionInstruction({ keys: [ { pubkey: sender.publicKey, isSigner: true, isWritable: true }, { pubkey: receiver.publicKey, isSigner: false, isWritable: true }, ], programId: SystemProgram.programId, data: instructionData, }); // Add the transfer instruction to a new transaction const transaction = new Transaction().add(transferInstruction); 2/8/25, 5:38 PM Transactions and Instructions | Solana https://solana.com/docs/core/transactions 16/17


---

### Page 17

Loading comments… Previous Solana Account Model Next Fees on Solana Disclaimer Privacy Policy EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 5:38 PM Transactions and Instructions | Solana https://solana.com/docs/core/transactions 17/17


---

# How to test Solana programs _ Solana.pdf

### Page 1

Solana Documentation The Solana Toolkit Test Suite Solana Testing Basics “This is a beta version of the Solana Toolkit, and is still a WIP. Please post all feedback as a GitHub issue here.” Installation Install the Solana Toolkit and mucho CLI by running the following command: Build Start Localnet npx -y mucho@latest install mucho build Documentation API Cookbook Courses Guides Get Support Table of Contents Installation 2/8/25, 6:02 PM How to test Solana programs | Solana https://solana.com/docs/toolkit/test-suite/basics 1/3


---

### Page 2

Run Tests Anchor Programs: Native Programs: Deploy For more information on local validator customization and commands, read the Solana Test Validator Guide. Last updated on 2/4/2025 Loading comments… mucho validator anchor test cargo test mucho deploy 2/8/25, 6:02 PM How to test Solana programs | Solana https://solana.com/docs/toolkit/test-suite/basics 2/3


---

### Page 3

Previous Overview Next Code Coverage Managed by SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 6:02 PM How to test Solana programs | Solana https://solana.com/docs/toolkit/test-suite/basics 3/3


---

# Proposed Inflation Schedule _ Solana.pdf

### Page 1

Solana Documentation Economics Inﬂation Proposed Inflation Schedule As mentioned above, the network's Inﬂation Schedule is uniquely described by three parameters: Initial Inﬂation Rate, Disinﬂation Rate and Long-term Inﬂation Rate. When considering these numbers, there are many factors to take into account: A large portion of the SOL issued via inﬂation will be distributed to stake-holders in proportion to the SOL they have staked. We want to ensure that the Inﬂation Schedule design results in reasonable Staking Yields for token holders who delegate SOL and for validation service providers (via commissions taken from Staking Yields). The primary driver of Staked Yield is the amount of SOL staked divided by the total amount of SOL (% of total SOL staked). Therefore the distribution and delegation of tokens across validators are important factors to understand when determining initial inﬂation parameters. Yield throttling is a current area of research that would impact staking-yields. This is not taken into consideration in the discussion here or the modeling below. Overall token issuance - i.e. what do we expect the Current Total Supply to be in 10 years, or 20 years? Long-term, steady-state inﬂation is an important consideration not only for sustainable support for the validator ecosystem and the Solana Foundation grant programs, but also should be tuned in consideration with expected token losses and burning over time. Documentation API Cookbook Courses Guides Get Support Table of Contents 2/8/25, 5:43 PM Proposed Inﬂation Schedule | Solana https://solana.com/docs/economics/inﬂation/inﬂation-schedule 1/5


---

### Page 2

The rate at which we expect network usage to grow, as a consideration to the disinﬂationary rate. Over time, we plan for inﬂation to drop and expect that usage will grow. Based on these considerations and the community discussions following the initial design, the Solana Foundation proposes the following Inﬂation Schedule parameters: Initial Inﬂation Rate: 8% Disinﬂation Rate: -15% Long-term Inﬂation Rate: 1.5% These parameters deﬁne the proposed Inﬂation Schedule. Below we show implications of these parameters. These plots only show the impact of inﬂation issuances given the Inﬂation Schedule as parameterized above. They do not account for other factors that may impact the Total Supply such as fee/rent burning, slashing or other unforeseen future token destruction events. Therefore, what is presented here is an upper limit on the amount of SOL issued via inﬂation. Example proposed inﬂation schedule graph 2/8/25, 5:43 PM Proposed Inﬂation Schedule | Solana https://solana.com/docs/economics/inﬂation/inﬂation-schedule 2/5


---

### Page 3

In the above graph we see the annual inﬂation rate percentage over time, given the inﬂation parameters proposed above. Example proposed total supply graph Similarly, here we see the Total Current Supply of SOL [MM] over time, assuming an initial Total Current Supply of 488,587,349 SOL (i.e. for this example, taking the Total Current Supply as of 2020-01-25 and simulating inﬂation starting from that day). Setting aside validator uptime and commissions, the expected Staking Yield and Adjusted Staking Yield metrics are then primarily a function of the % of total SOL staked on the network. Therefore we can model Staking Yield, if we introduce an additional parameter % of Staked SOL: This parameter must be estimated because it is a dynamic property of the token holders and staking incentives. The values of % of Staked SOL presented here range from 60% - 90%, which we feel covers the likely range we expect to observe, based on feedback from the investor and validator communities as well as what is observed on comparable Proof-of-Stake protocols. 2/8/25, 5:43 PM Proposed Inﬂation Schedule | Solana https://solana.com/docs/economics/inﬂation/inﬂation-schedule 3/5


---

### Page 4

Example staked yields graph Again, the above shows an example Staked Yield that a staker might expect over time on the Solana network with the Inﬂation Schedule as speciﬁed. This is an idealized Staked Yield as it neglects validator uptime impact on rewards, validator commissions, potential yield throttling and potential slashing incidents. It additionally ignores that % of Staked SOL is dynamic by design - the economic incentives set up by this Inﬂation Schedule are more clearly seen when Token Dilution is taken into account (see the Adjusted Staking Yield section below). Last updated on 2/4/2025 1 reaction 👍 1 1 comment– powered by giscus Previous Next 2/8/25, 5:43 PM Proposed Inﬂation Schedule | Solana https://solana.com/docs/economics/inﬂation/inﬂation-schedule 4/5


---

### Page 5

Economics Inﬂation Terminology Managed by SOLANA Grants Break Solana Media Kit Careers Disclaimer Privacy Policy GET CONNECTED Blog Newsletter EN © 2025 Solana Foundation. All rights reserved. 2/8/25, 5:43 PM Proposed Inﬂation Schedule | Solana https://solana.com/docs/economics/inﬂation/inﬂation-schedule 5/5


---

