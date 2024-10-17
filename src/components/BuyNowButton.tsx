import { client } from "@/consts/client";
import { useMarketplaceContext } from "@/hooks/useMarketplaceContext";
import { Button, useToast } from "@chakra-ui/react";
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
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";

type Props = {
  listing: DirectListing;
  account: Account;
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

const ShimmerButton = styled(Button)`
  position: relative;
  overflow: hidden;
  background: #808080; // Grey background when not hovered
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
      transparent 0%,
      rgba(255, 255, 255, 0.2) 50%,
      transparent 100%
    );
    transition: all 0.5s ease;
  }

  &:hover {
    background: linear-gradient(45deg, #ff00cc, #3333ff); // Gradient on hover
    animation: ${scaleUp} 0.5s ease-in-out;
  }

  &:hover::before {
    animation: ${shimmer} 1s infinite;
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

export default function BuyFromListingButton(props: Props) {
  const { account, listing } = props;
  const { marketplaceContract, refetchAllListings, nftContract } = useMarketplaceContext();
  const switchChain = useSwitchActiveWalletChain();
  const activeChain = useActiveWalletChain();
  const toast = useToast();

  return (
    <ShimmerButton
      onClick={async () => {
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
            const customTokenContract = getContract({
              address: listing.currencyContractAddress as Hex,
              client,
              chain: nftContract.chain,
            });

            const result = await allowance({
              contract: customTokenContract,
              owner: account.address,
              spender: marketplaceContract.address as Hex,
            });

            if (result < listing?.pricePerToken) {
              const _decimals = await decimals({ contract: customTokenContract });
              const transaction = approve({
                contract: customTokenContract,
                spender: marketplaceContract.address as Hex,
                amount: toTokens(listing?.pricePerToken, _decimals),
              });
              await sendAndConfirmTransaction({ transaction, account });
            }
          }

          const transaction = buyFromListing({
            contract: marketplaceContract,
            listingId: listing.id,
            quantity: listing.quantity,
            recipient: account.address,
          });

          const receipt = await sendTransaction({ transaction, account });
          await waitForReceipt({
            transactionHash: receipt.transactionHash,
            client,
            chain: nftContract.chain,
          });

          toast({
            title: "Purchase completed! The asset(s) should arrive in your account shortly.",
            status: "success",
            duration: 4000,
            isClosable: true,
          });

          refetchAllListings();
        } catch (err) {
          console.error(err);
          if ((err as Error).message.startsWith("insufficient funds for gas")) {
            toast({
              title: "You don't have enough funds for this purchase.",
              description: `Make sure you have enough gas for the transaction + ${listing.currencyValuePerToken.displayValue} ${
                listing.currencyValuePerToken.symbol === "ETH" ? "MELD" : listing.currencyValuePerToken.symbol
              }`,
              status: "error",
              isClosable: true,
              duration: 7000,
            });
          }
        }
      }}
    >
      Buy
    </ShimmerButton>
  );
}
