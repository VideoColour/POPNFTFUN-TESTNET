/** @jsxImportSource @emotion/react */
import { jsx } from '@emotion/react';
import { client } from "@/consts/client";
import { useMarketplaceContext } from "@/hooks/useMarketplaceContext";
import { useToast, Button, Spinner, Box } from "@chakra-ui/react";
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

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const loadingButtonStyles = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const spinnerStyles = css`
  color: white;
`;

const buttonContentStyles = css`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const customSpinnerStyles = css`
  width: 20px;
  height: 20px;
  border: 2px solid white;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.5); opacity: 0.7; }
`;

const pulsatingDotStyles = css`
  width: 10px;
  height: 10px;
  background-color: white;
  border-radius: 50%;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const fadingRingStyles = css`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: ${rotate} 1s linear infinite;
`;

const burstPulse = keyframes`
  0% {
    transform: scale(0.1);
    opacity: 0;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
`;

const burstingRingStyles = css`
  width: 20px;
  height: 20px;
  border: 2px solid white;
  border-radius: 50%;
  animation: ${burstPulse} 1.5s ease-out infinite;
`;

interface BuyNowButtonProps {
  listing: any;
  account: any;
  onBuyStart?: () => void;
  onBuyEnd?: () => void;
  activeWallet: any;
}

export default function BuyNowButton({ listing, account, onBuyStart, onBuyEnd, activeWallet }: BuyNowButtonProps) {
  const { marketplaceContract, nftContract, refetchAllListings } = useMarketplaceContext();
  const toast = useToast();
  const activeChain = useActiveWalletChain();
  const switchChain = useSwitchActiveWalletChain();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleBuy = async () => {
    setIsLoading(true);
    if (onBuyStart) onBuyStart();
    try {
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
      console.error("Error buying NFT:", error);
      toast({
        title: "Error occurred while purchasing.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
      if (onBuyEnd) onBuyEnd();
    }
  };

  return (
    <Button
      onClick={handleBuy}
      css={[buttonStyles, isLoading && loadingButtonStyles]}
      disabled={isLoading}
      aria-label={isLoading ? "Buying in progress" : "Buy now"}
    >
      {isLoading ? (
        <div css={burstingRingStyles} />
      ) : (
        <span>Buy</span>
      )}
    </Button>
  );
}

function addChain() {
  throw new Error('Function not implemented.');
}
