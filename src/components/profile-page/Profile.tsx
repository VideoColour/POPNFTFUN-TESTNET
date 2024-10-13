// ProfileSection component
import {
  Box,
  Flex,
  Heading,
  Img,
  SimpleGrid,
  Tab,
  TabList,
  Tabs,
  Text,
  Button,
  useBreakpointValue,
} from "@chakra-ui/react";
import { blo } from "blo";
import { shortenAddress } from "thirdweb/utils";
import { ProfileMenu } from "./Menu";
import { useState, useMemo, useCallback, useEffect } from "react";
import { NFT_CONTRACTS, type NftContract } from "@/consts/nft_contracts";
import {
  MediaRenderer,
  useActiveAccount,
  useReadContract,
} from "thirdweb/react";
import { getContract } from "thirdweb";
import { client } from "@/consts/client";
import { getOwnedERC721s } from "@/extensions/getOwnedERC721s";
import { OwnedItem } from "./OwnedItem";
import { getAllValidListings } from "thirdweb/extensions/marketplace";
import { MARKETPLACE_CONTRACTS } from "@/consts/marketplace_contract";
import { ChakraNextLink } from '@/components/ChakraNextLink';
import { getOwnedERC1155s } from "@/extensions/getOwnedERC1155s";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useGetENSAvatar } from "@/hooks/useGetENSAvatar";
import { useGetENSName } from "@/hooks/useGetENSName";
import { balanceOf } from "thirdweb/extensions/erc721";
import { getOwnedNFTs } from "thirdweb/extensions/erc721";

type Props = {
  address: string;
};

export function ProfileSection(props: Props) {
  const { address } = props;
  const account = useActiveAccount();
  const isYou = address.toLowerCase() === account?.address.toLowerCase();
  const { data: ensName } = useGetENSName({ address });
  const { data: ensAvatar } = useGetENSAvatar({ ensName });
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [selectedCollection, setSelectedCollection] = useState<NftContract>(
    NFT_CONTRACTS[0]
  );
  const contract = getContract({
    address: selectedCollection.address,
    chain: selectedCollection.chain,
    client,
  });

  // Fetch owned NFTs
  const {
    data: ownedNFTs,
    error: ownedNFTsError,
    isLoading: isLoadingOwnedNFTs,
  } = useReadContract(
    selectedCollection.type === "ERC1155" ? getOwnedERC1155s : getOwnedNFTs,
    {
      contract,
      owner: address,
      queryOptions: {
        enabled: !!address,
      },
    }
  );

  const chain = contract.chain;
  const marketplaceContractAddress = MARKETPLACE_CONTRACTS.find(
    (o) => o.chain.id === chain.id
  )?.address;
  if (!marketplaceContractAddress) throw Error("No marketplace contract found");
  const marketplaceContract = getContract({
    address: marketplaceContractAddress,
    chain,
    client,
  });

  const { data: allValidListings } = useReadContract(getAllValidListings, {
    contract: marketplaceContract,
    queryOptions: { enabled: ownedNFTs && ownedNFTs.length > 0 },
  });

  const listings = useMemo(
    () =>
      allValidListings?.length
        ? allValidListings.filter(
            (item) =>
              item.assetContractAddress.toLowerCase() ===
                contract.address.toLowerCase() &&
              item.creatorAddress.toLowerCase() === address.toLowerCase()
          )
        : [],
    [allValidListings, contract.address, address]
  );

  const columns = useBreakpointValue({ base: 1, sm: 2, md: 2, lg: 2, xl: 2 });

  const { data: nftBalance } = useReadContract(balanceOf, {
    contract,
    owner: address,
  });

  const handleActiveButtonClick = useCallback(
    (item: { asset: { id: { toString: () => any; }; }; }) => {
      window.location.href = `/collection/${contract.chain.id}/${contract.address}/token/${item.asset.id.toString()}`;
    },
    [contract.chain.id, contract.address]
  );

  const sortedOwnedNFTs = useMemo(() => {
    return ownedNFTs?.slice().sort((a, b) => {
      const nameA = a.metadata.name?.toLowerCase() ?? "";
      const nameB = b.metadata.name?.toLowerCase() ?? "";
      return nameA.localeCompare(nameB);
    });
  }, [ownedNFTs]);

  return (
    <Box w="full" px={{ lg: "50px", base: "20px" }}>
      <Flex direction={{ lg: "row", md: "column", sm: "column" }} gap="10" mt="20px">
        <Img
          src={ensAvatar ?? blo(address as `0x${string}`)}
          w={{ lg: 150, base: 100 }}
          rounded="8px"
        />
        <Box my="auto">
          <Heading>{ensName ? ensName : shortenAddress(address)}</Heading>
          <Text color="gray">{ensName ? shortenAddress(address) : ""}</Text>
        </Box>
      </Flex>

      <Flex direction={{ lg: "row", base: "column" }} gap="10" mt="20px">
        <ProfileMenu
          selectedCollection={selectedCollection}
          setSelectedCollection={setSelectedCollection}
        />
        {isLoadingOwnedNFTs ? (
          <Box>
            <Text>Loading...</Text>
          </Box>
        ) : ownedNFTsError ? (
          <Box>
            <Text>Error loading NFTs. Please try again later.</Text>
          </Box>
        ) : (
          <Box w="full">
            <Flex direction="row" justifyContent="space-between" px="12px">
              <Tabs
                variant="unstyled"
                onChange={(index: number) => setTabIndex(index)}
                isLazy
                defaultIndex={0}
              >
                <TabList>
                  <Tab
                    _selected={{
                      bg: "transparent",
                      border: "1px solid #8b8b8b",
                      color: "white",
                    }}
                    _hover={{
                      cursor: "pointer",
                      color: "white",
                      border: "1px solid #8b8b8b",
                    }}
                    _focus={{
                      boxShadow: "none",
                    }}
                    color="gray.300"
                    borderRadius="999px"
                    px="25px"
                    height="35px"
                    mx="5px"
                    border={"1px solid #333333"}
                  >
                    Owned ({nftBalance?.toString() ?? "0"})
                  </Tab>
                  <Tab
                    _selected={{
                      bg: "transparent",
                      border: "1px solid #8b8b8b",
                      color: "white",
                    }}
                    _hover={{
                      cursor: "pointer",
                      color: "white",
                      border: "1px solid #8b8b8b",
                    }}
                    _focus={{
                      boxShadow: "none",
                    }}
                    color="gray.300"
                    borderRadius="999px"
                    px="25px"
                    height="35px"
                    mx="5px"
                    border={"1px solid #333333"}
                  >
                    Listings ({listings.length || 0})
                  </Tab>
                </TabList>
              </Tabs>
            </Flex>
            <SimpleGrid columns={{ base: 2, md: 3, lg: 4, xl: 6, xxl: 8 }} spacing={4} p={4} w="full">
              {tabIndex === 0 ? (
                <>
                  {sortedOwnedNFTs && sortedOwnedNFTs.length > 0 ? (
                    sortedOwnedNFTs.map((item) => (
                      <OwnedItem
                        key={item.id.toString()}
                        nftCollection={contract}
                        nft={item}
                        listings={listings} 
                      />
                    ))
                  ) : (
                    <Box>
                      <Text>
                        {isYou
                          ? "You"
                          : ensName
                          ? ensName
                          : shortenAddress(address)}{" "}
                        {isYou ? "do" : "does"} not own any NFT in this collection
                      </Text>
                    </Box>
                  )}
                </>
              ) : (
                <>
                  {listings && listings.length > 0 ? (
                    listings.map((item) => (
                      <Box
                        key={item.id}
                        rounded="12px"
                        as={ChakraNextLink}
                        href={`/collection/${contract.chain.id}/${contract.address}/token/${item.asset.id.toString()}`}
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
                              src={item.asset.metadata.image}
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
                            {item.asset?.metadata?.name ?? "Unknown item"}
                          </Text>

                          <Flex justifyContent="space-between" alignItems="center" w="100%" mt="2">
                            <Box textAlign="left">
                              <Text color="gray.300">Listing Price</Text>
                              <Text fontWeight="bold" fontSize="lg" color="white">
                                {item.currencyValuePerToken.displayValue} {item.currencyValuePerToken.symbol === "ETH" ? "MELD" : item.currencyValuePerToken.symbol}
                              </Text>
                            </Box>
                            <Button
                              bg="transparent"
                              color="#00875a"
                              size="xs"
                              fontWeight="bold"
                              border="2px solid #00875a"
                              onClick={() => handleActiveButtonClick(item)}
                            >
                              ACTIVE
                            </Button>
                          </Flex>
                        </Flex>
                      </Box>
                    ))
                  ) : (
                    <Box>
                      You do not have any listing with this collection
                    </Box>
                  )}
                </>
              )}
            </SimpleGrid>
          </Box>
        )}
      </Flex>
    </Box>
  );
}