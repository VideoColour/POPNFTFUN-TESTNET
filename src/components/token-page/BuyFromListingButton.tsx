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

	type Props = {
		listing: DirectListing;
		account: Account;
	};

	const addChain = async () => {
		try {
		await (window as any).ethereum.request({
			method: 'wallet_addEthereumChain',
			params: [{
			chainId: '0x3637275b', 
			chainName: 'Meld Testnet',
			rpcUrls: ['https://222000222.rpc.thirdweb.com'],
			nativeCurrency: {
				name: 'gMeld',
				symbol: 'gMELD',
				decimals: 18,
			},
			blockExplorerUrls: ['https://testnet.meldscan.io'],
			}],
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
			<Button
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
			const _decimals = await decimals({
				contract: customTokenContract,
			});
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
		const receipt = await sendTransaction({
			transaction,
			account,
		});
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
                listing.currencyValuePerToken.symbol === "MELD" ? "MELD" : listing.currencyValuePerToken.symbol
              }`,			status: "error",
			isClosable: true,
			duration: 7000,
			});
		}
		}
	}}
	>
	Buy
	</Button>

		);
	}
