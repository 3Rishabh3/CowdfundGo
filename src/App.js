import { useEffect, useState } from "react";

import Web3 from "web3";
import Crowdfundingabi from "./contracts/Crowdfunding.json";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [crowdfundingSm, setCrowdfundingSm] = useState(null);

  useEffect(() => {
    loadWeb3();
    loadBlockchainData();
  }, []);

  const loadWeb3 = async () => {
    if (window.ethereum) {
      await window.ethereum.enable();
    } else {
      alert("Please connect to metamask");
    }
  };

  const loadBlockchainData = async () => {
    if (typeof window.ethereum == "undefined") {
      return;
    }

    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();

    setCurrentAccount(accounts[0]);
    const networkId = await web3.eth.net.getId();

    const networkData = Crowdfundingabi.networks[networkId];

    if (networkData) {
      const crowdfunding = new web3.eth.Contract(
        Crowdfundingabi.abi,
        networkData.address
      );
      console.log("Smart contract address:", networkData.address);
      console.log("Balance:", await web3.eth.getBalance(networkData.address));
      console.log("Requests:", await crowdfunding.methods.requests(3).call());
      setCrowdfundingSm(crowdfunding);
    }
  };

  const createRequest = async (
    category,
    description,
    recipientAddress,
    timeLimit,
    target
  ) => {
    try {
      await crowdfundingSm.methods
        .createRequests(
          category,
          description,
          recipientAddress,
          timeLimit,
          target
        )
        .send({ from: currentAccount });
    } catch (err) {
      console.log(err);
    }
  };

  const sendETH = async (id, amt) => {
    try {
      await crowdfundingSm.methods
        .sendEth(id)
        .send({ from: currentAccount, value: amt });
    } catch (err) {
      console.log(err);
    }
  };

  const makePayment = async (id) => {
    try {
      console.log(
        await crowdfundingSm.methods
          .makePayment(id)
          .send({ from: currentAccount })
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <div className="container text-center">
        <h1 className="mt-3 text-center">{currentAccount}</h1>
        <button
          onClick={() => {
            createRequest(
              "Education",
              "Manit",
              "0x024cd4b48E97ddb9B2C6aD3444B9181183Ac0d07",
              1000000,
              Web3.utils.toWei("5", "ether")
            );
          }}
        >
          create request
        </button>

        <button
          onClick={() => {
            sendETH(4, Web3.utils.toWei("5", "ether"));
          }}
        >
          send eth
        </button>

        <button
          onClick={() => {
            makePayment(4);
          }}
        >
          make Payment
        </button>
      </div>
    </>
  );
};

export default App;
