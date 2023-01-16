//chai assertion library for testing
const { expect } = require('chai');
//ethers.js for interacting with the contract on blockchain
const { ethers } = require('hardhat');

//converts currency to tokens
const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {

    let buyer, seller, inspector, lender;
    let realEstate, escrow;

    beforeEach(async ()=>{

        //get the signers of the accounts given by hardhat and assign it to actors
        [buyer, seller, inspector, lender] = await ethers.getSigners();

        //load the contract
        const RealEstate = await ethers.getContractFactory("RealEstate");

        //deploy the contract
        realEstate = await RealEstate.deploy();

        //mint an nft by calling mint() by the seller
        //pass tokenURI as parameter
        let transaction = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAPS");
        await transaction.wait();

        //lets get the Escrow contract
        //load the contract
        const Escrow = await ethers.getContractFactory("Escrow");
        
        //deploy the contract
        //the contract has a constructor with values to pass
        //the nftAdress is the address of the RealEstate contract
        escrow = await Escrow.deploy(
            
            realEstate.address,
            seller.address,
            inspector.address,
            lender.address 
        );
    })

    it("returns the nft address", async ()=>{

        //check if the nftAddress is the address of the contract
        //if the nftAddress variable holds the nft address
        //here nftAddress() is not a function we defined but a public variable in our contract
        //the variable is having a view function 
        expect(await escrow.nftAddress()).to.equal(realEstate.address);
    })

    it("returns the seller", async ()=>{

        //check if the seller variable holds the seller address
        expect(await escrow.seller()).to.equal(seller.address);
    })

    it("returns the inspector", async ()=>{

        //check if the inspector variable holds the seller address
        expect(await escrow.inspector()).to.equal(inspector.address);
    })

    it("returns the lender", async ()=>{

        //check if the lender variable holds the seller address
        expect(await escrow.lender()).to.equal(lender.address);
    })

})
