//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

//interface from ERC721 openzeppelin
//we are using this to take the nft from seller and lock it in escrow
//the transferFrom() helps in doing this
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

    //address of nft
    address public nftAddress;

    //mapping to store lsiting status of the nft
    mapping(uint => bool) public isListed;

    //mapping for purchase price,escrow amount,buyer
    mapping(uint => uint) public purchasePrice;
    mapping(uint => uint) public escrowAmount;
    mapping(uint => address) public buyer;

    //mapping for inspection status
    mapping(uint => bool) public inspectionPassed;

    //mapping for each actor approving sale
    mapping(uint => mapping(address => bool)) public saleApproved;

    //only seller can do this
    modifier onlySeller(){
        require(msg.sender == seller, "only seller can call this function");
        _;
    }

    //only buyer can do this
    modifier onlyBuyer(uint _nftID){
        require(msg.sender == buyer[_nftID], "only buyer can call this function");
        _;
    }

    //make the contract payable
    receive() external payable{}

    //only inpsector can do this
    modifier onlyInspector(){
        require(msg.sender == inspector,"only inspector can call this function");
        _;
    }

    //constructor for setting these with contract deployment
    constructor(
        address _nftAddress,
        address payable _seller,
        address _inspector,
        address _lender
        
        ){
        
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
        
    }

    //move the nft from seller wallet to Escrow and list it
    function list
        (uint _nftID, 
        uint _purchasePrice, 
        uint _escrowAmount, 
        address _buyer
        )public payable onlySeller{

        //we use the interface of erc721 to use the transferFrom function
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftID);

        //update listing status
        isListed[_nftID] = true;

        //update other variables
        purchasePrice[_nftID] = _purchasePrice;
        escrowAmount[_nftID] = _escrowAmount;
        buyer[_nftID] = _buyer;
    }

    //function for buyer to deposit earnest amount to contract
    function depositEarnest(uint _nftID)public payable onlyBuyer(_nftID){
        
        require(msg.value >= escrowAmount[_nftID]);
    }

    //function get contract balacnce
    function getBalance()public view returns(uint){
        return address(this).balance;
    }

    //update inspection status, by only ispector
    function updateInspectionPassed(uint _nftID, bool _isPassed)public onlyInspector{
        inspectionPassed[_nftID] = _isPassed;
    }

    //approve sale
    function approveSale(uint _nftID)public{
        saleApproved[_nftID][msg.sender] = true;
    }
}