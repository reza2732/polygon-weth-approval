import 'bootstrap/dist/css/bootstrap.css';
import { useEffect, useState } from "react";
import AlertDismissible from './components/AlertDismissible';
import { ethers } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import { UnsupportedChainIdError, useWeb3React, Web3ReactProvider } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';

function getLibrary(provider) {
  return new Web3Provider(provider);
}

function App() {
  const POLYGON_TESTNET_CHAIN_ID = 80001;
  const ERC20_ABI = [
    "function balanceOf(address _owner) public view returns (uint256 balance)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function approve(address _spender, uint256 _value) public returns (bool success)"
  ];
  const TESTNET_WETH_ADDRESS = "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889";
  const EMPTY_CONTRACT = "0x7e6c0A06b0fbeCf55f5bFCd8F1DFB5d89BC1BD26";

  const injected = new InjectedConnector({ supportedChainIds: [POLYGON_TESTNET_CHAIN_ID] });
  const { active, account, activate, library, chainId, error } = useWeb3React();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [maticBalance, setMaticBalance] = useState("0.0");
  const [wethBalance, setWethBalance] = useState("0.0");
  const [approvedWethBalance, setApprovedWethBalance] = useState("0.0");

  const connect = async () => {
    activate(injected, null, true)
      .catch((ex) => {
        if (ex instanceof UnsupportedChainIdError) {
          setShowAlert(true);
          setAlertMessage("Invalid Chain Id. Take a look at project README to configure Polygon TESTNET (https://github.com/aghareza/polygon-example/blob/main/README.md)")
        }
      });
  }

  const approve = async () => {
    const contract = new ethers.Contract(TESTNET_WETH_ADDRESS, ERC20_ABI, library.getSigner());
    const amount = ethers.utils.parseUnits("0.06");
    contract.approve(EMPTY_CONTRACT, amount)
      .catch((ex) => {
        console.log(ex)
      });
  }

  useEffect(() => {
    if (active) {
      library.getBalance(account).then((result) => {
        const maticString = ethers.utils.formatUnits(result, 18)
        setMaticBalance(maticString)
      });

      const contract = new ethers.Contract(TESTNET_WETH_ADDRESS, ERC20_ABI, library);
      contract.balanceOf(account).then((result) => {
        const wethString = ethers.utils.formatEther(result)
        setWethBalance(wethString)
      });

      contract.allowance(account, EMPTY_CONTRACT).then((result) => {
        const wethString = ethers.utils.formatEther(result)
        setApprovedWethBalance(wethString)
      });
    }
  }, [active]);

  if (active) {
    return (
        <div className="container">
        <AlertDismissible show={showAlert} setShowAlert={setShowAlert} message={alertMessage} />
        <div className="text-end m-1">
          <button onClick={connect} className="btn btn-sm btn-primary">
            <span className="text-light">Connected with <b>{account}</b></span>
          </button>
        </div>
        <div className="card-deck mb-3 text-center">
          <div className="card mb-4 box-shadow">
            <div className="card-header">
              <h4 className="my-0 font-weight-normal">Account Stats</h4>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mt-3 mb-4">
                <li>Matic: {maticBalance}</li>
                <li>wETH: {wethBalance}</li>
                <li>Approved wETH: {approvedWethBalance}</li>
              </ul>
              <button type="button" onClick={approve} className="btn btn-lg btn-block btn-outline-primary">Approve</button>
            </div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="container">
        <AlertDismissible show={showAlert} setShowAlert={setShowAlert} message={alertMessage} />
        <div className="text-end m-1">
          <button onClick={connect} className="btn btn-sm btn-primary">
            <span>Connect to MetaMask</span>
          </button>
        </div>
      </div>
    )
  }
}

export default function () {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <App />
    </Web3ReactProvider>
  );
}