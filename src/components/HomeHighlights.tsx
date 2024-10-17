import { useEffect, useState, useRef } from "react";
import { Box, Text, Heading, Flex, Image, IconButton, Icon } from "@chakra-ui/react";
import { getNFTs as getNFTs1155 } from "thirdweb/extensions/erc1155";
import { ChakraNextLink } from '@/components/ChakraNextLink';
import { getNFTs as getNFTs721 } from "thirdweb/extensions/erc721";
import { useReadContract } from "thirdweb/react";
import "@/consts/customstyles.css";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { useMarketplaceContext } from "@/hooks/useMarketplaceContext";
import dynamic from "next/dynamic";
import { useActiveAccount } from "thirdweb/react";
import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import { FiMoreHorizontal } from "react-icons/fi";
const BuyNowButton = dynamic(() =>
  import("@/components/BuyNowButton").then((mod) => mod.default), {
    ssr: false,
  }
);

const PINATA_GATEWAY = "https://amethyst-total-sole-31.mypinata.cloud";
const PINATA_JWT = process.env.PINATA_JWT;

const convertIpfsToHttp = (ipfsUrl: string | undefined) => {
  if (!ipfsUrl) return '/Molder-01.jpg';
  
  if (ipfsUrl.startsWith('http://') || ipfsUrl.startsWith('https://')) {
    return ipfsUrl;
  }
  
  if (ipfsUrl.startsWith('data:')) {
    return ipfsUrl; // Return data URLs as-is
  }
  
  const cid = ipfsUrl.replace('ipfs://', '');
  const [extractedCid, ...filenameParts] = cid.split('/');
  const filename = filenameParts.join('/');
  
  // Use a different IPFS gateway or your custom proxy
  return `https://ipfs.io/ipfs/${extractedCid}/${filename}`;
};

const CustomArrow = ({ type, onClick, isEdge }: any) => {
  const pointer = type === "PREV" ? <ArrowBackIcon /> : <ArrowForwardIcon />;
  return (
    <IconButton
      aria-label="Arrow Button"
      onClick={onClick}
      isDisabled={isEdge}
      icon={pointer}
      bg="transparent"
      color="gray.500" 
      _hover={{ color: "gray.100", bg: "transparent" }} 
      size="xl"
      style={{ zIndex: 2 }} 
    />
  );
};
interface NFTItem {
  id: string;
  metadata: { name: string; image: string };
  asset?: { id: string; metadata: { name: string; image: string } };
  currencyValuePerToken?: { displayValue: string; symbol: string };
  startTimeInSeconds?: number;
}

interface HomeHighlightsProps {
  allValidListings: any[];
}

const NFT_CONTRACT = {
  address: "0x0307Cd59fe2Ac48C8573Fda134ed75E78bb94ECA",
  client: undefined,
  chain: {
    id: "222000222",
    rpc: "https://testnet-rpc.meld.com",
  },
  title: "Galactic Eyes",
  thumbnailUrl: "https://videocolour.art/assets/img/portfolio/gifs/GALACTIC-EYE-160-web-v5.gif",
  type: "ERC721",
};

// Add this custom icon component
const MoreVerticalIcon = (props: any) => (
  <Icon viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
    />
  </Icon>
);

export default function HomeHighlights({ allValidListings }: HomeHighlightsProps) {
  const { nftContract, type, supplyInfo, listingsInSelectedCollection } = useMarketplaceContext();
  const [nftListings, setNftListings] = useState<NFTItem[]>([]);
  const account = useActiveAccount(); 
  const carouselRef = useRef<any>(null); 
  const swiperRef = useRef<any>();

  const startTokenId = supplyInfo?.startTokenId ?? 0n;
  const totalItems: bigint = supplyInfo ? supplyInfo.endTokenId - supplyInfo.startTokenId + 1n : 0n;

  const { data: allNFTs } = useReadContract(
    type === "ERC1155" ? getNFTs1155 : getNFTs721,
    {
      contract: nftContract,
      start: Number(startTokenId),
      count: 40,
    }
  );

  useEffect(() => {
    fetchNFTs();
  }, [allNFTs, listingsInSelectedCollection, nftContract]);

  const fetchNFTs = async () => {
    if (!allNFTs) return;
    let mergedNfts: NFTItem[] = [];

    if (listingsInSelectedCollection.length === 0) {
      mergedNfts = allNFTs.map((nft: any) => ({
        id: nft.id.toString(),
        metadata: nft.metadata,
        asset: { id: nft.id.toString(), metadata: nft.metadata },
      }));
    } else {
      mergedNfts = allNFTs.map((nft: any) => {
        const nftId = nft.id.toString();
        const listing = listingsInSelectedCollection.find(
          (listing: any) => listing.tokenId.toString() === nftId
        );

        return listing
          ? {
              id: nftId,
              metadata: nft.metadata,
              asset: { id: nftId, metadata: nft.metadata },
              currencyValuePerToken: listing.currencyValuePerToken,
              startTimeInSeconds: Number(listing.startTimeInSeconds), 
            }
          : {
              id: nftId,
              metadata: nft.metadata,
              asset: { id: nftId, metadata: nft.metadata },
            };
      });
    }

    mergedNfts.sort((a, b) => (b.startTimeInSeconds || 0) - (a.startTimeInSeconds || 0));
    setNftListings(mergedNfts);
  };

  if (nftListings.length === 0) {
    return (
      <Box mt="40px" textAlign="center" position="relative" maxWidth="2400px" marginX="auto">
        <Heading mb="40px">Galactic Vision</Heading>
        {allNFTs ? <Text>No NFTs found in this collection</Text> : <Text></Text>}
      </Box>
    );
  }
  const maxItemsToShow = Math.min(nftListings.length, 7);

  const slidesPerView = 3; // Number of slides to move at once

  return (
    <Box mt="60px" textAlign="left" position="relative" className="custom-carousel">
      <Heading mb="30px">
        <ChakraNextLink
          href={`/collection/${nftContract.chain.id}/${nftContract.address}`}
          color="white"
          fontWeight="bold"
          _hover={{ color: "red.500", textDecoration: "none" }} 
          transition="all 0.2s ease-in-out"
        >
          {(nftContract as any).title || "Galactic Vision"}
        </ChakraNextLink>
      </Heading>
      <Box
        borderTop="1px solid"
        borderColor="rgb(222, 222, 222, 0.1)"
        marginBottom="25px"
        paddingTop="30px"
        mt="0px"
        mb="25px"
        position="relative"
        overflow="visible"
      >
        <Box position="relative" mx="60px" py="60px"> {/* Increased vertical padding */}
          <Swiper
            modules={[Navigation]}
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
            }}
            spaceBetween={0}
            slidesPerGroup={slidesPerView}
            breakpoints={{
              1: { slidesPerView: 2, spaceBetween: 5, slidesPerGroup: 2 },
              750: { slidesPerView: 3, spaceBetween: 5, slidesPerGroup: 3 },
              980: { slidesPerView: 4, spaceBetween: 10, slidesPerGroup: 3 },
              1200: { slidesPerView: 5, spaceBetween: 10, slidesPerGroup: 3 },
              1600: { slidesPerView: 6, spaceBetween: 10, slidesPerGroup: 3 },
              1800: { slidesPerView: 7, spaceBetween: 10, slidesPerGroup: 3 },
              2100: { slidesPerView: 8, spaceBetween: 10, slidesPerGroup: 3 }
            }}
            className="custom-swiper"
          >
            {nftListings.map((nft, index) => (
              <SwiperSlide key={index}>
                <Box
                  position="relative"
                  width="100%"
                  height="380px" // Increased height to accommodate hover effect
                  overflow="visible"
                  padding="6px 6px" // Added padding to create space for hover effect
                >
                  <Box
                    rounded="12px"
                    bg="rgba(28, 28, 28, 0.6)"
                    border="1px solid rgb(222, 222, 222, 0.1)"
                    p="15px"
                    width="100%"
                    height="340px"
                    _hover={{ 
                      boxShadow: "0 6px 15px rgba(0, 0, 0, 0.2)", 
                      transform: "scale(1.04)",
                      zIndex: 10,
                    }}
                    transition="all 0.2s ease-in-out"
                    display="flex"
                    flexDirection="column"
                  >
                    <ChakraNextLink href={`/collection/${nftContract.chain.id}/${nftContract.address}/token/${nft.id}`} _hover={{ textDecoration: "none" }} flex="1">
                      <Flex direction="column" height="100%">
                        <Box
                          width="105%"
                          transform="translate(-4.5px, -3.8px)"
                          height="200px"
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          overflow="hidden"
                          borderRadius="8px"
                        >
                          <Image 
                            src={convertIpfsToHttp(nft.metadata.image)}
                            alt={nft.metadata.name || `NFT #${nft.id}`} 
                            objectFit="cover"
                            
                            width="100%"
                            height="100%"
                            fallbackSrc="/Molder-01.jpg"
                            onError={(e: any) => {
                              const target = e.target as HTMLImageElement;
                              console.error('Image load error:', target.src, 'NFT ID:', nft.id);
                              target.onerror = null;
                              target.src = '/Molder-01.jpg';
                            }}
                          />
                        </Box>
                        <Flex justifyContent="space-between" alignItems="center" mt="10px" width="100%" px="0">
                          <Heading 
                            as="h3" 
                            fontSize="xl" 
                            color="white" 
                            textAlign="left" 
                            isTruncated 
                            maxWidth="80%" 
                            pl="2" 
                            transform="translatex(-4px)"
                          >
                            {nft.metadata.name}
                          </Heading>
                          <IconButton
                            aria-label="Options"
                            icon={<Icon as={FiMoreHorizontal} />}
                            size="sm"
                            transform="translatex(12px)"
                            variant="ghost"
                            color="gray.300"
                            _hover={{ color: "white" }}
                            mr="2"
                          />
                        </Flex>
                      </Flex>
                    </ChakraNextLink>
                    <Flex justifyContent="space-between" 
                    alignItems="center" 
                    w="108%" 
                    mt="auto" 
                    transform="translateX(-7.8px)"  
                    border="1px solid rgb(222, 222, 222, 0.02)" 
                    borderRadius="12px" 
                    p="12px" 
                    mb="-8px"
                    bg="rgb(40, 40, 40, 0.8)"
                    >
                    
                      <Box>
                        
                        <Text color="gray.300" fontSize="sm">Price</Text>
                        {nft.currencyValuePerToken ? (
                          <Text fontWeight="bold" fontSize="md" color="white">
                            {nft.currencyValuePerToken.displayValue} {nft.currencyValuePerToken.symbol === "ETH" ? "MELD" : nft.currencyValuePerToken.symbol}
                          </Text>
                        ) : (
                          <Text fontWeight="bold" fontSize="md" color="gray.500">
                            Not Listed
                          </Text>
                        )}
                      </Box>
                      {listingsInSelectedCollection.find((listing: any) => listing.tokenId.toString() === nft.id.toString()) && (
                        <Box>
                          {account && (
                            <BuyNowButton
                              listing={listingsInSelectedCollection.find((listing: any) => listing.tokenId.toString() === nft.id.toString())!}
                              account={account}
                            />
                          )}
                        </Box>
                      )}
                    </Flex>
                  </Box>
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
          <IconButton
            aria-label="Previous"
            icon={<ArrowBackIcon />}
            position="absolute"
            left="-50px"
            top="50%"
            transform="translateY(-50%)"
            zIndex="2"
            bg="rgba(0, 0, 0, 0)"
            color="white"
            _hover={{ bg: "rgba(0, 0, 0, 0.2)" }}
            onClick={() => swiperRef.current?.slidePrev()}
          />
          <IconButton
            aria-label="Next"
            icon={<ArrowForwardIcon />}
            position="absolute"
            right="-50px"
            top="50%"
            transform="translateY(-50%)"
            zIndex="2"
            bg="rgba(0, 0, 0, 0)"
            color="white"
            _hover={{ bg: "rgba(0, 0, 0, 0.2)" }}
            onClick={() => swiperRef.current?.slideNext()}
          />
        </Box>
      </Box>
    </Box>
  );
}
