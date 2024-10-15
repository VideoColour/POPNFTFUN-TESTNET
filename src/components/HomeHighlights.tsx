import { useEffect, useState, useRef } from "react";
import { Box, Text, Heading, Flex, Image, IconButton } from "@chakra-ui/react";
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
import { fetchWithRetry, fetchNFTMetadata } from "@/utils/ipfsFetcher";

const BuyNowButton = dynamic(() =>
  import("@/components/BuyNowButton").then((mod) => mod.default), {
    ssr: false,
  }
);

const convertIpfsToHttp = (ipfsUrl: string | undefined) => {
  if (!ipfsUrl) return '';
  if (ipfsUrl.startsWith('ipfs://')) {
    const gateways = [
      'https://ipfs.io/ipfs/',
      'https://gateway.pinata.cloud/ipfs/',
      'https://cloudflare-ipfs.com/ipfs/',
      'https://gateway.ipfs.io/ipfs/',
    ];
    const cid = ipfsUrl.slice(7);
    return gateways.map(gateway => `${gateway}${cid}`);
  }
  return [ipfsUrl];
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
    rpc: "https://222000222.rpc.thirdweb.com",
  },
  title: "Galactic Eyes",
  thumbnailUrl: "https://videocolour.art/assets/img/portfolio/gifs/GALACTIC-EYE-160-web-v5.gif",
  type: "ERC721",
};

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


  return (
    <Box mt="40px" textAlign="left" position="relative" className="custom-carousel">
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
        paddingTop="10px"
        mt="-20px"
        mb="25px"
        pt="10px"
        position="relative"
      >
        <Box position="relative" mx="60px"> {/* Increased margin for more space */}
          <Swiper
            modules={[Navigation]}
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
            }}
            spaceBetween={20}
            breakpoints={{
              1: { slidesPerView: 2, spaceBetween: 10 },
              750: { slidesPerView: 3, spaceBetween: 10 },
              980: { slidesPerView: 4, spaceBetween: 15 },
              1200: { slidesPerView: 5, spaceBetween: 20 },
              1600: { slidesPerView: 6, spaceBetween: 20 },
              1800: { slidesPerView: 7, spaceBetween: 20 },
              2100: { slidesPerView: 8, spaceBetween: 20 }
            }}
            className="custom-swiper"
          >
            {nftListings.map((nft, index) => (
              <SwiperSlide key={index}>
                <Box
                  rounded="12px"
                  bg="rgb(33, 33, 33, 0.8)"
                  border="1px solid rgb(222, 222, 222, 0.1)"
                  p="15px"
                  width="100%"
                  height="340px"
                  _hover={{ boxShadow: "0 6px 15px rgba(0, 0, 0, 0.2)", transform: "scale(1.035)" }}
                  transition="all 0.2s ease-in-out"
                  display="flex"
                  flexDirection="column"
                >
                  <ChakraNextLink href={`/collection/${nftContract.chain.id}/${nftContract.address}/token/${nft.id}`} _hover={{ textDecoration: "none" }} flex="1">
                    <Flex direction="column" height="100%">
                      <Image 
                        src={convertIpfsToHttp(nft.metadata.image)[0]} 
                        alt={nft.metadata.name} 
                        width="100%" 
                        height="190px" 
                        objectFit="cover" 
                        borderRadius="8px" 
                        fallbackSrc="/Molder-01.jpg"
                        onError={(e: { target: HTMLImageElement; }) => {
                          const img = e.target as HTMLImageElement;
                          const sources = convertIpfsToHttp(nft.metadata.image);
                          const nextSource = sources[sources.indexOf(img.src) + 1];
                          if (nextSource) {
                            img.src = nextSource;
                          } else {
                            img.src = "/Molder-01.jpg";
                          }
                        }}
                      />
                      <Text fontWeight="bold" fontSize="lg" mt="10px" color="white">
                        {nft.metadata.name}
                      </Text>
                    </Flex>
                  </ChakraNextLink>
                  <Flex justifyContent="space-between" alignItems="center" w="100%" mt="auto">
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
            bg="rgba(0, 0, 0, 0.5)"
            color="white"
            _hover={{ bg: "rgba(0, 0, 0, 0.7)" }}
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
            bg="rgba(0, 0, 0, 0.5)"
            color="white"
            _hover={{ bg: "rgba(0, 0, 0, 0.7)" }}
            onClick={() => swiperRef.current?.slideNext()}
          />
        </Box>
      </Box>
    </Box>
  );
}
