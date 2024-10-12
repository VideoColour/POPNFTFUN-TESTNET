"use client";

import { client } from "@/consts/client";
import { useMarketplaceContext } from "@/hooks/useMarketplaceContext";
import { Link } from "@chakra-ui/next-js";
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
        {filteredListings.map((item) => {
          return (
            <Box
              key={item.id}
              rounded="12px"
              bg="rgb(33, 33, 33, 0.8)"
              border="1px solid rgb(222, 222, 222, 0.1)"
              p="20px"
              _hover={{ 
                boxShadow: "0 6px 15px rgba(0, 0, 0, 0.3)", 
                transform: "scale(1.05)", 
                transition: "all 0.2s ease-in-out", 
              }}
              transition="all 0.2s ease-in-out" 
            >
              <Link
                href={`/collection/${nftContract.chain.id}/${nftContract.address}/token/${item.asset.id.toString()}`}
                _hover={{ 
                  textDecoration: "none", 
                }} 
              >
                <Flex direction="column" alignItems="center">
                  <MediaRenderer
                    client={client}
                    src={item.asset.metadata.image}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                  <Text fontWeight="bold" fontSize="lg" mt="10px" color="white" textAlign="center">
                    {item.asset?.metadata?.name ?? "Unknown item"}
                  </Text>
                </Flex>
              </Link>

              <Flex justifyContent="space-between" alignItems="center" w="100%" mt="2">
                <Box textAlign="left">
                  <Text color="gray.300">Price</Text><Text fontWeight="bold" mb="0">
  {item.currencyValuePerToken.displayValue} {item.currencyValuePerToken.symbol === "ETH" ? "MELD" : item.currencyValuePerToken.symbol}
</Text>

                  <Text fontWeight="bold" fontSize="lg" color="white">
                  </Text>
                </Box>

                {account && (
                  <Box>
                    <BuyNowButton
                      listing={item} 
                      account={account} 
                    />
                  </Box>
                )}
              </Flex>
            </Box>
          );
        })}
      </SimpleGrid>
    </>
  );
}
