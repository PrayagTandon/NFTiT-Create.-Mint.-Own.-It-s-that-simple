const hre = require("hardhat");
const ethers = hre.ethers;

async function main() {
    try {
        // Get the signers from the Hardhat environment
        const [deployer] = await ethers.getSigners();
        console.log("Deploying contracts with the account:", deployer.address);
        console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

        // Get the contract factory
        const NFT = await ethers.getContractFactory("AIBL_NFT");
        console.log("Deploying AIBL_NFT...");
        
        // Deploy the contract
        const nft = await NFT.deploy();
        await nft.waitForDeployment();

        // Get the contract address
        const address = await nft.getAddress();
        console.log("AIBL_NFT deployed to:", address);
        console.log("Deployment transaction hash:", nft.deploymentTransaction().hash);
        
        return { nft, address };
    } catch (error) {
        console.error("Error during deployment:", error);
        throw error;
    }
}

// Execute the deployment
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error("Deployment failed:", error);
        process.exit(1);
    });

// const main = async () => {
//     const contractFactory = await ethers.getContractFactory('ImageNFT');
//     const vrf= await ethers.getContractFactory('RandomNumberGenerator')
//     const contract = await contractFactory.deploy();
//     const contract2 = await vrf.deploy();
//     await contract.waitForDeployment();
//     await contract2.waitForDeployment();
 
//     console.log("Random number contract deployed to ", contract2.target);
//     console.log("ImageNFT", contract.target);
// }
 
// const runMain = async () => {
//     try {
//         await main();
//         process.exit(0);
//     } catch (error) {
//         console.log(error);
//         process.exit(1);
//     }
// }
 
// runMain();
