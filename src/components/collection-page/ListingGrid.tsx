"use client";

import { client } from "@/consts/client";
import { useMarketplaceContext } from "@/hooks/useMarketplaceContext";
import { ChakraNextLink } from '@/components/ChakraNextLink';
import {
  Box,
  Flex,
  SimpleGrid,
  useBreakpointValue,
  Text,
  Input,
} from "@chakra-ui/react";
import { MediaRenderer, useActiveAccount } from "thirdweb/react"; 
import { useState } from "react";
import dynamic from "next/dynamic";
import { NFTCard } from "@/components/NFTCard";
import { convertIpfsToHttp } from "@/utils/ipfsUtils"; // Create this utility function if it doesn't exist

const BuyNowButton = dynamic(() =>
  import("../token-page/BuyNowButton").then((mod) => mod.default), {
    ssr: false,
  }
);

export function ListingGrid() {
  const { listingsInSelectedCollection, nftContract } = useMarketplaceContext();
  const [searchQuery, setSearchQuery] = useState(""); 
  const account = useActiveAccount(); 

  const filteredListings =
    listingsInSelectedCollection?.filter((item) => {
      const name = item.asset?.metadata?.name?.toLowerCase() || "";
      return name.includes(searchQuery.toLowerCase());
    }) || [];

  const len = filteredListings.length;
  const columns = useBreakpointValue({
    base: 1,
    sm: Math.min(len, 2),
    md: Math.min(len, 4),
    lg: Math.min(len, 4),
    xl: Math.min(len, 5),
  });

  if (!listingsInSelectedCollection || !len) {
    return <Box mt="20px" textAlign="center">No listings found.</Box>;
  }

  return (
    <>
      <Flex justifyContent="center" alignItems="center" mt="0px" px="10px" gap="2">
        <Input
          placeholder="Search Listings"
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          width="300px"
          maxW="100%"
          bg="rgba(30,30,30,0.7)"
          border="1px solid rgb(222, 222, 222, 0.1)"
        />
      </Flex>

      <SimpleGrid columns={columns} spacing={4} p={4} mx="auto" mt="20px">
        {filteredListings.map((item) => (
          <NFTCard
            key={item.id.toString()}
            nft={{
              id: item.asset.id.toString(),
              metadata: {
                name: item.asset.metadata?.name || "",
                image: item.asset.metadata?.image || "",
              },
              owner: item.asset.owner,
              tokenURI: item.asset.tokenURI,
              type: item.asset.type,
            }}
            nftContract={nftContract}
            account={account}
            listingsInSelectedCollection={listingsInSelectedCollection}
            convertIpfsToHttp={convertIpfsToHttp}
            activeWallet={account}
            price={item.currencyValuePerToken.displayValue}
            currencySymbol={item.currencyValuePerToken.symbol === "ETH" ? "MELD" : item.currencyValuePerToken.symbol}
          >
            {account && (
              <BuyNowButton
                listing={item} 
                account={account} 
              />
            )}
          </NFTCard>
        ))}
      </SimpleGrid>
    </>
  );
}
