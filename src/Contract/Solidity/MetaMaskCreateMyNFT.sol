// Contract/MetaMaskCreateMyNFT.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MetaMaskCreateMyNFT is ERC721URIStorage {
    constructor(string memory name,  string memory symbol, string memory uri) ERC721(name, symbol) {
        _safeMint(msg.sender, 1);
        _setTokenURI(1, uri);
    }
}