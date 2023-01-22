//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract RealEstate is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    //creating NFT with name & symbol
    constructor() ERC721("Real Estate", "REAL") {}

    //create mint()
    //we are going to let someone mint with a tokenURI ie metadata
    function mint(string memory tokenURI) public returns (uint256) {
        //default of tokenIds is 0, so we make it 1 and increment for every NFT created
        _tokenIds.increment();

        //get current value of tokenIds
        uint256 newItemId = _tokenIds.current();

        //mint() from erc721 contract
        _mint(msg.sender, newItemId);

        //setTokenURI from ERC721URIStorage contract
        _setTokenURI(newItemId, tokenURI);

        return newItemId;
    }

    //get total supply ,ie no of minted nfts
    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }
}
