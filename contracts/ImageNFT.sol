// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract ImageNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    
    constructor() ERC721("Digital Prompt Art", "DPA") {
        
    }
    function safeMint(string memory uri) public onlyOwner {
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);
        tokenURI(tokenId);
    }
}