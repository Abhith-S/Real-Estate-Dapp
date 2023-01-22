import logo from '../assets/logo.svg';
import {ethers} from "ethers";

//passing the useState variables as props
const Navigation = ({ account, setAccount }) => {

    //fn to get accounts and connect
    const connectionHandler = async ()=>{
        const accounts = await window.ethereum.request({method : "eth_requestAccounts"});
        // const account = ethers.utils.getAddress(accounts[0])
        setAccount(accounts[0])

        //change and update if we change accounts
        window.ethereum.on("accountsChanged", async()=>{
              const accounts = await window.ethereum.request({method : "eth_requestAccounts"});
              //const account = ethers.utils.getAddress(accounts[0])
              setAccount(accounts[0])
            })
    }

    return (
        <nav>
            <ul className='nav__links'>
                <li><a href="#">Buy</a></li>
                <li><a href="#">Rent</a></li>
                <li><a href="#">Sell</a></li>
            </ul>

            <div className='nav__brand'>
                <img src={logo} alt="Logo" />
                <h1>Millow</h1>
            </div>
        
        {/* we wamt a button with a condition that is account is connected then show it
        if its not then show connect button. */}
            {account ? (
                <button
                type="button"
                className='nav__connect'
            >{account.slice(0,6)+"..."+account.slice(38,42)}
            </button>
            ) : (<button
                type="button"
                className='nav__connect'
                onClick={connectionHandler}
            >Connect
            </button>
            )}
                
        </nav>
    );
}

export default Navigation;