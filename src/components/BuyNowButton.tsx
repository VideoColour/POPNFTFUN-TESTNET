/** @jsxImportSource @emotion/react */
import { jsx } from '@emotion/react';
import { client } from "@/consts/client";
import { useMarketplaceContext } from "@/hooks/useMarketplaceContext";
import { useToast, Button } from "@chakra-ui/react";
import {
  type Hex,
  NATIVE_TOKEN_ADDRESS,
  getContract,
  sendAndConfirmTransaction,
  sendTransaction,
  toTokens,
  waitForReceipt,
} from "thirdweb";
import { allowance, approve, decimals } from "thirdweb/extensions/erc20";
import {
  type DirectListing,
  buyFromListing,
} from "thirdweb/extensions/marketplace";
import {
  useActiveWalletChain,
  useSwitchActiveWalletChain,
} from "thirdweb/react";
import type { Account } from "thirdweb/wallets";
import { css, keyframes } from "@emotion/react";
import React from "react";

type Props = {
  listing: DirectListing | undefined;
  account: Account | undefined;
};

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const scaleUp = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const buttonStyles = css`
  position: relative;
  overflow: hidden;
  background: #222222;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.4s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 200%;
    height: 100%;
    background: linear-gradient(
      to right,
      rgba(20, 20, 20, 0.20) 0%,
      rgba(20, 20, 20, 0.20) 100%,
      transparent 100%
    );
    transition: all 0.5s ease;
  }

  &:hover {
    background: linear-gradient(45deg, #ff00cc, #3333ff);
    animation: ${scaleUp} 0.5s ease-in-out;
  }

  &:hover::before {
    animation: ${shimmer} 1s infinite;
  }

  span {
    color: rgba(255, 255, 255, 0.6);
    font-weight: bold;
    position: relative;
    z-index: 1;
    transition: color 0.3s ease;
  }

  &:hover span {
    color: rgba(255, 255, 255, 1);
  }
`;

const addChain = async () => {
  try {
    await (window as any).ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: "0x3637275b", 
          chainName: "Meld Testnet",
          rpcUrls: ["https://testnet-rpc.meld.com"],
          nativeCurrency: {
            name: "gMeld",
            symbol: "gMELD",
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

export default function BuyNowButton({ listing, account }: Props) {
  const { marketplaceContract, nftContract, refetchAllListings } = useMarketplaceContext();
  const toast = useToast();
  const activeChain = useActiveWalletChain();
  const switchChain = useSwitchActiveWalletChain();

  const handleClick = async () => {
    if (!account || typeof account.sendTransaction !== 'function') {
      console.error("No wallet connected or sendTransaction not implemented");
      // Optionally, you can trigger the wallet connection here
      return;
    }

    if (!listing) {
      console.error("Listing is undefined");
      return;
    }

    if (activeChain?.id !== nftContract.chain.id) {
      try {
        await switchChain(nftContract.chain);
      } catch (error) {
        console.error("Switch chain error:", error);
        await addChain(); 
      }
    }

    try {
      if (
        listing.currencyContractAddress.toLowerCase() !==
        NATIVE_TOKEN_ADDRESS.toLowerCase()
      ) {
        const customTokenContract = await getContract({
          address: listing.currencyContractAddress,
          client,
          chain: nftContract.chain,
        });

        const result = await allowance({
          contract: customTokenContract,
          owner: account.address,
          spender: marketplaceContract.address,
        });

        if (result < listing?.pricePerToken) {
          const _decimals = await decimals({ contract: customTokenContract });
          const transaction = approve({
            contract: customTokenContract,
            spender: marketplaceContract.address,
            amount: toTokens(listing?.pricePerToken, _decimals),
          });
          await sendTransaction({ transaction, account });
        }
      }

      const transaction = buyFromListing({
        contract: marketplaceContract,
        listingId: listing.id,
        quantity: 1n,
        recipient: account.address,
      });

      const receipt = await sendTransaction({ transaction, account });
      await waitForReceipt(receipt);

      toast({
        title: "Purchase completed! The asset(s) should arrive in your account shortly.",
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      refetchAllListings();
    } catch (error) {
      console.error("Error during purchase:", error);
      if ((error as Error).message.startsWith("insufficient funds for gas")) {
        toast({
          title: "You don't have enough funds for this purchase.",
          description: `Make sure you have enough gas for the transaction + ${listing.currencyValuePerToken.displayValue} ${
            listing.currencyValuePerToken.symbol === "ETH" ? "MELD" : listing.currencyValuePerToken.symbol
          }`,
          status: "error",
          isClosable: true,
          duration: 7000,
        });
      } else {
        toast({
          title: "Error during purchase",
          description: (error as Error).message,
          status: "error",
          isClosable: true,
          duration: 7000,
        });
      }
    }
  };

  if (!listing || !account) {
    return null; // Don't render the button if there's no listing or account
  }

  return (
    <div css={buttonStyles} onClick={handleClick}>
      <span>Buy</span>
    </div>
  );
}
