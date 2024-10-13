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
import { useState } from "react";
import { MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight } from "react-icons/md";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import { getNFTs as getNFTs1155 } from "thirdweb/extensions/erc1155";
import { getNFTs as getNFTs721 } from "thirdweb/extensions/erc721";
import { MediaRenderer, useReadContract } from "thirdweb/react";
import { Button } from "@chakra-ui/react";

export function AllNftsGrid() {
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState(""); 
  const { nftContract, type, supplyInfo } = useMarketplaceContext();
  
  const startTokenId = supplyInfo?.startTokenId ?? 0n;
  const totalItems: bigint = supplyInfo
    ? supplyInfo.endTokenId - supplyInfo.startTokenId + 1n
    : 0n;
  
  const numberOfPages: number = Number(
    (totalItems + BigInt(itemsPerPage) - 1n) / BigInt(itemsPerPage)
  );
  
  const pages: { start: number; count: number }[] = [];
  for (let i = 0; i < numberOfPages; i++) {
    const currentStartTokenId = startTokenId + BigInt(i * itemsPerPage);
    const remainingItems = totalItems - BigInt(i * itemsPerPage);
    const count =
      remainingItems < BigInt(itemsPerPage)
        ? Number(remainingItems)
        : itemsPerPage;
    pages.push({ start: Number(currentStartTokenId), count: count });
  }

  const { data: allNFTs, error } = useReadContract(
    type === "ERC1155" ? getNFTs1155 : getNFTs721,
    {
      contract: nftContract,
      start: pages[currentPageIndex].start,
      count: pages[currentPageIndex].count,
    }
  );

  console.log("NFTs Data: ", allNFTs);

  if (error) {
    console.error("Error fetching NFTs:", error);
  }

  const filteredNFTs = allNFTs?.filter((nft) => {
    const name = nft.metadata?.name?.toLowerCase() || "";
    return name.includes(searchQuery.toLowerCase());
  }) || [];

  const len = filteredNFTs?.length ?? 0;
  const columns = useBreakpointValue({
    base: 1,
    sm: Math.min(len, 2),
    md: Math.min(len, 4),
    lg: Math.min(len, 4),
    xl: Math.min(len, 5),
  });

  return (
    <>
      <Flex justifyContent="center" alignItems="center" mt="0px" px="10px" gap="2">
        <Input
          placeholder="Search NFTs"
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          width="300px"
          maxW="100%"
          bg="rgba(30,30,30,0.7)"
          border="1px solid rgb(222, 222, 222, 0.1)"
        />
      </Flex>

      <SimpleGrid columns={columns} spacing={4} p={4} mx="auto" mt="20px">
        {filteredNFTs.length > 0 ? (
          filteredNFTs.map((item) => (
            <Box
              key={item.id}
              rounded="12px"
              as={ChakraNextLink}
              href={`/collection/${nftContract.chain.id}/${nftContract.address}/token/${item.id.toString()}`}
              _hover={{ 
                textDecoration: "none", 
                boxShadow: "0 6px 15px rgba(0, 0, 0, 0.3)", 
                transform: "scale(1.05)", 
                transition: "all 0.2s ease-in-out" 
              }}
              bg="rgb(33, 33, 33, 0.8)"
              border="1px solid rgb(222, 222, 222, 0.1)"
              p="20px"
            >
              <Flex direction="column" alignItems="center">
                <Box borderRadius="12px" overflow="hidden">
                  <MediaRenderer
                    client={client}
                    src={item.metadata.image}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                    }}
                  />
                </Box>
                <Text
                  fontWeight="bold"
                  fontSize="lg"
                  mt="10px"
                  color="white"
                  textAlign="center"
                >
                  {item.metadata?.name ?? "Unknown item"}
                </Text>
              </Flex>
            </Box>
          ))
        ) : (
          <Box mx="auto">Loading...</Box>
        )}
      </SimpleGrid>

      <Box
        mx="auto"
        maxW={{ base: "90vw", lg: "700px" }}
        mt="20px"
        px="10px"
        py="5px"
        overflowX="auto"
      >
        <Flex direction="row" justifyContent="center" gap="3">
          <Button
            onClick={() => setCurrentPageIndex(0)}
            isDisabled={currentPageIndex === 0}
          >
            <MdKeyboardDoubleArrowLeft />
          </Button>
          <Button
            isDisabled={currentPageIndex === 0}
            onClick={() => setCurrentPageIndex(currentPageIndex - 1)}
          >
            <RiArrowLeftSLine />
          </Button>
          <Text my="auto">
            Page {currentPageIndex + 1} of {pages.length}
          </Text>
          <Button
            isDisabled={currentPageIndex === pages.length - 1}
            onClick={() => setCurrentPageIndex(currentPageIndex + 1)}
          >
            <RiArrowRightSLine />
          </Button>
          <Button
            onClick={() => setCurrentPageIndex(pages.length - 1)}
            isDisabled={currentPageIndex === pages.length - 1}
          >
            <MdKeyboardDoubleArrowRight />
          </Button>
        </Flex>
      </Box>
    </>
  );
}