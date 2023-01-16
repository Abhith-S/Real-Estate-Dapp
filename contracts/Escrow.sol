//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

//interface from ERC721 openzeppelin
interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _id
    ) external;
}

contract Escrow {
    
    //state variables for actors
    address public lender;
    address public inspector;
    address payable public seller;
    address payable public buyer;

    //address of nft
    address public nftAddress;

    //constructor for setting these with contract deployment
    constructor(
        address _lender,
        address _inspector,
        address payable _seller,
        address _nftAddress){

        lender = _lender;
        inspector = _inspector;
        seller = _seller;
        nftAddress = _nftAddress;

    }

}