/** @jsxImportSource @emotion/react */
import React, { useState } from 'react';
import { useMarketplaceContext } from "@/hooks/useMarketplaceContext";
import { useToast, Button } from "@chakra-ui/react";
import { css, keyframes } from "@emotion/react";
import { DirectListing } from "thirdweb/extensions/marketplace";

// Keyframes
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const scaleUp = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const burstPulse = keyframes`
  0% { transform: scale(0.1); opacity: 0; }
  50% { opacity: 0.7; }
  100% { transform: scale(1); opacity: 0; }
`;

// Styles
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

const burstingRingStyles = css`
  width: 20px;
  height: 20px;
  border: 2px solid white;
  border-radius: 50%;
  animation: ${burstPulse} 1.5s ease-out infinite;
`;

// ... (keep all the keyframes and styles from BuyNowButton)

interface RelatedBuyNowButtonProps {
  listing: DirectListing;
  account: any; // Changed from 'wallet' to 'account'
}

export default function RelatedBuyNowButton({
  listing,
  account
}: RelatedBuyNowButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { marketplaceContract, refetchAllListings } = useMarketplaceContext();
  const toast = useToast();

  const handlePurchase = async () => {
    if (!account) {
      console.error("No account connected");
      toast({
        title: "No wallet connected",
        description: "Please connect your wallet to make a purchase.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      // Implement your purchase logic here
      // You can use the marketplaceContract, listing, and account to perform the purchase

      toast({
        title: "Purchase successful",
        description: "The NFT has been purchased successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Refetch listings after successful purchase
      refetchAllListings();
    } catch (error) {
      console.error("Error during purchase:", error);
      toast({
        title: "Purchase failed",
        description: "There was an error while trying to purchase the NFT.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePurchase}
      css={[buttonStyles, isLoading && loadingButtonStyles]}
      disabled={isLoading || !account}
      aria-label={isLoading ? "Buying in progress" : "Buy now"}
    >
      {isLoading ? (
        <div css={burstingRingStyles} />
      ) : (
        <span>Buy Now</span>
      )}
    </Button>
  );
}

// ... (include all the styles from BuyNowButton)
