import { MediaRenderer, useReadContract } from "thirdweb/react";
import { getNFT as getNFT721 } from "thirdweb/extensions/erc721";
import { getNFT as getNFT1155 } from "thirdweb/extensions/erc1155";
import { client } from "@/consts/client";
import { Box, Flex, Heading, Tab, TabList, Tabs, Text } from "@chakra-ui/react";
import { useState } from "react";
import { useMarketplaceContext } from "@/hooks/useMarketplaceContext";
import { ListingGrid } from "./ListingGrid";
import { AllNftsGrid } from "./AllNftsGrid";

export function Collection() {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const {
    type,
    nftContract,
    isLoading,
    contractMetadata,
    listingsInSelectedCollection,
    supplyInfo,
  } = useMarketplaceContext();

  const { data: firstNFT, isLoading: isLoadingFirstNFT } = useReadContract(
    type === "ERC1155" ? getNFT1155 : getNFT721,
    {
      contract: nftContract,
      tokenId: 0n,
      queryOptions: {
        enabled: isLoading || !!contractMetadata?.image,
      },
    }
  );

  const thumbnailImage = contractMetadata?.image || firstNFT?.metadata.image || "";

  return (
    <>
      <Box mt="0px" position="relative" width="100%" minHeight="100vh" overflowX="hidden" overflowY="hidden">
        <Flex
          direction="column"
          gap="4"
          alignItems="center"
          maxWidth="100vw"
          pt="20px"
        >
          <Box
            position="absolute"
            top="-20px"
            left="50%"
            transform="translateX(-50%) scaleX(-1)"
            width="100vw"
            height="auto"
            zIndex="-1"
            filter="blur(180px) contrast(1.5) saturate(1.5)"
            opacity="0.1"
          >
            {thumbnailImage ? (
              <MediaRenderer
                client={client}
                src={thumbnailImage}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <Box bg="hexa(22, 22, 22, 0.3)" height="100%" width="100%"></Box>
            )}
          </Box>

          <Box
            borderRadius="20px"
            width="350px"
            height="250px"
            zIndex="1"
            mt="20px"
          >
            {thumbnailImage ? (
              <MediaRenderer
                client={client}
                src={thumbnailImage}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: "12px",
                }}
              />
            ) : (
              <Box bg="hexa(22, 22, 22, 0.3)" borderRadius="12px" height="100%" width="100%"></Box>
            )}
          </Box>

          <Heading mx="auto">
            {contractMetadata?.name || "Unknown collection"}
          </Heading>
          {contractMetadata?.description && (
            <Text
              maxW={{ lg: "500px", base: "300px" }}
              mx="auto"
              textAlign="center"
              mb="10px"
            >
              {contractMetadata.description}
            </Text>
          )}

          <Tabs
            variant="unstyled"
            mx="auto"
            mt="10px"
            mb="5px"
            onChange={(index: number) => setTabIndex(index)}
            isLazy
          >
            <TabList zIndex="10">
              <Tab
                width="120px"
                height="40px"
                fontSize="16px"
                lineHeight="1"
                border="1px solid"
                borderColor={tabIndex === 0 ? "white" : "gray.700"}
                color={tabIndex === 0 ? "white" : "gray.400"}
                backgroundColor={tabIndex === 0 ? "transparent" : "transparent"}
                borderRadius="999px"
                marginRight="20px"
                _hover={{
                  cursor: "pointer",
                  borderColor: "gray.300",
                  color: "white",
                }}
                _selected={{
                  borderColor: "white",
                  color: "white",
                }}
              >
                <Flex alignItems="center" justifyContent="center" whiteSpace="nowrap">
                  <Text mr="5px">Listings</Text>
                  <Text>({listingsInSelectedCollection.length || 0})</Text>
                </Flex>
              </Tab>

              <Tab
                width="120px"
                height="40px"
                fontSize="16px"
                lineHeight="1"
                border="1px solid"
                borderColor={tabIndex === 1 ? "white" : "gray.700"}
                color={tabIndex === 1 ? "white" : "gray.400"}
                backgroundColor={tabIndex === 1 ? "transparent" : "transparent"}
                borderRadius="999px"
                _hover={{
                  cursor: "pointer",
                  borderColor: "gray.300",
                  color: "white",
                }}
                _selected={{
                  borderColor: "white",
                  color: "white",
                }}
              >
                <Flex alignItems="center" justifyContent="center" whiteSpace="nowrap">
                  <Text mr="5px">All Items</Text>
                  <Text>
                    {supplyInfo
                      ? `(${(
                          supplyInfo.endTokenId -
                          supplyInfo.startTokenId +
                          1n
                        ).toString()})`
                      : "(0)"}
                  </Text>
                </Flex>
              </Tab>
            </TabList>
          </Tabs>
        </Flex>

        <Box
          position="relative"
          top="0"
          bg="transparent"
          py="30px"
          width="100%"
          minHeight="340px"
          zIndex="2"
          overflowY="auto"
          overflowX="hidden"
        >
          <Flex
            direction="column"
            maxWidth="100vw"
          >
            {tabIndex === 0 && <ListingGrid />}
            {tabIndex === 1 && <AllNftsGrid />}
          </Flex>
        </Box>
      </Box>
    </>
  );
}