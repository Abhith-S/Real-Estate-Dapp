import { useEffect, useState } from "react";

//ethers library
import { ethers } from "ethers";

// Components
import Navigation from "./components/Navigation";
import Search from "./components/Search";
import Home from "./components/Home";

// ABIs
import RealEstate from "./abis/RealEstate.json";
import Escrow from "./abis/Escrow.json";

// Config.json file that has the contract addresses
import config from "./config.json";

function App() {
  //to store states of accounts
  const [account, setAccount] = useState(null);

  //to set provider
  const [provider, setProvider] = useState(null);

  //save escrow contract to state
  const [escrow, setEscrow] = useState(null);

  //save homes
  const [homes, setHomes] = useState([]);

  //hook to set individual homes
  const [home, setHome] = useState({});

  //for toggle
  const [toggle, setToggle] = useState(false);

  //get the blockchain data
  const loadBlockchainData = async () => {
    //get the data from metamask
    //window.ethereum is injected by metamask to the browser
    //ita allows us to access blockchain, provider is hardhat
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    //set the provider here
    setProvider(provider);

    //get the network
    const network = await provider.getNetwork();

    //get the javascript version of realEstate contract
    //the config file has the address of contract and the file is imported as 'config'
    //network.chainId will return 31337 which is the same as the one in config file
    //from that file the contract address is  taken
    //"RealEstate " is the abi of realestate contract imported here
    const realEstate = new ethers.Contract(
      config[network.chainId].realEstate.address,
      RealEstate,
      provider
    );
    // console.log(realEstate)

    //get the total supply of homes
    const totalSupply = await realEstate.totalSupply();

    //store homes to an array
    const homes = [];

    //loop through the mapping which stores nft and take each home
    for (var i = 1; i <= totalSupply; i++) {
      const uri = await realEstate.tokenURI(i);
      const response = await fetch(uri);
      const metadata = await response.json();
      homes.push(metadata);
    }

    setHomes(homes);

    //console.log(homes);

    //load the js version of escrow contrac
    const escrow = new ethers.Contract(
      config[network.chainId].escrow.address,
      Escrow,
      provider
    );
    setEscrow(escrow);

    //change and update if we change accounts
    window.ethereum.on("accountsChanged", async () => {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = ethers.utils.getAddress(accounts[0]);
      setAccount(account);
    });
  };

  //useEffect hook runs a fn everytime a render occurs
  //this is usually used to fetch data and all everytime site loads
  useEffect(() => {
    loadBlockchainData();
  }, []);

  //to pop up the homes on click
  const togglePop = (home) => {
    //console.log(home)

    setHome(home);

    //implement toggle feature
    toggle ? setToggle(false) : setToggle(true);
  };
  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />

      <Search />

      <div className="cards__section">
        <h3>Homes For You</h3>

        <hr />

        <div className="cards">
          {homes.map((home, index) => (
            <div className="card" key={index} onClick={() => togglePop(home)}>
              <div className="card__image">
                <img src={home.image} alt="Home" />
              </div>
              <div className="card__info">
                <h4>{home.attributes[0].value}</h4>
                <p>
                  <strong>{home.attributes[2].value}</strong> beds|
                  <strong>{home.attributes[3].value}</strong> baths|
                  <strong>{home.attributes[4].value}</strong> sqft
                </p>
                <p>{home.address}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* check to see if toggle is active */}
      {toggle && (
        // render the home component
        //pass the values from the conponent
        <Home
          home={home}
          provider={provider}
          account={account}
          escrow={escrow}
          togglePop={togglePop}
        />
      )}
    </div>
  );
}

export default App;
