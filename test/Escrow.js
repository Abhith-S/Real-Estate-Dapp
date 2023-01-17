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

        //before the nft can be transfered from seller account he has to approve it
        //so we call the approve function from erc721 contract
        transaction = await realEstate.connect(seller).approve(escrow.address, 1);
        await transaction.wait();

        //calling the list()
        transaction = await escrow.connect(seller).list(1, tokens(10), tokens(5), buyer.address);
        await transaction.wait();

    })

    it("returns the nft address", async ()=>{

        //check if the nftAddress is the address of the contract
        //if the nftAddress variable holds the nft address
        //here nftAddress() is not a function we defined but a public variable in our contract
        //the variable is having a view function 
        expect(await escrow.nftAddress()).to.be.equal(realEstate.address);
    })

    it("returns the seller", async ()=>{

        //check if the seller variable holds the seller address
        expect(await escrow.seller()).to.be.equal(seller.address);
    })

    it("returns the inspector", async ()=>{

        //check if the inspector variable holds the seller address
        expect(await escrow.inspector()).to.be.equal(inspector.address);
    })

    it("returns the lender", async ()=>{

        //check if the lender variable holds the seller address
        expect(await escrow.lender()).to.be.equal(lender.address);
    })

    describe("Listing", async ()=>{

        //if the nft was transfered then the new owner will be the Escrow contract
        it("updates the owner", async ()=>{
            expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address);
        })

        //check if the nft status changed
        it("updates the nft listing status", async ()=>{
            expect(await escrow.isListed(1)).to.be.equal(true);
        })

        it("gets the purchase price", async()=>{
            expect(await escrow.purchasePrice(1)).to.be.equal(tokens(10));
        })

        it("returns the escrow amount", async()=>{
            expect(await escrow.escrowAmount(1)).to.be.equal(tokens(5));
        })

        it("returns the buyer address", async()=>{
            expect(await escrow.buyer(1)).to.be.equal(buyer.address);
        })

        it("checks if only seller can call list()", async()=>{
            await expect(escrow.connect(buyer).list(1, tokens(10), tokens(5), buyer.address)).to.be.revertedWith('only seller can call this function');
            await expect(escrow.connect(inspector).list(1, tokens(10), tokens(5), buyer.address)).to.be.revertedWith('only seller can call this function');
            await expect(escrow.connect(lender).list(1, tokens(10), tokens(5), buyer.address)).to.be.revertedWith('only seller can call this function');
        })
    })

    describe("Deposit earnest", async()=>{
        
        it("ensure the contract has escrow amount",async()=>{
            let transaction = await escrow.connect(buyer).depositEarnest(1, {value: tokens(5)});
            await transaction.wait();

            expect(await escrow.getBalance()).to.be.equal(tokens(5));
        })

        it("checks if only buyer can call depositEarnest()", async()=>{
            await expect(escrow.connect(seller).depositEarnest(1)).to.be.revertedWith('only buyer can call this function');
            await expect(escrow.connect(inspector).depositEarnest(1)).to.be.revertedWith('only buyer can call this function');
            await expect(escrow.connect(lender).depositEarnest(1)).to.be.revertedWith('only buyer can call this function');
        })
    })

})
