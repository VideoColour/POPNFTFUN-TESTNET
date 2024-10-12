"use client";
import { client } from "@/consts/client";
import { Box, Flex, Link, Text, Button } from "@chakra-ui/react";
import type { NFT, ThirdwebContract } from "thirdweb";
import { MediaRenderer } from "thirdweb/react";

interface OwnedItemProps {
  nft: NFT;
  nftCollection: ThirdwebContract;
  listings: any[]; 
}

export function OwnedItem({ nft, nftCollection, listings }: OwnedItemProps) {
  const listing = listings.find(
    (listing) => listing.tokenId.toString() === nft.id.toString()
  );

  const isListed = !!listing;

  return (
    <Box
      rounded="12px"
      as={Link}
      href={`/collection/${nftCollection.chain.id}/${nftCollection.address}/token/${nft.id.toString()}`}
      _hover={{
        textDecoration: "none",
        boxShadow: "0 6px 15px rgba(0, 0, 0, 0.3)",
        transform: "scale(1.05)",
        transition: "all 0.2s ease-in-out",
      }}
      bg="rgb(33, 33, 33, 0.8)"
      border="1px solid rgb(222, 222, 222, 0.1)"
      p="20px"
      w={{ base: "100%", md: "100%", lg: "100%" }}
      maxW="250px"
      mx="auto"
    >
      <Flex direction="column" alignItems="center">
        <Box borderRadius="12px" overflow="hidden" w="100%" h="200px">
          <MediaRenderer
            client={client}
            src={nft.metadata.image}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "12px",
            }}
          />
        </Box>

        <Text
          fontWeight="bold"
          fontSize="lg"
          mt="10px"
          color="white"
          textAlign="left"
          whiteSpace="nowrap"
          overflow="hidden"
          textOverflow="ellipsis"
          width="100%"
        >
          {nft.metadata?.name ?? "[no name]"}
        </Text>

        {isListed ? (
          <Flex justifyContent="space-between" alignItems="center" w="100%" mt="2">
            <Box textAlign="left" mr="5px">
              <Text color="gray.300" fontSize="md" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                Listing Price
              </Text>
              <Text fontWeight="bold" fontSize="lg" color="white">
                {listing.currencyValuePerToken.displayValue} {listing.currencyValuePerToken.symbol === "ETH" ? "MELD" : listing.currencyValuePerToken.symbol}
              </Text>
            </Box>
            <Button
              bg="transparent"
              color="#00875a"
              size="xs"
              fontWeight="bold"
              border="2px solid #00875a"
            >
              ACTIVE
            </Button>
          </Flex>
        ) : (
          <Flex justifyContent="space-between" alignItems="center" w="100%" mt="2">
            <Box textAlign="left" mr="5px">
              <Text color="gray.300" fontSize="md" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                Not Listed
              </Text>
            </Box>
            <Button
              bg="transparent"
              color="gray.500"
              size="xs"
              fontWeight="bold"
              border="1px solid gray"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              INACTIVE
            </Button>
          </Flex>
        )}
      </Flex>
    </Box>
  );
}