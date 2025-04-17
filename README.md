# NFTiT - Create, Mint, Own

![NFTiT Logo](logo/shared-image.png)

## Abstract

NFTiT is a decentralized application (dApp) that enables users to create, mint, and own NFTs (Non-Fungible Tokens) on the blockchain. This platform provides a seamless experience for artists, creators, and collectors to participate in the NFT ecosystem.

## Introduction

NFTiT is designed to democratize the NFT creation and ownership process. Our platform offers:

- User-friendly interface for NFT creation
- Secure minting process
- Transparent ownership tracking
- Marketplace integration
- Smart contract-based security

## Architecture

The project follows a modern web3 architecture:

### Frontend

- React.js for the user interface
- Web3.js for blockchain interactions
- Material-UI for component styling
- Redux for state management

### Backend

- Smart Contracts (Solidity)
- IPFS for decentralized storage
- Ethereum blockchain network

## Tools & Technologies

### Frontend

- React.js
- Web3.js
- Material-UI
- Redux
- Ethers.js

### Backend

- Solidity
- Hardhat
- IPFS
- OpenZeppelin Contracts

### Development Tools

- Node.js
- npm/yarn
- Git
- MetaMask

## Setup Instructions

1. Clone the repository

```bash
git clone [repository-url]
cd NFTiT-Create,Mint,Own
```

2. Install dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
```

3. Configure environment variables

```bash
# Create .env file in the root directory
cp .env.example .env
# Add your environment variables
```

4. Start the development server

```bash
# Start the client
cd client
npm start
```

5. Connect MetaMask

- Install MetaMask browser extension
- Connect to the appropriate network
- Import or create a wallet

## Smart Contract Deployment

1. Compile contracts

```bash
npx hardhat compile
```

2. Deploy contracts

```bash
npx hardhat run scripts/deploy.js --network [network-name]
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any queries or support, please reach out to us at:

```
[Sahil Gurnani](sahilgurnani20@gmail.com)
[Prayag Tandon](prayagtandon2010@gmail.com)
```

## Acknowledgments

- OpenZeppelin for smart contract templates
- The Ethereum community
- All contributors and supporters of the project
