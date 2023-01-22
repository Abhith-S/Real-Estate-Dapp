import { useEffect, useState } from 'react';

//ethers library
import { ethers } from 'ethers';

// Components
import Navigation from './components/Navigation';
import Search from './components/Search';
import Home from './components/Home';

// ABIs
import RealEstate from './abis/RealEstate.json'
import Escrow from './abis/Escrow.json'

// Config.json file that has the contract addresses
import config from './config.json';

function App() {

  //to store states of accounts
  const [account, setAccount] = useState(null)

  //get the blockchain data
  const loadBlockchainData = async()=>{

    //get the data from metamask
    //window.ethereum is injected by metamask to the browser
    //ita allows us to access blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum);

  }

  //useEffect hook runs a fn everytime a render occurs
  //this is usually used to fetch data and all everytime site loads
  useEffect( ()=>{
    loadBlockchainData()},
    [])

  return (
    
    <div>

      <Navigation account={account} setAccount = {setAccount}/>

      <div className='cards__section'>

        <h3>Welcome to Millow</h3>

      </div>

    </div>
  );
}

export default App;
