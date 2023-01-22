// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");
const hre = require("hardhat");

//converts currency to tokens
const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

async function main() {
  //we use this file to deploy our contract to the hardhat blockchain and run it

  //get the accounts
  [buyer, seller, inspector, lender] = await ethers.getSigners();

  //deploy the real estate contract
  //load the contract
  const RealEstate = await ethers.getContractFactory("RealEstate");

  //deploy the contract
  const realEstate = await RealEstate.deploy();

  //wait till contract deployed
  await realEstate.deployed();

  //log the contract address
  console.log(`Deployed contract at ${realEstate.address}`);

  //mint nft
  //the nft metadate is on ipfs with names 1.json,2.json, 3.json so we use a loop and pass it
  console.log("minting 3 properties nfts");
  for (let i = 1; i <= 3; i++) {
    let transaction = await realEstate
      .connect(seller)
      .mint(
        `https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/${i}.json`
      );
    await transaction.wait();
  }

  //deploy escrow contract
  //load the contract
  const Escrow = await ethers.getContractFactory("Escrow");

  //deploy the contract , pass constructor values
  const escrow = await Escrow.deploy(
    realEstate.address,
    seller.address,
    inspector.address,
    lender.address
  );

  //wait till contract deployed
  await escrow.deployed();

  console.log(`Deployed Escrow Contract at: ${escrow.address}`);
  console.log(`Listing 3 properties...\n`);

  //approve properties
  for (i = 0; i < 3; i++) {
    //approve(address to, uint256 tokenId) from erc721 contract
    let transaction = await realEstate
      .connect(seller)
      .approve(escrow.address, i + 1);
    await transaction.wait();
  }

  //list the properties
  transaction = await escrow
    .connect(seller)
    .list(1, tokens(20), tokens(10), buyer.address);
  await transaction.wait();

  transaction = await escrow
    .connect(seller)
    .list(2, tokens(30), tokens(15), buyer.address);
  await transaction.wait();

  transaction = await escrow
    .connect(seller)
    .list(3, tokens(25), tokens(12), buyer.address);
  await transaction.wait();

  console.log("Finished");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
