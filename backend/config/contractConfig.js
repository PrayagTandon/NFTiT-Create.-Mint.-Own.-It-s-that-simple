const AIBL_NFT_ABI = [
    "function safeMintTo(address to, string memory uri) external returns (uint256)",
    "function totalSupply() external view returns (uint256)",
    "function tokenURI(uint256 tokenId) external view returns (string memory)",
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

module.exports = {
    AIBL_NFT_ADDRESS: "0x31D93360FA9572F3DddeF296990740Be052B8d0a",
    AIBL_NFT_ABI,
    NETWORKS: {
        polygon: {
            chainId: 80002,
            rpcUrl: process.env.POLYGON_ALCHEMY_URL
        },
        ethereum: {
            chainId: 11155111,
            rpcUrl: process.env.ETHEREUM_ALCHEMY_URL
        }
    }
};