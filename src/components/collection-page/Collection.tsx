"use client";

import { MediaRenderer, useReadContract, useActiveAccount } from "thirdweb/react";
import { getNFTs as getNFTs1155 } from "thirdweb/extensions/erc1155";
import { getNFTs as getNFTs721 } from "thirdweb/extensions/erc721";
import { client } from "@/consts/client";
import { Box, Flex, Heading, Text, Input, SimpleGrid, useBreakpointValue, Button, Avatar, Link, Spinner } from "@chakra-ui/react";
import { useState, useEffect, useMemo } from "react";
import { useMarketplaceContext } from "@/hooks/useMarketplaceContext";
import { NFTCard } from "@/components/NFTCard";
import { convertIpfsToHttp } from "@/utils/ipfsUtils";
import dynamic from "next/dynamic";
import { MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight } from "react-icons/md";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import { NFT } from "thirdweb/dist/types/utils/nft/parseNft";
import { NFT_CONTRACTS } from "@/consts/nft_contracts";
import { NETWORK } from "@/consts/marketplace_contract";
import { getAllOwners } from "thirdweb/extensions/erc721";
import { ethers } from "ethers";
import { formatEther, formatUnits } from "ethers";
import { getAllListings } from "thirdweb/extensions/marketplace"; // Import the appropriate function
import { useInView } from 'react-intersection-observer';
import { keyframes } from "@emotion/react";
import { NFTCardSkeleton } from '../NFTCardSkeleton';
import { adaptNFTToNFTItem, NFTItem } from '@/utils/nftAdapter';

const BuyNowButton = dynamic(() =>
  import("../token-page/BuyNowButton").then((mod) => mod.default), {
    ssr: false,
  }
);

const fallbackImageUrl = "https://www.videocolour.art/assets/img/portfolio/gifs/X7-Pioneers-Teaser-Website-GIF-web-03.gif"; // Replace with your actual fallback image URL

export interface CollectionProps {
  chainId: string;
  contractAddress: string;
}

// Define the keyframes for the fade effect
const fadeInOut = keyframes`
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
`;

export function Collection({ chainId, contractAddress }: CollectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    type,
    nftContract,
    listingsInSelectedCollection,
    supplyInfo,
    allValidListings,
    marketplaceContract,
  } = useMarketplaceContext();
  const account = useActiveAccount();

  const [loadedNFTs, setLoadedNFTs] = useState<NFT[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [ref, inView] = useInView();
  const [currentPage, setCurrentPage] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isPreloading, setIsPreloading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const columns = useBreakpointValue({
    base: 2,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
    xxl: 7,
    xxxl: 8,
    xxxxl: 9,
  }) || 2;

  // Move itemsPerPage declaration here
  const itemsPerPage = useMemo(() => columns * 4, [columns]);

  const startTokenId = supplyInfo?.startTokenId ?? 0n;
  const totalItems: bigint = supplyInfo
    ? supplyInfo.endTokenId - supplyInfo.startTokenId + 1n
    : 0n;
  console.log("Total Items:", totalItems.toString());

  const numberOfPages: number = Number(
    (totalItems + BigInt(itemsPerPage) - 1n) / BigInt(itemsPerPage)
  );

  const pages: { start: number; count: number }[] = [];
  if (totalItems > 0n) {
    for (let i = 0; i < numberOfPages; i++) {
      const currentStartTokenId = startTokenId + BigInt(i * itemsPerPage);
      const remainingItems = totalItems - BigInt(i * itemsPerPage);
      const count =
        remainingItems < BigInt(itemsPerPage)
          ? Number(remainingItems)
          : itemsPerPage;
      pages.push({ start: Number(currentStartTokenId), count: count });
    }
  }

  const { data: allNFTs, error } = useReadContract(
    type === "ERC1155" ? getNFTs1155 : getNFTs721,
    {
      contract: nftContract,
      start: pages[0]?.start ?? 0,
      count: pages[0]?.count ?? 0,
    }
  );

  useEffect(() => {
    console.log("All NFTs from contract:", allNFTs);
    if (error) {
      console.error("Error fetching NFTs:", error);
    }
  }, [allNFTs, error]);

  const filteredListings = listingsInSelectedCollection?.filter((item) => {
    const name = item.asset?.metadata?.name?.toLowerCase() || "";
    return name.includes(searchQuery.toLowerCase());
  }) || [];

  const filteredNFTs = allNFTs?.filter((nft) => {
    const name = nft.metadata?.name?.toLowerCase() || "";
    return name.includes(searchQuery.toLowerCase());
  }) || [];

  const combinedNFTs = [...filteredListings, ...filteredNFTs];
  console.log("Combined NFTs:", combinedNFTs);

  const len = combinedNFTs.length;

  const [imageLoading, setImageLoading] = useState(true);
  const [contractMetadata, setContractMetadata] = useState<any>(null);

  const { data: contractURI } = useReadContract({
    contract: nftContract,
    method: "contractURI",
    params: [],
  });

  const { data: name } = useReadContract({
    contract: nftContract,
    method: "name",
    params: [],
  });

  const { data: symbol } = useReadContract({
    contract: nftContract,
    method: "symbol",
    params: [],
  });

  const { data: firstNFT } = useReadContract(
    type === "ERC1155" ? getNFTs1155 : getNFTs721,
    {
      contract: nftContract,
      start: 0,
      count: 1,
    }
  );

  const [nfts, setNfts] = useState<NFT[]>([]);

  useEffect(() => {
    const fetchNFTsAndListings = async () => {
      if (nftContract) {
        console.log("Fetching NFTs and listings...");
        const fetchedNFTs = await (type === "ERC1155" ? getNFTs1155 : getNFTs721)({
          contract: nftContract,
          start: 0,
          count: 100,
        });
        
        // Fetch active listings
        const activeListings = await getAllListings({ contract: marketplaceContract });
        
        // Combine NFT data with listing data
        const nftsWithListings = fetchedNFTs.map(nft => {
          const listing = activeListings.find(listing => listing.tokenId === nft.id);
          return {
            ...nft,
            listing: listing || null
          };
        });
        
        console.log("NFTs with listings:", nftsWithListings);
        setNfts(nftsWithListings);
      }
    };

    fetchNFTsAndListings();
  }, [nftContract, type, marketplaceContract]);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (typeof contractURI === 'string') {
        try {
          const response = await fetch(contractURI);
          const data = await response.json();
          console.log("Fetched contract metadata:", data);
          setContractMetadata(data);
        } catch (error) {
          console.error("Error fetching contract metadata:", error);
        }
      } else if (name && symbol) {
        setContractMetadata({
          name,
          symbol,
          image: fallbackImageUrl,
        });
      } else if (firstNFT && firstNFT.length > 0) {
        setContractMetadata({
          name: firstNFT[0].metadata.name || "Unknown Collection",
          image: firstNFT[0].metadata.image || fallbackImageUrl,
        });
      }
    };

    fetchMetadata();
  }, [contractURI, name, symbol, firstNFT]);

  const [collectionData, setCollectionData] = useState<any>(null);

  useEffect(() => {
    const fetchCollectionData = () => {
      const collectionInfo = NFT_CONTRACTS.find(
        (contract) => contract.address.toLowerCase() === contractAddress.toLowerCase()
      );
      setCollectionData(collectionInfo);
    };

    fetchCollectionData();
  }, [contractAddress]);

  const getImageUrl = (metadata: any) => {
    if (!metadata) return fallbackImageUrl;
    const imageSource = metadata.thumbnailUrl || metadata.image || metadata.image_url || metadata.imageUrl || metadata.image_data;
    if (!imageSource) return fallbackImageUrl;
    
    if (typeof imageSource === 'string' && imageSource.startsWith('ipfs://')) {
      return `https://ipfs.io/ipfs/${imageSource.slice(7)}`;
    }
    
    return imageSource;
  };

  useEffect(() => {
    console.log("nftContract:", nftContract);
    console.log("contractURI:", contractURI);
    console.log("name:", name);
    console.log("symbol:", symbol);
    console.log("NFTs:", nfts);
    console.log("Full Contract Metadata:", contractMetadata);
    console.log("Collection Data:", collectionData);
    const imageUrl = getImageUrl(collectionData || contractMetadata);
    console.log("Image URL:", imageUrl);
  }, [nftContract, contractURI, name, symbol, nfts, contractMetadata, collectionData]);

  console.log("Contract Metadata:", contractMetadata);
  console.log("Contract Image:", contractMetadata?.image);

  const [ownersCount, setOwnersCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchOwnersCount = async () => {
      console.log("Fetching owners count...");
      console.log("NFT Contract:", nftContract);
      console.log("Contract Type:", type);

      if (nftContract && type === "ERC721") {
        try {
          console.log("Fetching owners for ERC721...");
          const owners = await getAllOwners({ contract: nftContract });
          console.log("Raw owners data:", owners);
          
          // Extract unique owner addresses
          const uniqueOwners = new Set(owners.map(owner => owner.owner));
          const uniqueOwnersCount = uniqueOwners.size;
          
          console.log("Unique owners:", Array.from(uniqueOwners));
          console.log("Unique owners count:", uniqueOwnersCount);
          setOwnersCount(uniqueOwnersCount);
        } catch (error) {
          console.error("Error fetching ERC721 owners:", error);
        }
      } else if (nftContract && type === "ERC1155") {
        console.log("ERC1155 owner count not implemented yet");
        // Implement ERC1155 logic here if needed
      } else {
        console.log("Unable to fetch owners: Invalid contract or type");
      }
    };

    fetchOwnersCount();
  }, [nftContract, type]);

  const [floorPrice, setFloorPrice] = useState<string | null>(null);
  const [floorPriceCurrency, setFloorPriceCurrency] = useState<string | null>(null);

  const calculateFloorPrice = (listings: any[]) => {
    console.log("Calculating floor price for listings:", listings);
    if (!listings || listings.length === 0) {
      console.log("No listings available");
      return { price: null, currency: null, reason: "No listings available" };
    }

    let lowestPriceMELD = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"); // Max BigInt value
    let lowestPriceUSDT = BigInt(Number.MAX_SAFE_INTEGER);
    let hasMELDListing = false;
    let hasUSDTListing = false;

    listings.forEach(listing => {
      const price = BigInt(listing.pricePerToken.toString());
      const currency = listing.currencyValuePerToken.symbol;
      console.log(`Listing ${listing.id} price:`, price.toString(), currency);

      if (currency === "MELD" || currency === "ETH") {
        hasMELDListing = true;
        if (price < lowestPriceMELD) {
          lowestPriceMELD = price;
        }
      } else if (currency === "tUSDT" || currency === "USDT") {
        hasUSDTListing = true;
        if (price < lowestPriceUSDT) {
          lowestPriceUSDT = price;
        }
      }
    });

    console.log("Lowest MELD price:", lowestPriceMELD.toString());
    console.log("Lowest USDT price:", lowestPriceUSDT.toString());

    // Convert MELD to USDT for comparison
    const meldToUsdtRate = 0.013; // 1 MELD = 0.013 USDT
    const lowestMELDInUSDT = Number(formatEther(lowestPriceMELD)) * meldToUsdtRate;
    const lowestUSDTPrice = Number(formatUnits(lowestPriceUSDT, 6)); // Assuming 6 decimal places for USDT

    console.log("Lowest MELD price in USDT:", lowestMELDInUSDT);
    console.log("Lowest USDT price:", lowestUSDTPrice);

    if (hasMELDListing && (!hasUSDTListing || lowestMELDInUSDT < lowestUSDTPrice)) {
      return { 
        price: lowestPriceMELD.toString(), 
        currency: "MELD", 
        reason: null 
      };
    } else if (hasUSDTListing) {
      return { 
        price: lowestPriceUSDT.toString(), 
        currency: "tUSDT", 
        reason: null 
      };
    } else {
      return { 
        price: null, 
        currency: null, 
        reason: "No valid listings found" 
      };
    }
  };

  useEffect(() => {
    console.log("Listings updated:", listingsInSelectedCollection?.length);
    if (listingsInSelectedCollection && listingsInSelectedCollection.length > 0) {
      const { price, currency, reason } = calculateFloorPrice(listingsInSelectedCollection);
      console.log("Calculated floor price:", price, currency, "Reason:", reason);
      setFloorPrice(price);
      setFloorPriceCurrency(currency);
      if (reason) {
        console.warn("Floor price not set:", reason);
      }
    } else {
      setFloorPrice(null);
      setFloorPriceCurrency(null);
      console.warn("Floor price not set: No listings available");
    }
  }, [listingsInSelectedCollection]);

  useEffect(() => {
    console.log("Component rendered");
  }, []);

  useEffect(() => {
    console.log("All valid listings:", allValidListings);
  }, [allValidListings]);

  useEffect(() => {
    console.log("Updated listingsInSelectedCollection:", listingsInSelectedCollection);
  }, [listingsInSelectedCollection]);

  useEffect(() => {
    console.log("listingsInSelectedCollection:", listingsInSelectedCollection);
  }, [listingsInSelectedCollection]);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (nftContract && supplyInfo) {
        const totalNFTs = Number(supplyInfo.endTokenId) - Number(supplyInfo.startTokenId) + 1;
        const count = Math.min(itemsPerPage, totalNFTs);

        const newNFTs = await (type === "ERC1155" ? getNFTs1155 : getNFTs721)({
          contract: nftContract,
          start: 0,
          count,
        });

        setLoadedNFTs(newNFTs);
        setIsInitialLoad(false);

        if (newNFTs.length < totalNFTs) {
          setHasMore(true);
        } else {
          setHasMore(false);
        }
      }
    };

    if (isInitialLoad) {
      fetchNFTs();
    }
  }, [nftContract, type, itemsPerPage, supplyInfo, isInitialLoad]);

  useEffect(() => {
    const loadMoreNFTs = async () => {
      if (!hasMore || !nftContract || !supplyInfo || isLoadingMore) return;

      setIsLoadingMore(true);

      const totalNFTs = Number(supplyInfo.endTokenId) - Number(supplyInfo.startTokenId) + 1;
      const start = loadedNFTs.length;
      const remainingNFTs = totalNFTs - start;
      const count = Math.min(Math.floor(itemsPerPage * 0.75), remainingNFTs);

      if (count <= 0) {
        setHasMore(false);
        return;
      }

      const newNFTs = await (type === "ERC1155" ? getNFTs1155 : getNFTs721)({
        contract: nftContract,
        start,
        count,
      });

      if (newNFTs.length === 0) {
        setHasMore(false);
        return;
      }

      setLoadedNFTs(prev => [...prev, ...newNFTs]);
      setIsLoadingMore(false);

      if (loadedNFTs.length + newNFTs.length >= totalNFTs) {
        setHasMore(false);
      }
    };

    if (!isInitialLoad && inView && hasMore) {
      loadMoreNFTs();
    }
  }, [inView, hasMore, loadedNFTs.length, itemsPerPage, type, nftContract, isInitialLoad, supplyInfo, isLoadingMore]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (nftContract) {
        console.log("Fetching NFTs and listings...");
        const fetchedNFTs = await (type === "ERC1155" ? getNFTs1155 : getNFTs721)({
          contract: nftContract,
          start: 0,
          count: 100,
        });
        
        // Fetch active listings
        const activeListings = await getAllListings({ contract: marketplaceContract });
        
        // Combine NFT data with listing data
        const nftsWithListings = fetchedNFTs.map(nft => {
          const listing = activeListings.find(listing => listing.tokenId === nft.id);
          return {
            ...nft,
            listing: listing || null
          };
        });
        
        console.log("NFTs with listings:", nftsWithListings);
        setNfts(nftsWithListings);
      }
      setIsLoading(false);
    };

    fetchNFTs();
  }, [nftContract, type, marketplaceContract]);

  const [gridReady, setGridReady] = useState(false);
  const [allNFTsLoaded, setAllNFTsLoaded] = useState(false);

  useEffect(() => {
    if (columns) {
      setGridReady(true);
    }
  }, [columns]);

  useEffect(() => {
    if (loadedNFTs.length > 0 && loadedNFTs.length < itemsPerPage) {
      setAllNFTsLoaded(true);
    }
  }, [loadedNFTs, itemsPerPage]);

  const displayedNFTs = loadedNFTs.slice(0, itemsPerPage);
  const emptySlots = Math.max(0, itemsPerPage - displayedNFTs.length);

  return (
    <Box mt="0px" position="relative" width="100%" minHeight="100vh" overflowX="hidden" overflowY="hidden">
      <Flex direction="column" maxWidth="100vw" pt="20px">
        {/* Background image */}
        <Box
          borderRadius="20px"
          width="calc(100% - 40px)"  // Adjust width to account for margins
          height="300px"
          overflow="hidden"
          mb="20px"
          mx="auto"  // Center the background image
        >
          <MediaRenderer
            client={client}
            src={getImageUrl(collectionData || contractMetadata)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </Box>

        <Flex px="40px" gap="40px">  
          {/* Left side: Collection info */}
          <Box flex="1">
            {/* Collection title and creator info */}
            <Flex alignItems="center" mb="20px">
              <Box
                borderRadius="12px"
                width="220px"
                height="220px"
                overflow="hidden"
                mr="20px"
                boxShadow="0px 0px 10px 0px rgba(0, 0, 0, 0.5)"
                mt="-140px"
              >
                <MediaRenderer
                  client={client}
                  src={getImageUrl(collectionData || contractMetadata)}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>
              <Box>
                <Heading size="xl" mb="2">
                  {collectionData?.title || contractMetadata?.name || "Unknown collection"}
                </Heading>
                {collectionData?.name && (
                  <Flex alignItems="center">
                    <Avatar src={collectionData.avatarUrl} size="sm" mr="2" />
                    <Link 
                      href={collectionData?.profileUrl} 
                      isExternal 
                      fontSize="md"
                      fontWeight="bold"
                      color="gray.300"
                      _hover={{ color: "white", textDecoration: "none" }}
                      transition="color 0.2s ease"
                    >
                      by {collectionData.name}
                    </Link>
                  </Flex>
                )}
              </Box>
            </Flex>

            {/* Description */}
            {(collectionData?.description || contractMetadata?.description) && (
              <Text maxW="700px" mb="20px">
                {collectionData?.description || contractMetadata?.description}
              </Text>
            )}
          </Box>

          {/* Right side: Collection details */}
          <Box width="300px">
            <Box
              borderRadius="xl"
              border="1px solid"
              borderColor="whiteAlpha.300"
              bg="rgba(0, 0, 0, 0.05)"
              p={4}
              mt="5px"
            >
              <SimpleGrid columns={2} spacing={3}>
                <Text fontWeight="bold" color="whiteAlpha.700">Floor</Text>
                <Text color="whiteAlpha.900" textAlign="right">
                  {floorPrice && floorPriceCurrency
                    ? `${floorPriceCurrency === "MELD" 
                        ? Number(formatEther(BigInt(floorPrice))).toFixed(2)
                        : (Number(floorPrice) / 1000000).toFixed(2)
                      } ${floorPriceCurrency}`
                    : "—"}
                </Text>

                <Text fontWeight="bold" color="whiteAlpha.700">Items</Text>
                <Text color="whiteAlpha.900" textAlign="right">
                  {supplyInfo 
                    ? (Number(supplyInfo.endTokenId) - Number(supplyInfo.startTokenId) + 1).toLocaleString()
                    : "N/A"}
                </Text>

                <Text fontWeight="bold" color="whiteAlpha.700">Owners</Text>
                <Text color="whiteAlpha.900" textAlign="right">
                  {ownersCount !== null ? ownersCount.toLocaleString() : "Loading..."}
                </Text>

                <Text fontWeight="bold" color="whiteAlpha.700">Contract</Text>
                <Link 
                  href={NETWORK.blockExplorers && NETWORK.blockExplorers.length > 0
                    ? `${NETWORK.blockExplorers[0].url}/address/${contractAddress}`
                    : '#'}
                  isExternal
                  color="whiteAlpha.700"
                  textAlign="right"
                  display="block"
                  isTruncated
                  _hover={{ color: "white", textDecoration: "none" }}
                  transition="color 0.2s ease"
                >
                  {`${contractAddress.slice(0, 6)}...${contractAddress.slice(-4)}`}
                </Link>
              </SimpleGrid>
            </Box>
          </Box>
        </Flex>
      </Flex>

      {/* NFT grid */}
      <Box px="20px" mt="40px">  
        <Flex
          direction="column"
          gap="2"
          alignItems="center"
          maxWidth="100vw"
          pt="10px"
        >
          <Box
            position="absolute"
            top="0"
            left="0"
            width="100%"
            height="300px"
            zIndex="-1"
            overflow="hidden"
          >
            <MediaRenderer
              client={client}
              src={getImageUrl(contractMetadata)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "blur(180px) contrast(1.5) saturate(1.5)",
                opacity: 0.1,
              }}
            />
            {imageLoading && <Box>Loading...</Box>}
          </Box>

          {/* Updated search bar */}
          <Flex justifyContent="center" alignItems="center" mt="10px" width="100%">
            <Box width="100%" maxWidth="3400px" px="15px">
              <Input
                placeholder="Search NFTs"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                width="100%"
                bg="rgba(30,30,30,0.7)"
                border="1px solid rgb(222, 222, 222, 0.1)"
                _focus={{
                  outline: "none",
                  boxShadow: "none",
                  border: "1px solid rgb(222, 222, 222, 0.3)",
                }}
              />
            </Box>
          </Flex>

          {gridReady && (
            <SimpleGrid 
              columns={columns} 
              spacing={-2.4}
              p={2}
              mx="auto" 
              mt="-10px"
              sx={{
                '& > *': {
                  marginBottom: '1px',
                }
              }}
            >
              {isInitialLoad 
                ? Array(itemsPerPage).fill(0).map((_, index) => (
                    <NFTCardSkeleton key={index} />
                  ))
                : loadedNFTs.map((nft, index) => (
                    <NFTCard
                      key={`${nft.id.toString()}-${index}`}
                      nft={{
                        id: nft.id.toString(),
                        metadata: {
                          name: nft.metadata?.name || "",
                          image: nft.metadata?.image || "",
                        },
                        owner: nft.owner,
                        tokenURI: nft.tokenURI,
                        type: nft.type,
                      }}
                      nftContract={nftContract}
                      account={account}
                      listingsInSelectedCollection={listingsInSelectedCollection}
                      convertIpfsToHttp={convertIpfsToHttp}
                      activeWallet={account}
                    >
                      {/* ... existing BuyNowButton ... */}
                    </NFTCard>
                  ))
              }
              {isLoadingMore && Array(columns).fill(0).map((_, index) => (
                <NFTCardSkeleton key={`loading-${index}`} />
              ))}
            </SimpleGrid>
          )}

          {!isInitialLoad && hasMore && (
            <Box ref={ref} height="20px" mt="20px" mb="40px">
              {!isLoadingMore && (
                <Flex
                  alignItems="center"
                  justifyContent="center"
                >
                  <Spinner size="sm" mr={2} color="white" />
                  <Text color="white">Load More</Text>
                </Flex>
              )}
            </Box>
          )}
        </Flex>
      </Box>
    </Box>
  );
}
