import { ethers } from "ethers";
import { useEffect, useState } from "react";

import close from "../assets/close.svg";

const Home = ({ home, provider, account, escrow, togglePop }) => {
  const [hasBought, setHasBought] = useState(false);
  const [hasLended, setHasLended] = useState(false);
  const [hasSold, setHasSold] = useState(false);
  const [hasInspected, setHasInspected] = useState(false);

  const [buyer, setBuyer] = useState(null);
  const [lender, setLender] = useState(null);
  const [inspector, setInspector] = useState(null);
  const [seller, setSeller] = useState(null);

  const [owner, setOwner] = useState(null);

  //fetch details of actors
  const fetchDetails = async () => {
    //get buyer address
    //we pass home id as we need to give nftID to get buyer address from mapping
    const buyer = await escrow.buyer(home.id);
    setBuyer(buyer);

    const hasBought = await escrow.saleApproved(home.id, buyer);
    setHasBought(hasBought);

    //seller
    const seller = await escrow.seller();
    setSeller(seller);

    const hasSold = await escrow.saleApproved(home.id, seller);
    setHasSold(hasSold);

    //lender
    const lender = await escrow.lender();
    setLender(lender);

    const hasLended = await escrow.saleApproved(home.id, lender);
    setHasLended(hasLended);

    //inspector
    const inspector = await escrow.inspector();
    setInspector(inspector);

    const hasInspected = await escrow.inspectionPassed(home.id);
    setHasInspected(hasInspected);
  };
  console.log(buyer);

  const fetchOwner = async () => {
    //ensure home is listed
    if (await escrow.isListed(home.id)) return;

    const owner = await escrow.buyer(home.id);
    setOwner(owner);
  };

  const buyHandler = async ()=>{
    
    //get the escrow amount
    const escrowAmount = await escrow.escrowAmount(home.id)
    
    //get the account
    const signer = await provider.getSigner()

    // Buyer deposit earnest
    let transaction = await escrow.connect(signer).depositEarnest(home.id, { value: escrowAmount })
    await transaction.wait()

    // Buyer approves...
    transaction = await escrow.connect(signer).approveSale(home.id)
    await transaction.wait()

    //set to true to disable button after the function called
    setHasBought(true)

  }

  const inspectionHandler = async () => {
    const signer = await provider.getSigner()

    // Inspector updates status
    const transaction = await escrow.connect(signer).updateInspectionPassed(home.id, true)
    await transaction.wait()

    setHasInspected(true)
}

const lendHandler = async () => {
  const signer = await provider.getSigner()

  // Lender approves...
  const transaction = await escrow.connect(signer).approveSale(home.id)
  await transaction.wait()

  // Lender sends funds to contract...
  const lendAmount = (await escrow.purchasePrice(home.id) - await escrow.escrowAmount(home.id))
  await signer.sendTransaction({ to: escrow.address, value: lendAmount.toString(), gasLimit: 60000 })

  setHasLended(true)
}

const sellHandler = async () => {
  const signer = await provider.getSigner()

  // Seller approves...
  let transaction = await escrow.connect(signer).approveSale(home.id)
  await transaction.wait()

  // Seller finalize...
  transaction = await escrow.connect(signer).finalizeSale(home.id)
  await transaction.wait()

  setHasSold(true)
}


  //we need to recall the above 2 functions, whenever there is change in hasSold
  useEffect(() => {
    fetchDetails();
    fetchOwner();
  }, [hasSold]);

  return (
    <div className="home">
      <div className="home__details">
        <div className="home__image">
          <img src={home.image} alt="Home" />
        </div>
        <div className="home__overview">
          <h1>{home.name}</h1>
          <p>
            <strong>{home.attributes[2].value}</strong> bds |
            <strong>{home.attributes[3].value}</strong> ba |
            <strong>{home.attributes[4].value}</strong> sqft
          </p>
          <p>{home.address}</p>

          <h2>{home.attributes[0].value} ETH</h2>



          {/* show button based on which account is connected , show as owner if he is owner*/}

          {owner ? (
            <div className="home__owned">
              Owned by {owner.slice(0, 6) + "..." + owner.slice(38, 42)}
            </div>
          ) : (
            <div>
              {account === inspector ? (
                // disabling the button if inspection already done
                <button className="home__buy" onClick={inspectionHandler} disabled = {hasInspected}>Approve Inspection</button>
              ) : account === lender ? (
                <button className="home__buy" onClick={lendHandler} disabled = {hasLended}>Approve & Lend</button>
              ) : account === seller ? (
                <button className="home__buy" onClick={sellHandler} disabled = {hasSold}>Approve & Sell</button>
              ) : (
                <button className="home__buy" onClick={buyHandler} disabled = {hasBought}>Buy</button>
              )}

              <button className="home__contact">Contact agent</button>
            </div>
          )}

          {console.log(owner)}

          <hr />

          <h2>Overview</h2>

          <p>{home.description}</p>

          <hr />

          <h2>Facts and features</h2>

          {/* mapping throug an array of values and setting them using list items */}
          <ul>
            {home.attributes.map((attribute, index) => (
              <li key={index}>
                <strong>{attribute.trait_type}</strong> : {attribute.value}
              </li>
            ))}
          </ul>
        </div>

        {/* button to change toggle state and close page , close image is imported on top*/}
        <button onClick={togglePop} className="home__close">
          <img src={close} alt="Close" />
        </button>
      </div>
    </div>
  );
};

export default Home;
