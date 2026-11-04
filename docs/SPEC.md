CRYPTEX — Cryptocurrency Exchange Operations Simulator

Application Design Specification (ADS)

Project Type: Interactive Cryptocurrency Exchange Simulator and Educational Development Environment
Frontend: React + TypeScript
UI Framework: ENTERPRISE-UI
Runtime: Browser-based application
Primary Purpose: Teach users how cryptocurrency exchanges operate internally through an interactive, continuously simulated exchange environment.

⸻

1. Project Vision

Build a comprehensive cryptocurrency exchange simulation platform where the user owns, operates, and manages a cryptocurrency exchange.

The application should simulate the complete operational lifecycle of a cryptocurrency exchange, including:

* Customer account management.
* Cryptocurrency deposits and withdrawals.
* Spot trading.
* Cryptocurrency conversions.
* Order books and matching engines.
* Internal exchange ledgers.
* Hot wallet management.
* Cold wallet management.
* Wallet replenishment and fund sweeping.
* Blockchain transaction processing.
* Network fees and transaction confirmations.
* Liquidity management.
* Exchange reserves.
* Smart contract development using Solidity.
* Ethereum-compatible blockchain simulation.
* Exchange security and operational monitoring.

The exchange must operate continuously in the background.

Simulated customers should constantly generate deposits, withdrawals, trades, conversions, and other activities. These activities must create actual state changes within the simulated exchange.

The user is responsible for maintaining exchange operations, managing liquidity, ensuring withdrawals can be fulfilled, maintaining sufficient hot wallet balances, and protecting the exchange’s cold storage.

The central experience:

The user isn’t watching an animation of an exchange. They are operating a functioning simulated exchange with interconnected systems, financial records, wallets, transaction queues, and operational consequences.

2. Core Design Principles

2.1 Realistic Exchange Simulation

Every major application subsystem should be interconnected.

For example:

1. A simulated customer deposits 2.5 ETH.
2. The blockchain simulator generates a deposit transaction.
3. The deposit enters the confirmation queue.
4. The transaction receives simulated network confirmations.
5. The exchange recognizes the deposit.
6. The customer’s internal exchange balance increases.
7. The deposit wallet’s blockchain balance increases.
8. The exchange’s accounting ledger records the transaction.
9. The exchange’s wallet management system schedules funds for sweeping.
10. The operator can transfer the funds into hot or cold storage.

Every step should be visible and inspectable.

2.2 Continuous Simulation

The exchange must operate independently of user interaction.

Simulated customers should constantly perform activities.

The simulation should include:

* Randomized customer behavior.
* Different trading strategies.
* Different transaction sizes.
* Deposits and withdrawals.
* Market fluctuations.
* Liquidity changes.
* Blockchain network congestion.
* Transaction failures.
* Exchange operational incidents.

The user should be able to pause, resume, accelerate, and slow down the simulation.

2.3 Educational Transparency

Every major subsystem should explain what it does.

Provide contextual explanations, system diagrams, tooltips, and detailed transaction inspection panels.

Users should be able to follow a transaction from its initial request through every subsystem it touches.

2.4 Simulation-Only Environment

The application must never connect to real cryptocurrency wallets, exchanges, or financial networks.

All funds, transactions, customers, private keys, blockchain activity, and smart contract deployments must be simulated.

Clearly distinguish simulated blockchain activity from real blockchain activity.

3. Application Architecture

Organize the application into independent but interconnected operational subsystems.

3.1 Main Subsystems

1. Exchange Core
2. Customer Management
3. Trading Engine
4. Order Matching Engine
5. Wallet Management
6. Hot Wallet Operations
7. Cold Storage Operations
8. Deposit Processing
9. Withdrawal Processing
10. Internal Ledger
11. Blockchain Simulator
12. Market Data Engine
13. Liquidity Management
14. Security and Compliance
15. Smart Contract Development Environment
16. Analytics and Reporting
17. Simulation Engine
18. Incident Management

Each subsystem must expose its current state, operational metrics, and event history.

4. Application Navigation

Use a professional enterprise exchange operations interface.

The primary navigation should include:

Overview

* Exchange Dashboard
* Live Activity
* System Health

Exchange

* Customers
* Trading
* Order Books
* Markets
* Liquidity
* Internal Ledger

Wallets

* Wallet Overview
* Deposit Wallets
* Hot Wallets
* Cold Storage
* Wallet Transfers
* Withdrawal Queue

Blockchain

* Blockchain Explorer
* Network Monitor
* Transaction Queue
* Block Explorer
* Gas Tracker

Development

* Solidity IDE
* Smart Contracts
* Contract Deployments
* Contract Explorer

Operations

* Transaction Monitoring
* Security Center
* Risk Management
* Incident Management
* Audit Logs

Analytics

* Exchange Performance
* Trading Analytics
* Wallet Analytics
* Revenue and Fees
* Customer Analytics

Simulation

* Simulation Controls
* Customer Behavior
* Market Conditions
* Scenario Builder
* Historical Replay

5. Exchange Operations Dashboard

The dashboard is the exchange’s primary command center.

It should provide a real-time overview of everything happening within the exchange.

5.1 Key Metrics

Display:

* Total customers.
* Active customers.
* Total exchange assets.
* Total customer liabilities.
* Exchange reserves.
* Total trading volume.
* 24-hour trading volume.
* Total deposits.
* Total withdrawals.
* Pending transactions.
* Failed transactions.
* Hot wallet utilization.
* Cold wallet reserves.
* Available withdrawal liquidity.
* Total trading fees collected.
* Blockchain network health.

Support multiple cryptocurrencies and display both individual asset balances and their simulated USD equivalent.

5.2 Live Transaction Feed

Create a constantly updating transaction feed.

Example:

Time	Event	Asset	Amount	Status
14:32:01	Deposit	ETH	2.50	Confirmed
14:32:03	Trade	BTC	0.015	Filled
14:32:04	Withdrawal	USDT	850	Processing
14:32:06	Conversion	ETH/BTC	0.75 ETH	Completed
14:32:08	Deposit	BTC	0.025	Confirming
14:32:09	Wallet Transfer	ETH	15.00	Processing

Transactions should appear continuously.

Allow users to:

* Filter by transaction type.
* Filter by cryptocurrency.
* Filter by status.
* Inspect individual transactions.
* Open the customer’s account.
* View the originating wallet.
* Follow the transaction through the system.

5.3 Exchange System Map

Create an interactive visualization of the exchange’s internal infrastructure.

Represent the flow of funds between:

Customer Wallets → Deposit Wallets → Hot Wallets → Cold Storage

And:

Cold Storage → Hot Wallets → Withdrawal Processing → Customer Wallets

The visualization should show:

* Wallet balances.
* Transaction volume.
* Pending transfers.
* Transaction direction.
* Network status.
* Wallet utilization.
* Active transaction animations.

Selecting a component should open its detailed operational view.

6. Cryptocurrency Markets and Trading

Implement a simulated cryptocurrency trading environment.

6.1 Supported Assets

Initially support:

* Bitcoin (BTC)
* Ethereum (ETH)
* Tether (USDT)
* USD Coin (USDC)
* Solana (SOL)
* Litecoin (LTC)
* XRP
* Dogecoin (DOGE)

All asset prices should be generated by the simulation engine.

6.2 Market Interface

Provide:

* Live price charts.
* Candlestick charts.
* Trading volume.
* Market capitalization.
* Price movements.
* Bid and ask prices.
* Spread.
* Recent trades.
* Order book depth.

Market prices should fluctuate continuously based on simulated market activity.

6.3 Trading Engine

Implement a functional simulated spot trading system.

Supported order types:

* Market orders.
* Limit orders.
* Stop-limit orders.

Customers should be able to:

* Buy cryptocurrencies.
* Sell cryptocurrencies.
* Exchange one cryptocurrency for another.

The user should be able to manually execute trades through an exchange operator account.

6.4 Order Matching Engine

Implement a price-time priority matching engine.

The engine must:

* Maintain buy and sell order books.
* Match compatible orders.
* Support partial fills.
* Calculate trading fees.
* Update customer balances.
* Update internal ledger entries.
* Publish trade events.
* Handle insufficient balances.
* Handle canceled orders.

Provide an order book visualization showing bids and asks.

Include an educational mode explaining why specific orders were matched.

7. Customer Management

Simulate a population of exchange customers.

Each customer should have:

* Unique customer ID.
* Name.
* Account creation date.
* Verification status.
* Account status.
* Cryptocurrency balances.
* Transaction history.
* Trading history.
* Deposit history.
* Withdrawal history.
* Risk classification.
* Trading behavior profile.

7.1 Customer Behavior Profiles

Generate different types of customers:

Casual Traders

* Occasional purchases.
* Small deposits.
* Infrequent withdrawals.

Day Traders

* Frequent buy/sell orders.
* Higher transaction volume.
* Rapid balance changes.

Long-Term Investors

* Large deposits.
* Infrequent trades.
* Long-term asset accumulation.

High-Volume Traders

* Large transactions.
* Frequent withdrawals.
* Significant liquidity demand.

Arbitrage Traders

* Rapid conversions.
* Exploit simulated market price differences.

Automated Trading Bots

* Generate algorithmic orders.
* React to market conditions.
* Create high-frequency activity.

Customer behavior should influence actual exchange operations.

8. Wallet Management

Wallet management is one of the most important components of the application.

The user must understand the difference between customer account balances and the exchange’s actual blockchain wallet balances.

8.1 Wallet Architecture

Implement the following wallet types.

Deposit Wallets

Used to receive cryptocurrency from customers.

Each customer should have simulated deposit addresses for supported assets.

Responsibilities:

* Receive deposits.
* Detect incoming transactions.
* Track confirmations.
* Associate deposits with customers.
* Schedule fund sweeping.

Hot Wallets

Online operational wallets used to fulfill withdrawals.

Each cryptocurrency should have one or more hot wallets.

Display:

* Current balance.
* Available balance.
* Reserved balance.
* Pending outgoing transactions.
* Pending incoming transfers.
* Withdrawal demand.
* Target reserve.
* Minimum reserve.
* Maximum reserve.
* Wallet utilization.

Hot wallets should have configurable operational thresholds.

Example:

ETH Hot Wallet:

* Current balance: 125 ETH.
* Minimum reserve: 50 ETH.
* Target reserve: 150 ETH.
* Maximum reserve: 200 ETH.
* Pending withdrawals: 42 ETH.
* Pending deposits: 15 ETH.

When the available balance approaches the minimum reserve, the application should generate a liquidity warning.

Cold Wallets

Cold wallets represent offline storage.

They should contain the majority of exchange reserves.

Display:

* Total balance.
* Available balance.
* Reserved balance.
* Asset allocation.
* Security status.
* Recent transfers.
* Transfer history.

Cold storage should not automatically fulfill withdrawals.

The user must authorize transfers from cold storage into hot wallets.

8.2 Wallet Operations

Implement the following operations:

* Transfer between deposit wallets and hot wallets.
* Transfer between hot wallets.
* Transfer between hot wallets and cold storage.
* Transfer between cold wallets.
* Consolidate funds.
* Sweep deposit wallets.
* Replenish hot wallets.
* Withdraw funds from hot wallets.

Every transfer must create a simulated blockchain transaction when it represents an on-chain movement.

Internal ledger transfers must be distinguished from actual simulated blockchain transfers.

8.3 Wallet Replenishment System

This should be a major gameplay mechanic.

Customers continuously submit withdrawals.

The system must estimate future withdrawal demand and determine whether hot wallets have sufficient liquidity.

The user should be able to:

1. Inspect hot wallet balances.
2. View pending withdrawal demand.
3. Review predicted withdrawal demand.
4. Select a cold wallet.
5. Enter a transfer amount.
6. Review network fees.
7. Authorize the transfer.
8. Monitor transaction confirmations.
9. Verify the hot wallet’s updated balance.

Implement configurable replenishment policies.

Examples:

* Replenish when below minimum balance.
* Replenish to target balance.
* Replenish based on predicted withdrawal demand.
* Maintain a percentage of total reserves in hot storage.

Do not automatically move funds out of cold storage without an explicitly enabled policy.

9. Deposit Processing

Implement a complete simulated cryptocurrency deposit pipeline.

Deposit lifecycle:

1. Customer initiates a deposit.
2. Blockchain simulator generates a transaction.
3. Deposit enters the network mempool.
4. Transaction is included in a simulated block.
5. Confirmations accumulate.
6. Deposit is detected by the exchange.
7. Deposit is validated.
8. Internal ledger entry is created.
9. Customer balance is credited.
10. Deposit is marked completed.
11. Deposit wallet funds become eligible for sweeping.

Provide configurable confirmation requirements per blockchain.

Allow deposits to experience:

* Delayed confirmations.
* Low network fees.
* Failed transactions.
* Incorrect deposit amounts.
* Duplicate event notifications.
* Reorganization scenarios.

The system must handle duplicate deposit notifications without crediting customers twice.

10. Withdrawal Processing

Implement a complete simulated withdrawal pipeline.

Withdrawal lifecycle:

1. Customer submits a withdrawal request.
2. Exchange checks account status.
3. Exchange checks available customer balance.
4. Risk checks are performed.
5. Withdrawal fee is calculated.
6. Request enters the withdrawal queue.
7. Hot wallet liquidity is checked.
8. Transaction is constructed.
9. Transaction enters the blockchain mempool.
10. Transaction is included in a block.
11. Confirmations accumulate.
12. Customer withdrawal is completed.
13. Internal ledger records the final settlement.

Withdrawal statuses:

* Requested.
* Under Review.
* Approved.
* Awaiting Liquidity.
* Queued.
* Processing.
* Broadcast.
* Confirming.
* Completed.
* Failed.
* Rejected.

If hot wallet liquidity is insufficient, the request should remain queued.

The user must be able to inspect the queue and replenish the appropriate hot wallet.

11. Internal Accounting Ledger

Implement a double-entry accounting ledger.

This is essential for understanding how exchanges track customer funds.

Every financial operation must produce balanced accounting entries.

Examples:

* Customer deposits.
* Customer withdrawals.
* Trading transactions.
* Trading fees.
* Network fees.
* Internal transfers.
* Wallet sweeping.
* Wallet replenishment.
* Conversion transactions.

The ledger must distinguish:

1. Customer liabilities.
2. Exchange-controlled blockchain assets.
3. Exchange revenue.
4. Network fee expenses.
5. Operational reserves.

Provide:

* Ledger explorer.
* Transaction journal.
* Account balances.
* Asset reconciliation.
* Historical snapshots.
* Audit trail.

The user should be able to open a transaction and inspect its corresponding accounting entries.

Important: Internal customer balances must never be confused with actual blockchain wallet balances.

12. Blockchain Simulator

Create an Ethereum-inspired blockchain simulation, with extensible support for additional networks.

The blockchain simulator must be a functioning subsystem rather than a visual representation.

12.1 Blockchain Features

Implement:

* Simulated blockchain accounts.
* Wallet addresses.
* Transaction hashes.
* Nonces.
* Gas prices.
* Gas limits.
* Transaction fees.
* Mempool.
* Block production.
* Block confirmations.
* Transaction receipts.
* Transaction failures.
* Network congestion.
* Transaction replacement.
* Smart contract execution.

12.2 Blockchain Explorer

Provide a simulated block explorer.

Display:

* Latest blocks.
* Block heights.
* Block timestamps.
* Transactions per block.
* Gas utilization.
* Transaction fees.
* Sender addresses.
* Recipient addresses.
* Transaction hashes.
* Contract interactions.

Users should be able to inspect any transaction and trace it back to the exchange operation that generated it.

12.3 Network Conditions

Allow the simulation to generate:

* Normal network conditions.
* Congested networks.
* High gas prices.
* Low gas prices.
* Delayed block production.
* Failed transactions.
* Transaction backlogs.

Network conditions should directly affect exchange operations.

13. Ethereum Solidity Development Environment

Create an integrated Solidity IDE.

The user should be able to write, compile, deploy, and interact with simulated Ethereum smart contracts.

13.1 Solidity Editor

Implement:

* Syntax highlighting.
* Code completion where practical.
* Solidity file management.
* Multiple open files.
* Code formatting.
* Compiler configuration.
* Compilation output.
* Error reporting.
* Warning reporting.

Use the Monaco Editor or another suitable TypeScript-compatible code editor.

13.2 Solidity Compiler

Integrate the Solidity compiler using a compatible browser-side compiler package.

Support:

* Compiler version selection.
* Solidity compilation.
* ABI generation.
* Bytecode generation.
* Compilation errors.
* Compiler warnings.
* Optimization settings.

Compilation must occur locally in the browser.

13.3 Contract Deployment

Allow users to deploy compiled contracts to the simulated Ethereum blockchain.

Deployment workflow:

1. Write Solidity code.
2. Compile the contract.
3. Review ABI and bytecode.
4. Select a simulated deployment account.
5. Configure deployment parameters.
6. Estimate simulated gas costs.
7. Submit deployment transaction.
8. Wait for block inclusion.
9. Receive a simulated contract address.
10. Inspect the deployed contract.

13.4 Contract Interaction

After deployment, users should be able to:

* Read public variables.
* Execute read-only functions.
* Call state-changing functions.
* Send simulated ETH.
* Inspect emitted events.
* Review transaction receipts.
* Inspect execution errors.
* View contract storage where supported.

13.5 Example Smart Contracts

Provide educational examples:

* ERC-20 token.
* ERC-721 NFT.
* Multi-signature wallet.
* Escrow contract.
* Token swap contract.
* Simple staking contract.
* Basic liquidity pool.

The application should explain the purpose of each contract.

Contract execution should use a deterministic, sandboxed EVM implementation with simulated accounts and balances.

Never execute arbitrary compiled contract bytecode directly against application infrastructure.

14. Liquidity Management

Create a dedicated liquidity management subsystem.

The user must understand how much liquidity is available across the exchange.

Display:

* Total reserves per cryptocurrency.
* Hot wallet liquidity.
* Cold wallet reserves.
* Customer liabilities.
* Available withdrawal liquidity.
* Pending withdrawal obligations.
* Expected deposits.
* Net asset position.
* Reserve ratios.

Provide liquidity forecasting.

For example:

ETH:

* Hot wallet: 125 ETH.
* Pending withdrawals: 90 ETH.
* Expected deposits: 15 ETH.
* Forecasted shortfall: 20 ETH.

Generate alerts when liquidity is insufficient.

Provide historical liquidity charts and reserve allocation visualizations.

15. Security and Compliance Simulation

Simulate common operational security challenges.

Include:

* Suspicious withdrawal patterns.
* Unusual account activity.
* Large withdrawal alerts.
* Repeated failed login attempts.
* Unusual transaction destinations.
* Account withdrawal holds.
* Withdrawal approval workflows.
* Multi-signature authorization.
* Cold storage transfer approval.
* Audit logging.

Create a simulated incident management center.

Example incidents:

* Hot wallet unexpectedly depleted.
* Suspicious withdrawal requests.
* Blockchain network congestion.
* Deposit processing backlog.
* Ledger reconciliation mismatch.
* Unusual trading volume.
* Smart contract execution failure.

Incidents should have severity levels, descriptions, affected subsystems, recommended actions, and resolution workflows.

16. Simulation Engine

The simulation engine is the heart of the application.

It must generate realistic, interconnected exchange activity.

16.1 Simulation Controls

Provide:

* Start simulation.
* Pause simulation.
* Resume simulation.
* Reset simulation.
* Simulation speed.
* Customer population.
* Transaction frequency.
* Market volatility.
* Network congestion.
* Withdrawal demand.
* Deposit frequency.
* Trading activity.

Provide simulation speeds:

* 0.5x
* 1x
* 2x
* 5x
* 10x
* 25x
* 50x

16.2 Customer Activity Generation

Generate independent customer activities.

Examples:

* Customer deposits 0.5 BTC.
* Customer buys 2 ETH.
* Customer sells 500 USDT worth of SOL.
* Customer withdraws 1.2 ETH.
* Customer converts BTC into USDT.
* Trading bot places a limit order.
* Arbitrage bot executes multiple trades.

Activity must be generated through actual application services.

Do not simply animate transaction rows.

16.3 Market Simulation

Generate realistic market movements using:

* Random walk models.
* Configurable volatility.
* Buy/sell pressure.
* Simulated market depth.
* Large market orders.
* Trading activity.
* Market events.

Avoid completely independent random prices for each asset. Correlate assets where appropriate.

16.4 Operational Events

Generate occasional operational challenges.

Examples:

* Sudden increase in ETH withdrawals.
* BTC network congestion.
* Deposit processing delays.
* Hot wallet balance below minimum.
* Cold wallet replenishment required.
* Failed blockchain transactions.
* Sudden trading volume spike.
* Suspicious account behavior.

These events should create actual operational consequences.

16.5 Scenario Builder

Allow the user to create custom scenarios.

Examples:

* 500 customers suddenly withdraw ETH.
* ETH gas fees increase by 500%.
* BTC deposits stop confirming.
* Hot wallet loses 70% of its balance.
* Market prices drop 30%.
* A large customer withdraws 50 BTC.
* Exchange experiences a trading volume spike.

The user should be able to observe and respond to the consequences.

17. Operational Gameplay and Progression

Introduce a progression system to make the experience engaging.

The user starts with a small exchange.

As operational performance improves, the exchange grows.

17.1 Exchange Growth

Progress through exchange tiers:

1. Startup Exchange.
2. Growing Exchange.
3. Established Exchange.
4. High-Volume Exchange.
5. Institutional Exchange.

Each tier introduces:

* More customers.
* Higher transaction volume.
* More cryptocurrency assets.
* Increased liquidity requirements.
* More complex wallet infrastructure.
* Higher withdrawal demand.
* Additional security requirements.
* More sophisticated operational challenges.

17.2 Performance Metrics

Evaluate the operator based on:

* Withdrawal fulfillment time.
* Hot wallet availability.
* Cold storage security.
* Transaction processing efficiency.
* Ledger accuracy.
* Reserve management.
* Incident response.
* Network fee optimization.
* Customer satisfaction.

Provide performance reports and operational achievements.

17.3 Avoid Punishing Learning

Provide optional training mode.

In training mode:

* Explain every operation.
* Provide recommended actions.
* Allow transaction inspection.
* Show the consequences of mistakes.
* Allow scenarios to be restarted.

Advanced mode should remove most assistance and allow users to operate independently.

18. User Interface and Visual Design

Use ENTERPRISE-UI as the primary UI framework.

Do not introduce a separate component library or duplicate ENTERPRISE-UI functionality.

The application should look like professional enterprise financial infrastructure software.

18.1 Design Direction

Visual identity:

* Dark graphite operational interface.
* Professional enterprise styling.
* Subtle financial technology aesthetics.
* High-density information layouts.
* Carefully structured data tables.
* Clear system status indicators.
* Consistent typography.
* Restrained accent colors.
* Technical charts and visualizations.

Support both dark and light themes.

18.2 Layout

Use a persistent application shell.

Header:

* Exchange name.
* Exchange operational status.
* Simulation status.
* Simulation speed.
* Global search.
* Notifications.
* User profile.

Sidebar:

* Primary application navigation.
* Expandable navigation groups.
* Active route indication.

Main Workspace:

* Page-specific operational content.
* Configurable dashboard widgets.
* Contextual detail panels.
* Drill-down navigation.

Activity Panel:

* Optional live transaction feed.
* System events.
* Alerts.
* Operational notifications.

18.3 ENTERPRISE-UI Requirements

Before implementation:

1. Inspect the ENTERPRISE-UI repository.
2. Read its documentation.
3. Identify available components and patterns.
4. Reuse existing components.
5. Identify missing components.
6. Extend ENTERPRISE-UI only when necessary.
7. Follow its established architecture and conventions.

Create reusable application components using ENTERPRISE-UI patterns.

Do not build one-off implementations when an existing framework component can satisfy the requirement.

19. Technical Architecture

Use React and TypeScript.

Prefer a modular architecture with independent domain services.

Suggested structure:

src/
app/
App.tsx
router/
layouts/
providers/

components/
common/
charts/
tables/
transaction/
wallets/
blockchain/

modules/
dashboard/
customers/
trading/
orderbook/
wallets/
deposits/
withdrawals/
ledger/
liquidity/
blockchain/
contracts/
security/
analytics/
simulation/

core/
events/
state/
simulation/
persistence/
configuration/

engines/
exchange/
matching/
accounting/
blockchain/
market/
wallet/
evm/

services/
customer/
transaction/
wallet/
market/
blockchain/
ledger/
contract/

models/
customer/
transaction/
wallet/
market/
blockchain/
accounting/

workers/
simulation.worker.ts
market.worker.ts
blockchain.worker.ts

utils/
types/
hooks/

App.tsx
main.tsx

19.1 State Management

Use a predictable state management approach.

Separate:

* Application UI state.
* Exchange domain state.
* Simulation state.
* Blockchain state.
* Market state.
* Persistent state.

Avoid putting the entire exchange simulation into React component state.

Use domain services and event-driven state updates.

19.2 Event-Driven Architecture

Implement a centralized event bus.

Example events:

CUSTOMER_CREATED
DEPOSIT_DETECTED
DEPOSIT_CONFIRMED
WITHDRAWAL_REQUESTED
WITHDRAWAL_APPROVED
WITHDRAWAL_QUEUED
WITHDRAWAL_COMPLETED
TRADE_EXECUTED
ORDER_MATCHED
WALLET_BALANCE_CHANGED
WALLET_TRANSFER_REQUESTED
WALLET_TRANSFER_COMPLETED
HOT_WALLET_LOW
BLOCK_MINED
BLOCKCHAIN_TRANSACTION_CONFIRMED
CONTRACT_DEPLOYED
SECURITY_INCIDENT_CREATED

Subsystems should subscribe to relevant events.

Events must have unique identifiers, timestamps, correlation identifiers, and typed payloads.

Implement idempotent event processing to prevent duplicate financial operations.

19.3 Simulation Performance

Run computationally expensive simulation workloads outside the React rendering thread.

Use Web Workers for:

* Customer activity generation.
* Market simulation.
* Blockchain block production.
* Transaction processing where appropriate.

Use batched state updates to prevent excessive React rendering.

The UI should remain responsive during high transaction volumes.

19.4 Persistence

Use IndexedDB for browser persistence.

Persist:

* Exchange configuration.
* Customers.
* Wallets.
* Balances.
* Orders.
* Trades.
* Ledger entries.
* Blockchain state.
* Contracts.
* Simulation settings.
* Historical events.
* Achievements.

Provide:

* Save state.
* Load state.
* Export simulation.
* Import simulation.
* Reset exchange.

Use schema versioning and migrations.

20. Financial Integrity Requirements

This application must prioritize accounting correctness.

Implement the following safeguards:

1. All asset balances must use integer base units rather than JavaScript floating-point arithmetic.
2. Use BigInt or a suitable arbitrary-precision decimal implementation.
3. Every ledger transaction must balance.
4. Customer liabilities must be accounted for independently of wallet balances.
5. Blockchain transactions must have unique hashes.
6. Deposits must be credited exactly once.
7. Withdrawals must reserve customer funds before processing.
8. Failed withdrawals must release reserved balances correctly.
9. Network fees must be accounted for separately.
10. Wallet transfers must not create or destroy assets.
11. Every state-changing operation must be auditable.
12. Exchange assets and customer liabilities must be reconcilable.

Create automated reconciliation processes.

Display discrepancies rather than silently correcting them.

21. Educational System

Provide an integrated learning system.

Each subsystem should include:

* What it does.
* Why it exists.
* How it works.
* What information it receives.
* What information it produces.
* Which other subsystems depend on it.
* Common failure conditions.
* Practical examples.

21.1 Interactive Transaction Tracing

Allow users to select any transaction and see its complete lifecycle.

Example:

Customer Withdrawal: 2.5 ETH

Customer Account
↓
Withdrawal Request
↓
Risk Verification
↓
Internal Balance Reservation
↓
Withdrawal Queue
↓
Hot Wallet Liquidity Check
↓
Blockchain Transaction Construction
↓
Mempool
↓
Block Inclusion
↓
Confirmation Monitoring
↓
Ledger Settlement
↓
Customer Withdrawal Completed

Users should be able to select each stage to learn exactly what happened.

21.2 Learning Exercises

Include guided exercises:

* Process your first deposit.
* Complete a withdrawal.
* Replenish an ETH hot wallet.
* Sweep a deposit wallet.
* Resolve a liquidity shortage.
* Investigate a failed transaction.
* Reconcile exchange reserves.
* Deploy your first ERC-20 token.
* Diagnose a blockchain congestion incident.

22. Testing Requirements

Build comprehensive automated tests.

Unit Tests

* Wallet balance calculations.
* Ledger accounting.
* Order matching.
* Trading fees.
* Deposit processing.
* Withdrawal processing.
* Gas calculations.
* Transaction state transitions.
* Contract compilation and execution.

Integration Tests

* Complete deposit lifecycle.
* Complete withdrawal lifecycle.
* Hot wallet replenishment.
* Cold storage transfers.
* Trading and settlement.
* Blockchain confirmation processing.
* Ledger reconciliation.
* Smart contract deployment.

Simulation Tests

* High-volume customer activity.
* Simultaneous withdrawals.
* Hot wallet depletion.
* Network congestion.
* Failed transactions.
* Duplicate events.
* Exchange recovery after restart.

UI Tests

* Dashboard functionality.
* Navigation.
* Wallet operations.
* Transaction inspection.
* Trading workflows.
* Solidity editor.
* Simulation controls.

23. Development Milestones

Build the application in independently testable phases.

Phase 1 — Application Foundation

* React and TypeScript setup.
* ENTERPRISE-UI integration.
* Application shell.
* Navigation.
* Theme system.
* Dashboard layout.
* Domain model foundation.

Phase 2 — Exchange Core

* Customer management.
* Asset management.
* Internal balances.
* Double-entry ledger.
* Event bus.
* Transaction history.

Phase 3 — Trading Engine

* Market simulation.
* Order books.
* Matching engine.
* Spot trading.
* Trading fees.
* Customer trading activity.

Phase 4 — Wallet Infrastructure

* Deposit wallets.
* Hot wallets.
* Cold wallets.
* Wallet transfers.
* Wallet sweeping.
* Hot wallet replenishment.

Phase 5 — Blockchain Simulation

* Accounts.
* Transactions.
* Mempool.
* Block production.
* Confirmations.
* Blockchain explorer.
* Network congestion.

Phase 6 — Deposits and Withdrawals

* Deposit lifecycle.
* Withdrawal lifecycle.
* Queue management.
* Liquidity checks.
* Blockchain settlement.

Phase 7 — Continuous Simulation

* Customer generation.
* Background activity.
* Market behavior.
* Operational incidents.
* Simulation controls.

Phase 8 — Solidity Development Environment

* Solidity editor.
* Compiler integration.
* ABI and bytecode.
* EVM integration.
* Contract deployment.
* Contract interaction.

Phase 9 — Security and Analytics

* Risk monitoring.
* Incident management.
* Reserve analytics.
* Reconciliation.
* Audit logging.

Phase 10 — Educational Experience

* Interactive system maps.
* Transaction tracing.
* Learning exercises.
* Training scenarios.
* Exchange progression.

24. Definition of Done

The application is not considered complete simply because the individual screens exist.

The exchange must operate as an interconnected simulation.

A successful implementation must demonstrate the following scenario:

1. Start the exchange simulation.
2. Generate a population of simulated customers.
3. Customers begin depositing cryptocurrencies.
4. Deposits enter the simulated blockchain.
5. Deposits receive confirmations.
6. Customer exchange balances are credited.
7. Customers begin trading.
8. The matching engine executes orders.
9. Internal ledgers record all trades.
10. Customers begin requesting withdrawals.
11. Withdrawal requests enter processing queues.
12. Hot wallets begin losing liquidity.
13. The system detects insufficient hot wallet reserves.
14. The operator receives a liquidity alert.
15. The operator transfers cryptocurrency from cold storage.
16. The blockchain simulator processes the transfer.
17. Hot wallet balances increase after confirmation.
18. Queued withdrawals resume processing.
19. Customers receive their simulated withdrawals.
20. All financial operations reconcile successfully.

Separately, the user must be able to write, compile, deploy, and interact with a Solidity smart contract inside the simulated Ethereum environment.

The entire process should be observable through the dashboard, transaction explorer, wallet interfaces, blockchain explorer, and accounting ledger.

⸻

25. Final Product Expectations

The finished product should feel like operating a real cryptocurrency exchange’s internal infrastructure.

It should not feel like a cryptocurrency portfolio tracker, a static trading dashboard, or a collection of disconnected demonstrations.

The user should be able to move naturally between:

* Monitoring exchange operations.
* Investigating customer transactions.
* Executing trades.
* Managing hot wallet liquidity.
* Replenishing cold storage reserves.
* Investigating blockchain transactions.
* Reconciling exchange balances.
* Developing smart contracts.
* Resolving operational incidents.

The most important requirement: The simulation engine must drive the application. The UI must display and control actual simulated domain operations, never substitute animations or fabricated activity for functioning underlying systems.