import { useEffect, useRef } from "react";
import { Box, Text, Heading, IconButton } from "@chakra-ui/react";
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
import { useActiveAccount } from "thirdweb/react";
import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import { NFTCard } from './NFTCard';

// Define the HomeHighlightsProps interface
interface HomeHighlightsProps {
  allValidListings: any[];
}

// Define the NFTItem interface
interface NFTItem {
  id: string;
  metadata: { name: string; image: string };
  asset?: { id: string; metadata: { name: string; image: string } };
  currencyValuePerToken?: { displayValue: string; symbol: string };
  startTimeInSeconds?: number;
}

// Define the convertIpfsToHttp function
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

export default function HomeHighlights({ allValidListings }: HomeHighlightsProps) {
  const { nftContract, type, supplyInfo, listingsInSelectedCollection } = useMarketplaceContext();
  const account = useActiveAccount(); 
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

  const fetchNFTs = (): NFTItem[] => {
    if (!allNFTs) return [];
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
    return mergedNfts;
  };

  const nftListings = fetchNFTs();

  if (nftListings.length === 0) {
    return (
      <Box mt="40px" textAlign="center" position="relative" maxWidth="2400px" marginX="auto">
        <Heading mb="40px">Galactic Vision</Heading>
        {allNFTs ? <Text>No NFTs found in this collection</Text> : <Text></Text>}
      </Box>
    );
  }

  const slidesPerView = 3; // Number of slides to move at once

  return (
    <Box mt="40px" textAlign="left" position="relative" className="custom-carousel">
      <Heading mb="10px">
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
        paddingTop="-30px"
        mt="10px"
        mb="-40px"
        position="relative"
        overflow="visible"
      >
        <Box position="relative" mx="60px" py="60px" mt="-45px">
          <Swiper
            modules={[Navigation]}
            onBeforeInit={(swiper) => {
              swiperRef.current = swiper;
            }}
            spaceBetween={-20} // Negative value to bring cards closer
            slidesPerGroup={slidesPerView}
            breakpoints={{
              1: { slidesPerView: 2, spaceBetween: 0, slidesPerGroup: 2 },
              750: { slidesPerView: 3, spaceBetween: 0, slidesPerGroup: 3 },
              980: { slidesPerView: 4, spaceBetween: 0, slidesPerGroup: 3 },
              1200: { slidesPerView: 5, spaceBetween: 0, slidesPerGroup: 3 },
              1600: { slidesPerView: 6, spaceBetween: 0, slidesPerGroup: 3 },
              1800: { slidesPerView: 7, spaceBetween: 0, slidesPerGroup: 3 },
              2200: { slidesPerView: 8, spaceBetween: 0, slidesPerGroup: 3 },
              2400: { slidesPerView: 9, spaceBetween: 0, slidesPerGroup: 3 },
              2700: { slidesPerView: 10, spaceBetween: 0, slidesPerGroup: 3 },
            }}
            className="custom-swiper"
          >
            {nftListings.map((nft: NFTItem, index: number) => (
              <SwiperSlide key={index}>
                <NFTCard
                  nft={nft}
                  nftContract={nftContract}
                  account={account}
                  listingsInSelectedCollection={listingsInSelectedCollection}
                  convertIpfsToHttp={convertIpfsToHttp}
                />
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
