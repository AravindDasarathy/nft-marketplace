# NFT Marketplace
This is a decentralized NFT marketplace built on the Sepolia Test Network. The platform allows users to list, sell, and manage NFTs using ERC20 tokens for transactions. The marketplace supports ERC1155 tokens for NFT creation and employs governance proposals for NFT listing. Each NFT collection is associated with a wallet owner, and other users can purchase listed NFTs with ERC20 tokens.

## Key Features
### 1. List NFTs on Sepolia Test Network
- You can mint and list NFTs on the Sepolia Test Network, enabling trading between wallet owners.
- NFTs are deployed under collections, and each collection is associated with a single wallet owner.
- Other wallet owners can purchase listed NFTs using ERC20 tokens.

### 2. ERC1155 Token Deployment for NFTs
- The platform supports the deployment of ERC1155 tokens as NFTs.
- Each wallet owner can create multiple collections of NFTs, and each collection can include multiple tokens.
- **Note**: Purchasing is not yet fully implemented as the "approve all" mechanism (which allows bulk approval of token transfers) is considered risky. Further development is needed to handle this securely.

### 3. NFT with Signature
- **Signature-based verification** ensures only the authorized wallet owner can sell their NFT.
- Without a valid signature from the seller, purchases cannot proceed, preventing unauthorized transactions.

### 4. Governance Proposals for NFT Listing
- The platform employs a governance mechanism for NFT listing. The listing of NFTs is subject to community governance through proposals.
- How it works:
  - When a wallet owner attempts to list an NFT, a proposal is created.
  - The proposal requires consensus from the community (a predefined number of votes).
  - If the proposal reaches the necessary consensus, the NFT is automatically listed.
  - If the consensus is not reached, the NFT will not be listed.
- This ensures a decentralized and democratic process for managing NFT listings.

## Getting Started
### Prerequisites
- **Metamask**: You need to have Metamask installed and configured for the Sepolia Test Network.
- **Sepolia Test ETH**: You'll need Sepolia test ETH to interact with the smart contracts.
- **ERC20 Tokens**: The marketplace uses ERC20 tokens for transactions. Ensure you have some test ERC20 tokens on the Sepolia network.

## Installation
### Clone the repository
```shell
git clone <repository-url>
cd nft-marketplace
```
### Install dependencies
```shell
npm install
```
### Add Submodules
```shell
git submodule update --init --recursive
```
### Environment Setup
- Create a `.env` file based on the provided `.env` example file, and add your required API keys and configurations.

## Deployment
### Deploy Contracts using Foundry
- Use Foundry's `forge` command to deploy contracts to the Sepolia Test Network.
- Example command:
```shell
forge script deploy.sol --rpc-url <RPC_URL> --private-key <PRIVATE_KEY> --broadcast
```

