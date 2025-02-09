import React, { useEffect, useState } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { createPortal } from "react-dom";
import SmartContractSetup from "./SmartContractSetup";

const WalletConnect = ({ onAddressReceived }) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [isPhantomInstalled, setIsPhantomInstalled] = useState(false);
  const [showContractSetup, setShowContractSetup] = useState(false);

  const connectWallet = async () => {
    try {
      const { solana } = window;

      if (solana) {
        if (!solana.isPhantom) {
          alert("Please install Phantom wallet!");
          return;
        }

        const response = await solana.connect();
        const address = response.publicKey.toString();
        console.log("Wallet connected with address:", address);
        setWalletAddress(address);
        setShowContractSetup(true);
        onAddressReceived && onAddressReceived(address);
      }
    } catch (error) {
      console.error("Error connecting to wallet:", error);
    }
  };

  const disconnectWallet = () => {
    try {
      const { solana } = window;
      if (solana) {
        solana.disconnect();
        setWalletAddress("");
        setShowContractSetup(false);
      }
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
    }
  };

  // Check if Phantom is installed
  useEffect(() => {
    const checkPhantom = () => {
      const isPhantomAvailable = window?.solana?.isPhantom;
      setIsPhantomInstalled(isPhantomAvailable);
    };

    checkPhantom();
    window.addEventListener("load", checkPhantom);

    return () => {
      window.removeEventListener("load", checkPhantom);
      // Cleanup: disconnect when component unmounts
      if (window?.solana?.isConnected) {
        window.solana.disconnect();
      }
    };
  }, []);

  const handleCloseSetup = () => {
    setShowContractSetup(false);
  };

  return (
    <>
      <div className="flex justify-center">
        {walletAddress ? (
          <button
            onClick={disconnectWallet}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Disconnect Wallet
          </button>
        ) : (
          <button
            onClick={connectWallet}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            disabled={!isPhantomInstalled}
          >
            {isPhantomInstalled ? "Connect Wallet" : "Install Phantom Wallet"}
          </button>
        )}
      </div>

      {showContractSetup &&
        createPortal(
          <SmartContractSetup
            walletAddress={walletAddress}
            isOpen={showContractSetup}
            onClose={handleCloseSetup}
          />,
          document.body
        )}
    </>
  );
};

export default WalletConnect;
