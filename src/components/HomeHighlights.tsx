import { useEffect, useState, useRef } from "react";
import { Box, Text, Heading, Flex, Image, IconButton, Spinner } from "@chakra-ui/react";
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
const BuyNowButton = dynamic(() =>
  import("@/components/BuyNowButton").then((mod) => mod.default), {
    ssr: false,
  }
);

const convertIpfsToHttp = (ipfsUrl: string | undefined) => {
  if (!ipfsUrl) return 'default-image-url.jpg'; // Provide a default image URL
  return ipfsUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
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

const NFTImage = ({ src, alt }: { src: string; alt: string }) => {
  const [error, setError] = useState(false);

  return (
    <Image
      src={error ? "/path/to/fallback-image.jpg" : src}
      alt={alt}
      width="100%"
      height="190px"
      objectFit="cover"
      borderRadius="8px"
      onError={() => setError(true)}
    />
  );
};

export default function HomeHighlights({ allValidListings }: HomeHighlightsProps) {
  const { nftContract, type, supplyInfo, listingsInSelectedCollection } = useMarketplaceContext();
  const [nftListings, setNftListings] = useState<NFTItem[]>([]);
  const account = useActiveAccount(); 
  const carouselRef = useRef<any>(null); 
  const swiperRef = useRef<any>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const fetchNFTs = async (retries = 3) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!allNFTs) return;
      const mergedNfts: NFTItem[] = allNFTs.map((nft: any) => {
        const nftId = nft.id.toString();
        const listing = listingsInSelectedCollection.find(
          (listing: any) => listing.tokenId.toString() === nftId
        );

        return {
          id: nftId,
          metadata: {
            name: nft.metadata.name || "Unknown Name",
            image: convertIpfsToHttp(nft.metadata.image),
          },
          asset: { id: nftId, metadata: nft.metadata },
          currencyValuePerToken: listing?.currencyValuePerToken,
          startTimeInSeconds: listing ? Number(listing.startTimeInSeconds) : undefined,
        };
      });

      mergedNfts.sort((a, b) => (b.startTimeInSeconds || 0) - (a.startTimeInSeconds || 0));
      setNftListings(mergedNfts);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      if (retries > 0) {
        console.log(`Retrying... (${retries} attempts left)`);
        setTimeout(() => fetchNFTs(retries - 1), 1000);
      } else {
        setError("Failed to fetch NFTs. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const useCachedNFTs = (nfts: NFTItem[]) => {
    const [cachedNFTs, setCachedNFTs] = useState<NFTItem[]>([]);

    useEffect(() => {
      if (nfts.length > 0) {
        setCachedNFTs(nfts);
      }
    }, [nfts]);

    return cachedNFTs.length > 0 ? cachedNFTs : nfts;
  };

  const cachedNFTListings = useCachedNFTs(nftListings);

  const LazyLoadImage = ({ src, alt }: { src: string; alt: string }) => {
    const [isVisible, setIsVisible] = useState(false);
    const imgRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        },
        { threshold: 0.1 }
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => {
        if (imgRef.current) {
          observer.unobserve(imgRef.current);
        }
      };
    }, []);

    return (
      <div ref={imgRef}>
        {isVisible ? (
          <NFTImage src={src} alt={alt} />
        ) : (
          <Box width="100%" height="190px" bg="gray.700" borderRadius="8px" />
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Box mt="40px" textAlign="center">
        <Spinner size="xl" />
        <Text mt="4">Loading NFTs...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt="40px" textAlign="center">
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  if (cachedNFTListings.length === 0) {
    return (
      <Box mt="40px" textAlign="center" position="relative" maxWidth="2400px" marginX="auto">
        <Heading mb="40px">Galactic Vision</Heading>
        <Text>No NFTs found in this collection</Text>
      </Box>
    );
  }

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
        <Box position="relative" mx="60px">
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
            {cachedNFTListings.map((nft, index) => (
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
                      <LazyLoadImage src={nft.metadata.image} alt={nft.metadata.name} />
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
                    {account && (
                      <BuyNowButton
                        listing={listingsInSelectedCollection.find((listing: any) => listing.tokenId.toString() === nft.id.toString())!}
                        account={account}
                      />
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