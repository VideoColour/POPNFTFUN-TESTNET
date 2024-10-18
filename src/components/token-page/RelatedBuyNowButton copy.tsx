import React, { useState, useEffect } from 'react';
import { client, provider } from "@/consts/client";
import { useMarketplaceContext } from "@/hooks/useMarketplaceContext";
import { Button, useToast, Text } from "@chakra-ui/react";
import {
  type Hex,
  NATIVE_TOKEN_ADDRESS,
  ThirdwebContract,
  getContract,
  sendAndConfirmTransaction,
  sendTransaction,
  toTokens,
  waitForReceipt,
} from "thirdweb";
import { Network } from "ethers";
import {
  useActiveWalletChain,
  useSwitchActiveWalletChain,
} from "thirdweb/react";
import { allowance, approve, decimals } from "thirdweb/extensions/erc20";
import {
  type DirectListing,
  buyFromListing,
} from "thirdweb/extensions/marketplace";
import type { Account } from "thirdweb/wallets";
import { formatUnits } from "ethers";
import { Abi } from 'thirdweb/utils';
import { Wallet } from "thirdweb/wallets";
import { balanceOf, } from "thirdweb/extensions/erc20";

// Add this function outside of the component
const bigIntReplacer = (key: string, value: any) => {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
};

interface Props {
  listing: DirectListing;
  wallet: {
    id: string;
    getAccount: () => Promise<{ address: string }>;
    // ... other properties and methods
  };
  marketplaceContract: ThirdwebContract;
}

const addChain = async () => {
  try {
    await (window as any).ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: "0x3637275b", // Replace with your chain's ID in hex
          chainName: "Meld Testnet",
          rpcUrls: ["https://testnet-rpc.meld.com"],
          nativeCurrency: {
            name: "Meld",
            symbol: "MELD",
            decimals: 18,
          },
          blockExplorerUrls: ["https://testnet.meldscan.io"],
        },
      ],
    });
  } catch (error) {
    console.error("Failed to add chain:", error);
  }
};

export default function RelatedBuyNowButton({ 
  listing, 
  wallet, 
  marketplaceContract 
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    const fetchWalletAddress = async () => {
      if (wallet && wallet.getAccount) {
        const account = await wallet.getAccount();
        setWalletAddress(account.address);
      }
    };
    fetchWalletAddress();
  }, [wallet]);

  const handleBuy = async () => {
    if (!walletAddress) {
      setError("Wallet address not available");
      return;
    }

    if (!listing) {
      setError("Listing information is not available");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const account = await wallet.getAccount() as Account;
      
      // Check if the wallet is connected to the correct chain
      const currentChainId = await provider.getNetwork().then((network: Network) => Number(network.chainId));
      if (currentChainId !== marketplaceContract.chain.id) {
        console.log("Wallet is on the wrong chain. Attempting to switch...");
        try {
          await addChain();
        } catch (switchError) {
          console.error("Failed to switch chain:", switchError);
          setError("Please switch to the correct network in your wallet.");
          return;
        }
      }

      console.log("Listing:", JSON.stringify(listing, bigIntReplacer, 2));

      let erc20Contract;
      // Check if the listing uses an ERC20 token
      if (listing.currencyContractAddress !== NATIVE_TOKEN_ADDRESS) {
        erc20Contract = await getContract({
          address: listing.currencyContractAddress,
          client: marketplaceContract.client,
          chain: marketplaceContract.chain,
        });
        let currentAllowance = await allowance({
          contract: erc20Contract,
          owner: account.address,
          spender: marketplaceContract.address,
        });

        console.log("Current allowance:", currentAllowance.toString());
        console.log("Currency value per token:", listing.currencyValuePerToken.value);

        const requiredAmount = BigInt(listing.currencyValuePerToken.value);

        if (currentAllowance < requiredAmount) {
          console.log("Approving ERC20 token...");
          try {
            // Use the approve function directly from the erc20Contract
            const approveTx = await approve({
              contract: erc20Contract,
              spender: marketplaceContract.address,
              amount: requiredAmount.toString(),
            });

            console.log("Approval transaction prepared:", approveTx);
            console.log("approveTx structure:", Object.keys(approveTx));

            // Convert the prepared transaction to a format the wallet can use
            const walletApproveTx = {
              to: erc20Contract.address,
              data: typeof approveTx.data === 'function' ? await approveTx.data() : approveTx.data,
              value: typeof approveTx.value === 'function' ? await approveTx.value() : approveTx.value || '0',
            };

            // Use the wallet's getAccount method to get the signer
            const account = await wallet.getAccount();
            
            // Send the transaction using ethers.js
            const signer = await provider.getSigner(account.address);
            const sentApproveTx = await signer.sendTransaction(walletApproveTx);

            console.log("Approval transaction sent:", sentApproveTx);

            if (sentApproveTx.hash) {
              console.log("Waiting for approval transaction to be mined...");
              const receipt = await sentApproveTx.wait();
              console.log("Approval transaction mined:", receipt);
              
              // Check the new allowance after approval
              currentAllowance = await allowance({
                contract: erc20Contract,
                owner: account.address,
                spender: marketplaceContract.address,
              });
              console.log("New allowance after approval:", currentAllowance.toString());
            } else {
              console.log("Approval transaction sent, but no hash available");
              throw new Error("Approval transaction failed: No transaction hash");
            }
          } catch (approvalError) {
            console.error("Error during approval process:", approvalError);
            throw new Error(`Approval transaction failed: ${approvalError instanceof Error ? approvalError.message : 'Unknown error'}`);
          }
        }

        // Check user's balance
        const userBalance = await balanceOf({
          contract: erc20Contract,
          address: walletAddress,
        });
        console.log("User's token balance:", userBalance.toString());

        if (userBalance < requiredAmount) {
          throw new Error("Insufficient token balance");
        }
      }

      console.log("Preparing buy transaction...");
      const preparedTx = await buyFromListing({
        contract: marketplaceContract,
        listingId: listing.id,
        quantity: BigInt(1),
        recipient: walletAddress,
      });

      console.log("Transaction prepared:", preparedTx);

      const sentTx = await sendTransaction({
        account,
        transaction: preparedTx,
      });
      console.log("Transaction sent:", sentTx);

      if ('transactionHash' in sentTx) {
        const receipt = await waitForReceipt({
          transactionHash: sentTx.transactionHash as `0x${string}`,
          client: marketplaceContract.client,
          chain: marketplaceContract.chain,
        });
        console.log("Transaction confirmed:", receipt);
        // Handle successful transaction
      } else {
        console.log("Transaction sent, but no hash available");
        throw new Error("Transaction failed: No transaction hash");
      }

    } catch (error: unknown) {
      console.error("Error buying from listing:", error);
      setError(`Failed to complete purchase: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  console.log('Wallet object:', wallet);

  return (
    <>
      <Button
        onClick={handleBuy}
        isLoading={isLoading}
        loadingText="Buying..."
        disabled={!wallet || !walletAddress}
      >
        Buy Now
      </Button>
      {error && <Text color="red.500">{error}</Text>}
    </>
  );
}
