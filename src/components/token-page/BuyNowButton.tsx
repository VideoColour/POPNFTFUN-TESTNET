import { client, provider } from "@/consts/client";
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

type Props = {
  listing: DirectListing;
  account: Account;
};

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

  const handleClick = async () => {
    if (!account || !listing) return;

    try {
      // Check user's balance
      const balance = await provider.getBalance(account.address);
      const price = listing.currencyValuePerToken.value;
      const formattedBalance = formatUnits(balance, 18);
      const formattedPrice = formatUnits(price, 18);

      if (parseFloat(formattedBalance) < parseFloat(formattedPrice)) {
        console.error("Insufficient balance");
        // Show an error message to the user
        return;
      }

      // Proceed with the transaction if balance is sufficient
      const transaction = await buyFromListing({
        listingId: listing.id,
        quantity: 1n,
        contract: marketplaceContract,
        recipient: account.address
      });

      console.log("Purchase successful", transaction);
    } catch (error) {
      console.error("Error buying from listing:", error);
      // Show an error message to the user
    }
  };

  return (
    <Button
      onClick={handleClick}
    >
      Buy
    </Button>
  );
}
