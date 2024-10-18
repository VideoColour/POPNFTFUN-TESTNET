import React, { useState, useEffect } from 'react';
import { client, provider } from "@/consts/client";
import { useMarketplaceContext } from "@/hooks/useMarketplaceContext";
import { Button, useToast, Text } from "@chakra-ui/react";
import {
  NATIVE_TOKEN_ADDRESS,
  sendTransaction,
  waitForReceipt,
} from "thirdweb";
import {
  useActiveWalletChain,
  useSwitchActiveWalletChain,
} from "thirdweb/react";
import { allowance, approve } from "thirdweb/extensions/erc20";
import {
  type DirectListing,
  buyFromListing,
} from "thirdweb/extensions/marketplace";
import { formatUnits } from "ethers";
import { getContract } from "thirdweb";

interface RelatedBuyNowButtonProps {
  listing: DirectListing;
  wallet: any;
  marketplaceContract: any;
  onPurchaseSuccess: () => void;
}

export default function RelatedBuyNowButton({
  listing,
  wallet,
  marketplaceContract,
  onPurchaseSuccess
}: RelatedBuyNowButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { nftContract } = useMarketplaceContext();
  const switchChain = useSwitchActiveWalletChain();
  const activeChain = useActiveWalletChain();
  const toast = useToast();

  useEffect(() => {
    console.log("Wallet in RelatedBuyNowButton:", wallet);
    console.log("MarketplaceContract in RelatedBuyNowButton:", marketplaceContract);
    console.log("Active chain:", activeChain);
  }, [wallet, marketplaceContract, activeChain]);

  const handlePurchase = async () => {
    if (!wallet) {
      console.error("No wallet connected");
      setError("No wallet connected. Please connect your wallet.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("Marketplace contract chain:", marketplaceContract.chain);

      // Get the current chain from the wallet
      const currentChain = await wallet.getChain();
      console.log("Current chain:", currentChain);

      // Check if the wallet is connected to the correct chain
      if (currentChain.id !== marketplaceContract.chain.id) {
        console.log("Switching chain...");
        try {
          await wallet.switchChain(marketplaceContract.chain.id);
        } catch (switchError) {
          console.error("Error switching chain:", switchError);
          setError("Failed to switch to the correct network. Please switch manually and try again.");
          return;
        }
      }

      // Use the wallet directly
      const account = await wallet.getAccount();
      console.log("Account:", account);

      // Check user's balance
      const balance = await provider.getBalance(account.address);
      const price = listing.currencyValuePerToken.value;
      const formattedBalance = formatUnits(balance, 18);
      const formattedPrice = formatUnits(price, 18);

      if (parseFloat(formattedBalance) < parseFloat(formattedPrice)) {
        throw new Error("Insufficient balance");
      }

      // If it's an ERC20 token, handle approval
      if (listing.currencyContractAddress !== NATIVE_TOKEN_ADDRESS) {
        const erc20Contract = await getContract({
          address: listing.currencyContractAddress,
          client,
          chain: marketplaceContract.chain,
        });
        const currentAllowance = await allowance({
          contract: erc20Contract,
          owner: account.address,
          spender: marketplaceContract.address,
        });

        if (currentAllowance < BigInt(listing.currencyValuePerToken.value)) {
          const approveTx = await approve({
            contract: erc20Contract,
            spender: marketplaceContract.address,
            amount: listing.currencyValuePerToken.value.toString(),
          });

          await sendTransaction({
            account,
            transaction: approveTx,
          });
        }
      }

      // Proceed with the purchase
      const transaction = buyFromListing({
        listingId: listing.id,
        quantity: 1n,
        contract: marketplaceContract,
        recipient: account.address
      });

      const sentTx = await sendTransaction({
        account,
        transaction,
      });

      const receipt = await waitForReceipt({
        transactionHash: sentTx.transactionHash,
        client: marketplaceContract.client,
        chain: marketplaceContract.chain,
      });

      console.log("Purchase successful", receipt);

      toast({
        title: "Purchase completed!",
        description: "The asset(s) should arrive in your account shortly.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // After successful purchase
      onPurchaseSuccess();

    } catch (error: unknown) {
      console.error("Error buying from listing:", error);
      setError(`Failed to complete purchase: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handlePurchase}
        isLoading={isLoading}
        loadingText="Buying..."
        disabled={!wallet}
      >
        Buy Now
      </Button>
      {error && <Text color="red.500">{error}</Text>}
    </>
  );
}
