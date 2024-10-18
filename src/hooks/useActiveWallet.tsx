import { useEffect, useState } from "react";
import { ethers } from "ethers";

export interface Account {
  getSigner(): unknown;
  address: string;
  // Add other properties as needed
}

export function useActiveWallet(): Account | undefined {
  const [activeAccount, setActiveAccount] = useState<Account | undefined>(undefined);

  useEffect(() => {
    async function fetchAccount() {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.send("eth_requestAccounts", []);
          if (accounts.length > 0) {
            const signer = await provider.getSigner(accounts[0]);
            setActiveAccount({
              address: accounts[0],
              getSigner: () => signer,
            });
            console.log("Active account set:", accounts[0]);
          } else {
            console.log("No account connected");
          }
        } catch (error) {
          console.error("Error fetching accounts:", error);
        }
      } else {
        console.log("Ethereum provider not found");
      }
    }

    fetchAccount();
  }, []);

  return activeAccount;
}
