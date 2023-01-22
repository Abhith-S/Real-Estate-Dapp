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
    mapping(uint256 => bool) public isListed;

    //mapping for purchase price,escrow amount,buyer
    mapping(uint256 => uint256) public purchasePrice;
    mapping(uint256 => uint256) public escrowAmount;
    mapping(uint256 => address) public buyer;

    //mapping for inspection status
    mapping(uint256 => bool) public inspectionPassed;

    //mapping for each actor approving sale
    mapping(uint256 => mapping(address => bool)) public saleApproved;

    //only seller can do this
    modifier onlySeller() {
        require(msg.sender == seller, "only seller can call this function");
        _;
    }

    //only buyer can do this
    modifier onlyBuyer(uint256 _nftID) {
        require(
            msg.sender == buyer[_nftID],
            "only buyer can call this function"
        );
        _;
    }

    //make the contract payable
    receive() external payable {}

    //only inpsector can do this
    modifier onlyInspector() {
        require(
            msg.sender == inspector,
            "only inspector can call this function"
        );
        _;
    }

    //constructor for setting these with contract deployment
    constructor(
        address _nftAddress,
        address payable _seller,
        address _inspector,
        address _lender
    ) {
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
    }

    //move the nft from seller wallet to Escrow and list it
    function list(
        uint256 _nftID,
        uint256 _purchasePrice,
        uint256 _escrowAmount,
        address _buyer
    ) public payable onlySeller {
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
    function depositEarnest(uint256 _nftID) public payable onlyBuyer(_nftID) {
        require(msg.value >= escrowAmount[_nftID]);
    }

    //function get contract balacnce
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    //update inspection status, by only ispector
    function updateInspectionPassed(uint256 _nftID, bool _isPassed)
        public
        onlyInspector
    {
        inspectionPassed[_nftID] = _isPassed;
    }

    //approve sale
    function approveSale(uint256 _nftID) public {
        saleApproved[_nftID][msg.sender] = true;
    }

    //function to finalize sale
    function finalizeSale(uint256 _nftID) public {
        //inspection should be passed
        require(inspectionPassed[_nftID]);

        //sale shoiuld be approved
        require(saleApproved[_nftID][buyer[_nftID]]);
        require(saleApproved[_nftID][seller]);
        require(saleApproved[_nftID][lender]);

        //escrow contract should have the purchase price amount
        require(address(this).balance >= purchasePrice[_nftID]);

        //change listing status of nft
        isListed[_nftID] = false;

        //transfer funds to seller
        (bool success, ) = payable(seller).call{value: address(this).balance}(
            ""
        );
        require(success);

        //transfer nft to buyer
        IERC721(nftAddress).transferFrom(address(this), buyer[_nftID], _nftID);
    }

    //function to cancel the sale
    function cancelSale(uint256 _nftID) public {
        //if insection failed transfer funds to buyer else send to seller
        if (inspectionPassed[_nftID] == false) {
            payable(buyer[_nftID]).transfer(address(this).balance);
        } else {
            payable(seller).transfer(address(this).balance);
        }
    }
}
