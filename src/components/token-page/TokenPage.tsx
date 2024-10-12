import {
  Box,
  Flex,
  Heading,
  Text,
  Avatar,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Link,
  Card,
  SimpleGrid,
  Tabs,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
} from "@chakra-ui/react";
import { balanceOf, getNFT as getERC1155 } from "thirdweb/extensions/erc1155";
import { getNFT as getERC721 } from "thirdweb/extensions/erc721";
import {
  MediaRenderer,
  useActiveAccount,
  useReadContract,
 ThirdwebProvider,
} from "thirdweb/react";
import { getAllListings, getAllOffers, makeOffer, buyFromListing } from "thirdweb/extensions/marketplace";
import { useMarketplaceContext } from "@/hooks/useMarketplaceContext";
import dynamic from "next/dynamic";
import RelatedListings from "./RelatedListings";
import { NftDetails } from "./NftDetails";
import { NFT_CONTRACTS } from "@/consts/nft_contracts";
import { useState, useEffect } from "react";
import { MakeOffer } from "./MakeOffer";
import { MARKETPLACE_CONTRACTS, NETWORK } from "@/consts/marketplace_contract";
import { useGetENSAvatar } from "@/hooks/useGetENSAvatar";
import { useGetENSName } from "@/hooks/useGetENSName";
import { blo } from "blo";
import React from 'react';
import { shortenAddress } from "thirdweb/utils";
import { CreateListing } from "./CreateListing";
import { Offer as ThirdwebOffer } from "thirdweb/extensions/marketplace";
import { DirectListing } from "thirdweb/extensions/marketplace";
const CancelListingButton = dynamic(() => import("./CancelListingButton"), {
  ssr: false,
});
const BuyFromListingButton = dynamic(() => import("./BuyFromListingButton"), {
  ssr: false,
});

type Props = {
  tokenId: bigint;
};

export function Token(props: Props) {
  return (
    <ThirdwebProvider >
      <TokenContent {...props} />
    </ThirdwebProvider>
  );
}

// Define a basic type for contract options if not available
interface ContractOptions {
  client: any;
  address: string;
  chain: string | Readonly<{ rpc: string; id: number }>;
}

// Define types for your parameters
interface ListingParams {
  contract: ContractOptions;
  // Add other properties as needed
}

interface Offer extends ThirdwebOffer {
  offeror: string; // Ensure this is a valid property
}

// Fetch all listings
async function fetchListings(params: ListingParams) {
  try {
    const listings = await getAllListings({
      contract: {
        ...params.contract,
        chain: params.contract.chain as unknown as Readonly<{ rpc: string; id: number }>
      },
      start: Number(0n), // Change to BigInt
      count: 100n // Change to BigInt
    });
    console.log("Listings:", listings);
    return listings;
  } catch (error) {
    console.error("Error fetching listings:", error);
    return [];
  }
}

// Fetch all offers for a specific listing
async function fetchOffers(params: { contract: ContractOptions; listingId: string }) {
  try {
    const offers = await getAllOffers({
      contract: {
        ...params.contract,
        chain: params.contract.chain as unknown as Readonly<{ rpc: string; id: number }>
      },
    });
    console.log("Offers:", offers);
    return offers;
  } catch (error) {
    console.error("Error fetching offers:", error);
    return [];
  }
}

// Make an offer on a listing
async function createOffer(params: ListingParams, listingId: string, offerDetails: any) {
  try {
    const offer = await makeOffer({ ...params, listingId, ...offerDetails });
    console.log("Offer made:", offer);
    return offer;
  } catch (error) {
    console.error("Error making offer:", error);
  }
}

// Buy from a listing
async function purchaseFromListing(params: ListingParams, listingId: string, quantity: number, recipient: string) {
  try {
    const transaction = await buyFromListing({
      contract: {
        ...params.contract,
        chain: params.contract.chain as unknown as Readonly<{ rpc: string; id: number }>
      },
      listingId: BigInt(listingId),
      quantity: BigInt(quantity),
      recipient: recipient // Add this line
    });
    console.log("Purchase successful:", transaction);
    return transaction;
  } catch (error) {
    console.error("Error purchasing from listing:", error);
  }
}

function TokenContent(props: Props) {
  const { tokenId } = props;
  const [listingsData, setListingsData] = useState<DirectListing[]>([]);
  const [offersData, setOffersData] = useState<Offer[]>([]);

  const {
    type,
    nftContract,
    isLoading,
    contractMetadata,
    listingsInSelectedCollection,
  } = useMarketplaceContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const account = useActiveAccount();
  const [isImageLoading, setIsImageLoading] = useState(true);

  const address = account?.address ?? "";
  const { data: ensName } = useGetENSName({ address });
  const { data: ensAvatar } = useGetENSAvatar({ ensName });

  const { data: nft, isLoading: isLoadingNFT } = useReadContract(
    type === "ERC1155" ? getERC1155 : getERC721,
    {
      tokenId: BigInt(tokenId),
      contract: nftContract,
      includeOwner: true,
    }
  );

  const { data: ownedQuantity1155 } = useReadContract(balanceOf, {
    contract: nftContract,
    owner: account?.address!,
    tokenId: tokenId,
    queryOptions: {
      enabled: !!account?.address && type === "ERC1155",
    },
  });

  const listings = (listingsInSelectedCollection || []).filter(
    (item) =>
      item.assetContractAddress.toLowerCase() ===
      nftContract.address.toLowerCase() && item.asset.id === BigInt(tokenId)
  );

  console.log("Listings:", listings);
  console.log("First Listing ID:", listings[0]?.id);

  const ownedByYou =
    nft?.owner?.toLowerCase() === account?.address.toLowerCase();

  const userHasActiveListing = listings.some(
    (listing) =>
      listing.creatorAddress.toLowerCase() === account?.address.toLowerCase()
  );

  const matchingContract = NFT_CONTRACTS.find(
    (item) => item.address.toLowerCase() === nftContract.address.toLowerCase()
  );

  const thumbnailImage =
    matchingContract?.thumbnailUrl ||
    (contractMetadata?.image?.startsWith("ipfs://")
      ? contractMetadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")
      : contractMetadata?.image);

  const { data: offers, isLoading: offersLoading, error: offersError } = useMarketplaceOffers(
    MARKETPLACE_CONTRACTS,
    listings[0]?.id ?? ""
  );

  const validOffers = MARKETPLACE_CONTRACTS && listings[0]?.id ? offers : undefined;
  const validOffersLoading = MARKETPLACE_CONTRACTS && listings[0]?.id ? offersLoading : false;
  const validOffersError = MARKETPLACE_CONTRACTS && listings[0]?.id ? offersError : null;

  console.log("Offers:", validOffers);
  console.log("Offers Loading:", validOffersLoading);
  console.log("Offers Error:", validOffersError);

  useEffect(() => {
    async function fetchData() {
      const params: ListingParams = {
        contract: {
          address: MARKETPLACE_CONTRACTS[0].address,
          chain: {
            rpc: NETWORK.rpc,
            id: NETWORK.id
          },
          client: undefined
        },
      };

      const fetchedListings = await fetchListings(params);
      setListingsData(fetchedListings);

      const fetchedOffers = await fetchOffers({ 
        contract: params.contract, 
        listingId: fetchedListings[0]?.id.toString() ?? "" 
      });
      setOffersData(fetchedOffers as Offer[]);
    }

    fetchData();
  }, []);

  return (
    <Flex
      direction="column"
      mt={{ base: "80px", md: "100px" }}
      mx="auto"
      width={{ base: "95%", md: "90%", lg: "80%" }}
      overflowX="hidden"
      minHeight={`calc(100vh - 100px)`}
      justifyContent="center"
    >
      <Flex
        direction={{ base: "column", md: "row" }}
        justifyContent="space-between"
        alignItems="flex-start"
        wrap="wrap"
        gap={{ base: "30px", md: "20px", lg: "40px" }}
        maxWidth="1840px"
        mx="auto"
        px={{ base: "20px", md: "100px", lg: "120px", xl: "200px", xxl: "250px" }}
        mb={{ base: "-100px", md: "0px", lg: "00px", xl: "40px", xxl: "150px" }}
      >
        {/* Left side: NFT Media */}
        <Box 
          w={{ base: "100%", md: "65%", lg: "70%" }}
          maxWidth={{ base: "100%", sm: "500px", md: "900px", lg: "1100px", xl: "1200px" }}
          flexGrow={1}
          mb={{ base: "40px", md: "0px" }}
          ml={{ base: "0", sm: "0px", md: "-55px" }}
          px={{ base: "0px", md: "0px" }}
          pl={{ base: "0px", md: "20px" }}
        >
          {nft?.metadata?.video && typeof nft?.metadata?.video === "string" ? (
            <video
              src={
                nft.metadata.video.startsWith("ipfs://")
                  ? nft.metadata.video.replace("ipfs://", "https://ipfs.io/ipfs/")
                  : nft.metadata.video
              }
              controls
              autoPlay
              loop
              muted
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "15px",
                maxHeight: "78vh",
                objectFit: "contain",
                filter: searchQuery && searchResults.length > 0 ? "blur(12px)" : "none",
              }}
            />
          ) : nft?.metadata?.animation_url && typeof nft?.metadata?.animation_url === "string" ? (
            <video
              src={
                nft.metadata.animation_url.startsWith("ipfs://")
                  ? nft.metadata.animation_url.replace("ipfs://", "https://ipfs.io/ipfs/")
                  : nft.metadata.animation_url
              }
              controls
              autoPlay
              loop
              muted
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "15px",
                maxHeight: "78vh",
                objectFit: "contain",
                filter: searchQuery && searchResults.length > 0 ? "blur(12px)" : "none",
              }}
            />
          ) : (
            <img
              src={
                nft?.metadata?.image?.startsWith("ipfs://")
                  ? nft.metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/")
                  : nft?.metadata?.image
              }
              alt={nft?.metadata?.name ?? "NFT Media"}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "15px",
                maxHeight: "70vh",
                objectFit: "contain",
                filter: searchQuery && searchResults.length > 0 ? "blur(12px)" : "none",
              }}
            />
          )}
          <Box 
            position="absolute"
            top="-20px"
            left="50%"
            transform="translateX(-50%) scaleX(-1)"
            width="100%"
            height="auto"
            zIndex="-1"
            filter="blur(180px) contrast(1.5) saturate(1.5)"
            opacity="0.1"
          >
            <img
              src={thumbnailImage}
              alt="Background"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              onLoad={(e) => {
                (e.target as HTMLImageElement).src = `${thumbnailImage}#freeze`;
              }}
            />
          </Box>
          <Box mt="4">
            <Heading variant="h2" size="lg">
            </Heading>

            <Text>
              {nft?.metadata?.description ?? "No description available."}
            </Text>

            <Heading mt="4" variant="h2" size="lg">
              Attributes:
            </Heading>
            {Array.isArray(nft?.metadata?.attributes) ? (
              <SimpleGrid columns={4} spacing={2}>
                {nft.metadata.attributes.map((attribute: any, index: number) => (
                  <Card
                    key={index}
                    as={Flex}
                    flexDir="column"
                    gap={2}
                    py={2}
                    px={4}
                    bg={"transparent"}
                    border="1px"
                    borderColor="grey.500"
                    alignItems="center"
                    justifyContent="center"
                    _hover={{
                      bg: "rgba(0, 0, 0, 0.2)",
                      color: "white",
                    }}
                  >
                    <Text>
                      {attribute.trait_type}: {attribute.value}
                    </Text>
                  </Card>
                ))}
              </SimpleGrid>
            ) : (
              <Text>No attributes available.</Text>
            )}
          </Box>
          <Box mt="4">
            <Accordion allowToggle>
              <AccordionItem>
                <AccordionButton>
                  <Box as="h2" flex="1" textAlign="left">
                    NFT Details
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <NftDetails nft={nft} />
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </Box>
        </Box>

        <Box
          w={{ base: "90vw", sm: "75vw", md: "25%" }}
          maxWidth="400px"
          position={{ base: "static", md: "relative" }}
          ml={{ base: "35px", md: "20px" }}
          flexShrink={0}
          mb={{ base: "0px", md: "10px" }}
          p={{ base: "0px", md: "0px" }}
        >
          <Heading 
            ml={{ base: "500px", md: "350px" }} 
            size={{ base: "3xl", md: "lg", lg: "xl", xl: "2xl", "2xl": "2xl" }} 
            left={{ base: "-8px", md: "60px", lg: "50px", xl: "0px" }} 
            position="relative" 
            whiteSpace="nowrap"
            overflow="visible"
            textOverflow="ellipsis"
            mx={{ base: "10px", md: "-50px", lg: "-50px" }} 
            right="100px" 
            maxW="calc(100vw - 250px)"
            minW="300px"
            paddingRight="50px"
          >
            {nft?.metadata?.name}
          </Heading>

          <Flex
            mt="4"
            direction={{ base: "column", sm: "row" }}
            alignItems={{ base: "center", sm: "flex-start" }}
            gap={{ base: "15px", sm: "20px", md: "32px" }}
            flexWrap="wrap"
            textAlign={{ base: "center", sm: "left" }}
          >
            <Flex
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
              gap="20px"
              flexWrap={{ base: "nowrap", md: "nowrap" }}
            >
              <Flex alignItems="center" direction="row">
                <Avatar size="sm" src={thumbnailImage} name={contractMetadata?.name} mb={{ base: "10px", sm: "0px" }}
                    display={{ base: "block", md: "none", lg: "block" }} 
                />
                <Box ml="3">
                  <Text fontSize="sm" color="gray.500">
                    Collection
                  </Text>
                  <Link
                    href={`/collection/${nftContract.chain.id}/${nftContract.address}`}
                    fontSize={{base:"xl", sm: "xl", md: "md", lg: "md", xl:"2xl"}}
                    fontWeight="bold"
                    color="white"
                    whiteSpace="nowrap"
                    textOverflow="ellipsis"
                    overflow="hidden"
                    _hover={{ color: "red.500", textDecoration: "none" }}
                  >
                    {contractMetadata?.name ?? "Unknown Collection"}
                  </Link>
                </Box>
              </Flex>

              <Flex alignItems="center" direction="row">
                {address && (
                  <Avatar
                    size="sm"
                    src={ensAvatar ?? (nft && blo(nft.owner as `0x${string}`))}
                    name={ensName ?? shortenAddress(address)}
                    mb="0"
                    display={{ base: "block", md: "none", lg: "block", }} 
                  />
                )}
                <Box ml="3">
                  <Flex alignItems="center">
                    <Text fontSize="sm" color="gray.500">
                      Owner
                    </Text>
                    {ownedByYou && (
                      <Text fontSize="sm" color="gray" ml="2">
                        (You)
                      </Text>
                    )}
                  </Flex>
                  <Link
                    href={`https://meldscan.io/address/${nft?.owner}`}
                    fontSize={{base:"xl", sm: "xl", md: "md", lg: "md", xl:"2xl"}}
                    target="_blank"
                    rel="noopener noreferrer"
                    fontWeight="bold"
                    color="white"
                    whiteSpace="nowrap"
                    textOverflow="ellipsis"
                    overflow="hidden"
                    _hover={{ color: "red.500", textDecoration: "none" }}
                  >
                    {nft?.owner ? shortenAddress(nft.owner) : "Unknown"}
                  </Link>
                </Box>
              </Flex>
            </Flex>
          </Flex>

          {userHasActiveListing ? (
            <Box
              mt="4"
              p="4"
              borderRadius="md"
              textAlign="center"
              style={{
                backdropFilter: "blur(1px)",
              }}
            >
            </Box>
          ) : (
            <Box mt="4" p="4" border="none">
              {account &&
                nft &&
                (ownedByYou || (ownedQuantity1155 && ownedQuantity1155 > 0n)) && (
                  <CreateListing tokenId={nft?.id} account={account} />
                )}

              {!ownedByYou && nft?.id && account && (
                <Box mt="8">
                  <MakeOffer
                    tokenId={tokenId}
                    account={account}
                    listingId={listings[0]?.id.toString() ?? ""}
                    marketplace={MARKETPLACE_CONTRACTS}
                    listingType={listings[0]?.type}
                  />
                </Box>
              )}
            </Box>
          )}

          <Box
            w={{ base: "100vw", sm : "80vw", md: "38vw", lg: "32vw", xl: "25vw" }}
            mx="-27px"
            mt="30px"
          >
            <Tabs variant="unstyled">
              <TabList justifyContent="center" mb="4">
                <Tab
                  _selected={{
                    bg: "transparent",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "24px",
                    color: "white",
                    boxShadow: "none",
                    transform: "scale(1)",
                  }}
                  _hover={{
                    bg: "rgba(0, 0, 0, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "24px",
                    color: "white",
                    boxShadow: "none",
                    transform: "scale(1)",
                  }}
                  _focus={{
                    boxShadow: "none",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                  p="10px 15px"
                  transition="all 0.1s ease"
                  border="1px solid transparent"
                  whiteSpace="nowrap"
                  mx="-37px"
                >
                  Listings & Offers
                </Tab>
                <Tab
                  _selected={{
                    bg: "transparent",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "24px",
                    color: "white",
                    boxShadow: "none",
                    transform: "scale(1)",
                  }}
                  _hover={{
                    bg: "rgba(0, 0, 0, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "24px",
                    color: "white",
                    boxShadow: "none",
                    transform: "scale(1)",
                  }}
                  _focus={{ boxShadow: "none", border: "1px solid rgba(255, 255, 255, 0.2)" }}
                  p="10px 24px"
                  transition="all 0.1s ease"
                  border="1px solid transparent"
                  mx="47px"
                >
                  Activity
                </Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  {listings.length > 0 ? (
                    <TableContainer
                      w="85%"
                      overflowX="auto"
                      mt="4"
                    >
                      <Table
                        variant="simple"
                        size="sm"
                        sx={{
                          tableLayout: "fixed",
                          width: "100%",
                          'td, th': {
                            border: "none",
                            textAlign: "left",
                            fontSize: "1rem",
                            padding: "16px",
                          },
                          'tr': {
                            borderBottom: "none",
                          },
                        }}
                      >
                        <Thead>
                          <Tr>
                            <Th color="white">Price</Th>
                            <Th color="white" />
                            {type === "ERC1155" && <Th color="white">Qty</Th>}
                            <Th sx={{ width: "20%", fontSize: "1rem" }} color="white">
                              From
                            </Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {listings.map((item, index) => {
                            const listedByYou =
                              item.creatorAddress.toLowerCase() === account?.address.toLowerCase();
                            return (
                              <Tr key={item.id.toString()} borderBottom={index === listings.length - 1 ? "none" : "none"}>
                                <Td
                                  sx={{
                                    fontWeight: "bold",
                                    fontSize: "1rem",
                                    color: "white",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    maxWidth: "150px",
                                  }}
                                >
                                  {item.currencyValuePerToken.displayValue} {item.currencyValuePerToken.symbol === "ETH" ? "MELD" : item.currencyValuePerToken.symbol}
                                </Td>
                                <Td sx={{ textAlign: "center", width: "50px" }}>
                                  {account && listedByYou ? (
                                    <CancelListingButton account={account} listingId={item.id} />
                                  ) : account ? (
                                    <BuyFromListingButton account={account} listing={item} />
                                  ) : null}
                                </Td>
                                {type === "ERC1155" && <Td sx={{ color: "#d7d7d7" }}>{item.quantity.toString()}</Td>}
                                <Td sx={{ fontSize: "0.9rem", color: "#d7d7d7", whiteSpace: "nowrap" }}>
                                  {listedByYou ? "You" : shortenAddress(item.creatorAddress)}
                                </Td>
                              </Tr>
                            );
                          })}
                          {listings.map((listing) => (
                            <ListingItem
                              key={listing.id}
                              listing={listing}
                              marketplaceContract={MARKETPLACE_CONTRACTS as any}                            />
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Text color="#d7d7d7" textAlign="left" mx={{ base: "20px", sm : "80px", md: "30px", lg: "44px", xl: "66px" }}>
                      There are no active listings or offers
                    </Text>
                  )}
                </TabPanel>
                <TabPanel>
                  <TableContainer
                    borderRadius="12px"
                    w="100%"
                    mt="4"
                  >
                    <Table
                      variant="simple"
                      size="sm"
                      sx={{
                        tableLayout: "fixed",
                        width: "100%",
                        'td, th': {
                          border: "none",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                        },
                        'tr': {
                          borderBottom: "none",
                        },
                      }}
                    >
                      <Thead>
                        <Tr>
                          <Th color="white">Event</Th>
                          <Th color="white">Price</Th>
                          <Th color="white">From</Th>
                          <Th color="white">To</Th>
                          <Th sx={{ width: "20%", fontSize: "1rem" }} color="white">Date</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                      </Tbody>
                    </Table>
                  </TableContainer>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </Box>
      </Flex>


      <Box mt="4" ml="80px">
        <Heading size="md">Offers</Heading>
        {validOffersLoading ? (
          <Text>Loading offers...</Text>
        ) : validOffersError ? (
          <Text>Error loading offers</Text>
        ) : validOffers && validOffers.length > 0 ? (
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Offer ID</Th>
                  <Th>Price</Th>
                  <Th>From</Th>
                </Tr>
              </Thead>
              <Tbody>
                { offers?.map((offer: Offer) => (
                  <Tr key={offer.id.toString()}>
                    <Td>{offer.id.toString()}</Td>
                    <Td>{offer.totalPrice.toString()}</Td>
                    <Td>{shortenAddress(offer.offeror)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        ) : (
          <Text>No offers available for this listing.</Text>
        )}
      </Box>
      <Box width="100%" mt="270px" flexGrow={1} mb="15px">
        <RelatedListings excludedListingId={listings[0]?.id ?? -1n} />
      </Box>

    </Flex>
  );
}

function getExpiration(endTimeInSeconds: bigint) {
  const milliseconds: bigint = endTimeInSeconds * 1000n;
  const futureDate = new Date(Number(milliseconds));
  return futureDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface MarketplaceContract {
  address: string;
  chain: string;
  client: any; // Replace 'any' with the correct type if known
  // Add other relevant properties
}

interface ListingItemProps {
  listing: any;
  marketplaceContract: MarketplaceContract;
}
const ListingItem: React.FC<ListingItemProps> = React.memo(({ listing, marketplaceContract }) => {
  const { data: offers, isLoading, error } = useMarketplaceOffers([{
    ...marketplaceContract,
    // Ensure address and chain are not overwritten
    address: marketplaceContract.address,
    chain: marketplaceContract.chain as unknown as import("thirdweb").Chain,
  }], listing.id);

  if (isLoading) return <Tr><Td colSpan={3}>Loading offers...</Td></Tr>;
  if (error) return <Tr><Td colSpan={3}>Error loading offers</Td></Tr>;

  return offers?.map((offer: Offer) => (
    <Tr key={offer.id.toString()}>
      <Td>
        {/* Render offer details */}
        {(offer as Offer).offeror && shortenAddress((offer as Offer).offeror)}
      </Td>
    </Tr>
  ));
});

function useMarketplaceOffers(MARKETPLACE_CONTRACTS: { [x: string]: any; address: string; chain: import("thirdweb").Chain; }[], listingId: bigint): { data: any; isLoading: boolean; error: any; } {
  // Implement the function logic here
  return {
    data: null,
    isLoading: false,
    error: null
  };
}
