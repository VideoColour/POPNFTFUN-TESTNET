"use client";

import { client } from "@/consts/client";
import { MARKETPLACE_CONTRACTS } from "@/consts/marketplace_contract";
import { NFT_CONTRACTS } from "@/consts/nft_contracts";
import { SUPPORTED_TOKENS, Token } from "@/consts/supported_tokens";
import {
  getSupplyInfo,
  SupplyInfo,
} from "@/extensions/getLargestCirculatingTokenId";
import { Box, Spinner } from "@chakra-ui/react";
import { createContext, type ReactNode, useContext, useEffect } from "react";
import { getContract, type ThirdwebContract } from "thirdweb";
import { getContractMetadata } from "thirdweb/extensions/common";
import { isERC1155 } from "thirdweb/extensions/erc1155";
import { isERC721 } from "thirdweb/extensions/erc721";
import {
  type DirectListing,
  type EnglishAuction,
  getAllAuctions,
  getAllValidListings,
} from "thirdweb/extensions/marketplace";
import { useReadContract } from "thirdweb/react";
import { useActiveWallet } from "thirdweb/react";
import { useWallet } from "@/hooks/useWallet";
import { useActiveAccount } from "thirdweb/react";

export type NftType = 'ERC721' | 'ERC1155';

const SUPPORT_AUCTION = false;

type TMarketplaceContext = {
  marketplaceContract: ThirdwebContract;
  nftContract: ThirdwebContract;
  type: NftType;
  isLoading: boolean;
  allValidListings: DirectListing[] | undefined;
  allAuctions: EnglishAuction[] | undefined;
  contractMetadata:
    | {
        [key: string]: any;
        name: string;
        symbol: string;
      }
    | undefined;
  refetchAllListings: Function;
  isRefetchingAllListings: boolean;
  listingsInSelectedCollection: DirectListing[];
  supplyInfo: SupplyInfo | undefined;
  supportedTokens: Token[];
  fetchListings: () => Promise<any>;
  isWalletConnected: boolean;
  wallet?: any; // Add this line
  account: any;
};

const MarketplaceContext = createContext<TMarketplaceContext | undefined>(
  undefined
);

interface MarketplaceProviderProps {
  chainId: string;
  contractAddress: string;
  children: ReactNode;
  wallet?: any;
}

export default function MarketplaceProvider({
  chainId,
  contractAddress,
  children,
}: MarketplaceProviderProps) {
  console.log("MarketplaceProvider initialized with chainId:", chainId, "and contractAddress:", contractAddress);

  let _chainId: number;
  try {
    _chainId = Number.parseInt(chainId);
  } catch (err) {
    throw new Error("Invalid chain ID");
  }

  const marketplaceContract = MARKETPLACE_CONTRACTS.find(
    (item) => item.chain.id === _chainId
  );

  if (!marketplaceContract) {
    throw new Error("Marketplace not supported on this chain");
  }

  const collectionSupported = NFT_CONTRACTS.find(
    (item) =>
      item.address.toLowerCase() === contractAddress.toLowerCase() &&
      item.chain.id === _chainId
  );

  const contract = getContract({
    chain: marketplaceContract.chain,
    client,
    address: contractAddress,
  });

  const marketplace = getContract({
    address: marketplaceContract.address,
    chain: marketplaceContract.chain,
    client,
  });

  const { data: is721, isLoading: isChecking721 } = useReadContract(isERC721, {
    contract,
    queryOptions: {
      enabled: !!marketplaceContract,
    },
  });
  const { data: is1155, isLoading: isChecking1155 } = useReadContract(
    isERC1155,
    { contract, queryOptions: { enabled: !!marketplaceContract } }
  );

  const isNftCollection = is1155 || is721;

  if (!isNftCollection && !isChecking1155 && !isChecking721)
    throw new Error("Not a valid NFT collection");

  const { data: contractMetadata, isLoading: isLoadingContractMetadata } =
    useReadContract(getContractMetadata, {
      contract,
      queryOptions: {
        enabled: isNftCollection,
      },
    });

  const {
    data: allValidListings,
    isLoading: isLoadingValidListings,
    refetch: refetchAllListings,
    isRefetching: isRefetchingAllListings,
  } = useReadContract(getAllValidListings, {
    contract: marketplace,
    queryOptions: {
      enabled: isNftCollection,
    },
  });

  const listingsInSelectedCollection = allValidListings?.length
    ? allValidListings.filter(
        (item) =>
          item.assetContractAddress.toLowerCase() ===
          contract.address.toLowerCase()
      )
    : [];

  const { data: allAuctions, isLoading: isLoadingAuctions } = useReadContract(
    getAllAuctions,
    {
      contract: marketplace,
      queryOptions: { enabled: isNftCollection && SUPPORT_AUCTION },
    }
  );

  const { data: supplyInfo, isLoading: isLoadingSupplyInfo } = useReadContract(
    getSupplyInfo,
    {
      contract,
    }
  );

  const isLoading =
    isChecking1155 ||
    isChecking721 ||
    isLoadingAuctions ||
    isLoadingContractMetadata ||
    isLoadingValidListings ||
    isLoadingSupplyInfo;

  const supportedTokens: Token[] =
    SUPPORTED_TOKENS.find(
      (item) => item.chain.id === marketplaceContract.chain.id
    )?.tokens || [];

  const { isWalletConnected, wallet } = useWallet();
  const account = useActiveAccount();

  // Log the context values to confirm
  console.log("Marketplace Context Values:", {
    marketplaceContract: marketplace,
    nftContract: contract,
    isLoading,
    type: is1155 ? "ERC1155" : "ERC721",
    allValidListings,
    allAuctions,
    contractMetadata,
    refetchAllListings,
    isRefetchingAllListings,
    listingsInSelectedCollection,
    supplyInfo,
    supportedTokens,
  });
  const fetchListings = async () => {
    const listings = await getAllValidListings({ contract: marketplace });
    return listings;
  };
  const value: TMarketplaceContext = {
    marketplaceContract: marketplace,
    nftContract: contract,
    isLoading,
    type: is1155 ? "ERC1155" : "ERC721",
    wallet,
    allValidListings,
    allAuctions,
    contractMetadata,
    refetchAllListings,
    isRefetchingAllListings,
    listingsInSelectedCollection,
    supplyInfo,
    supportedTokens,
    fetchListings,
    isWalletConnected,
    account,
  };

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
      {isLoading && (
        <Box
          position="fixed"
          bottom="10px"
          right="10px"
          backgroundColor="rgba(0, 0, 0, 0.7)"
          padding="10px"
          borderRadius="md"
          zIndex={1000}
        >
          <Spinner size="lg" color="purple" />
        </Box>
      )}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplaceContext(): TMarketplaceContext {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error("useMarketplaceContext must be used within a MarketplaceProvider");
  }
  return context;
}

