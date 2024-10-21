"use client";

import { MediaRenderer, useReadContract, useActiveAccount } from "thirdweb/react";
import { getNFTs as getNFTs1155 } from "thirdweb/extensions/erc1155";
import { getNFTs as getNFTs721 } from "thirdweb/extensions/erc721";
import { client } from "@/consts/client";
import { Box, Flex, Heading, Text, Input, SimpleGrid, useBreakpointValue, Button, Avatar, Link } from "@chakra-ui/react";
import { useState, useEffect } from "react";
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

export function Collection({ chainId, contractAddress }: CollectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    type,
    nftContract,
    isLoading,
    listingsInSelectedCollection,
    supplyInfo,
    allValidListings,
    marketplaceContract,
  } = useMarketplaceContext();
  const account = useActiveAccount();

  const [itemsPerPage] = useState<number>(20); // Explicitly set to 20 NFTs per page
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);

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
      start: pages[currentPageIndex]?.start ?? 0,
      count: pages[currentPageIndex]?.count ?? 0,
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
  const columns = useBreakpointValue({
    base: 2,
    sm: Math.min(len, 2),
    md: Math.min(len, 4),
    lg: Math.min(len, 5),
    xl: Math.min(len, 6),
    xxl: Math.min(len, 8),

  });

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
          <Flex justifyContent="center" alignItems="center" mt="10px" px="10px" width="100%">
            <Input
              placeholder="Search NFTs"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              width="100%"
              maxW={`calc(${columns} * 275px + ${columns - 1} * 10px)`} // Adjust based on your NFT card width and gap
              bg="rgba(30,30,30,0.7)"
              border="1px solid rgb(222, 222, 222, 0.1)"
            />
          </Flex>

          <SimpleGrid 
            columns={columns} 
            spacing={-2.4}
            p={2}
            mx="auto" 
            mt="-10px"
            sx={{
              '& > *': {
                marginBottom: '-28px',
              }
            }}
          >
            {combinedNFTs.length > 0 ? (
              combinedNFTs.map((item, index) => {
                const isListing = 'currencyValuePerToken' in item;
                const nftData = isListing ? item.asset : item;
                return (
                  <NFTCard
                    key={`${nftData.id.toString()}-${index}`}
                    nft={{
                      id: nftData.id.toString(),
                      metadata: {
                        name: nftData.metadata?.name || "",
                        image: nftData.metadata?.image || "",
                      },
                      owner: nftData.owner,
                      tokenURI: nftData.tokenURI,
                      type: nftData.type,
                    }}
                    nftContract={nftContract}
                    account={account}
                    listingsInSelectedCollection={listingsInSelectedCollection}
                    convertIpfsToHttp={convertIpfsToHttp}
                    activeWallet={account}
                    price={isListing ? item.currencyValuePerToken.displayValue : undefined}
                    currencySymbol={isListing ? (item.currencyValuePerToken.symbol === "ETH" ? "MELD" : item.currencyValuePerToken.symbol) : undefined}
                  >
                    {isListing && account && (
                      <BuyNowButton
                        listing={item}
                        account={account}
                      />
                    )}
                  </NFTCard>
                );
              })
            ) : (
              <Box mx="auto">No NFTs found.</Box>
            )}
          </SimpleGrid>

          <Box
            mx="auto"
            maxW={{ base: "90vw", lg: "700px" }}
            mt="-20px" // Increased from 20px to 40px for more space
            mb="220px" // Added margin bottom for extra space above footer
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
        </Flex>
      </Box>
    </Box>
  );
}
