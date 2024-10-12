import { useEffect, useState, useRef } from "react";
import { Box, Text, Heading, Flex, Image, Link } from "@chakra-ui/react";
import { getNFTs as getNFTs1155 } from "thirdweb/extensions/erc1155";
import { getNFTs as getNFTs721 } from "thirdweb/extensions/erc721";
import { useReadContract } from "thirdweb/react";
import "@/consts/customstyles.css";
import { useMarketplaceContext } from "@/hooks/useMarketplaceContext";
import dynamic from "next/dynamic";
import { useActiveAccount } from "thirdweb/react";
import { IconButton } from "@chakra-ui/react";
import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
const BuyNowButton = dynamic(() =>
  import("@/components/BuyNowButton").then((mod) => mod.default), {
    ssr: false,
  }
);

const convertIpfsToHttp = (ipfsUrl: string | undefined) => {
  if (!ipfsUrl) return ''; // Return an empty string or a default image URL
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
  address: "0xEdc67F3f52D9afd84D0487BD3b830a83c98FEe2B",
  client: undefined,
  chain: {
    id: "222000222",
    rpc: "https://222000222.rpc.thirdweb.com",
  },
  title: "TORUS",
  thumbnailUrl: "https://videocolour.art/assets/img/portfolio/gifs/GALACTIC-EYE-160-web-v5.gif",
  type: "ERC721",
};

export default function HomeHighlights({ allValidListings }: HomeHighlightsProps) {
  const { nftContract, type, supplyInfo, listingsInSelectedCollection } = useMarketplaceContext();
  const [nftListings, setNftListings] = useState<NFTItem[]>([]);
  const account = useActiveAccount();
  const carouselRef = useRef<any>(null);

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

  const breakPoints = [
    { width: 1, itemsToShow: 2, itemsToScroll: 2 },
    { width: 750, itemsToShow: 3, itemsToScroll: 2 },
    { width: 980, itemsToShow: 4, itemsToScroll: 3 },
    { width: 1200, itemsToShow: 5, itemsToScroll: 3 },
    { width: 1600, itemsToShow: 6, itemsToScroll: 3 },
    { width: 1800, itemsToShow: 7, itemsToScroll: 3 },
    { width: 2100, itemsToShow: 8, itemsToScroll: 3 },
  ];

  return (
    <Box mt="40px" textAlign="left" position="relative" className="custom-carousel">
      <Heading mb="30px">
        <Link
          href={`/collection/${nftContract.chain.id}/${nftContract.address}`}
          color="white"
          fontWeight="bold"
          _hover={{ color: "red.500", textDecoration: "none" }}
          transition="all 0.2s ease-in-out"
        >
          {(nftContract as any).title || "Galactic Vision"}
          </Link>
      </Heading>
      <Box
        borderTop="1px solid"
        borderColor="rgb(222, 222, 222, 0.1)"
        marginBottom="25px"
        paddingTop="10px"
        mt="-20px"
        mb="25px"
        pt="10px"
      >
        <Swiper
          modules={[Navigation]}
          navigation
          spaceBetween={50}
          slidesPerView={3}
          onSwiper={(swiper) => console.log(swiper)}>
          
          {nftListings.map((nft, index) => (
            <Box key={index} p="10px">
              <Box
                rounded="12px"
                bg="rgb(33, 33, 33, 0.8)"
                border="1px solid rgb(222, 222, 222, 0.1)"
                p="20px"
                width="260px"
                height="322px"
                _hover={{ boxShadow: "0 6px 15px rgba(0, 0, 0, 0.2)", transform: "scale(1.035)" }}
                transition="all 0.2s ease-in-out"
              >
                <Link href={`/collection/${nftContract.chain.id}/${nftContract.address}/token/${nft.id}`} _hover={{ textDecoration: "none" }}>
                  <Flex direction="column" alignItems="center">
                    <Image src={convertIpfsToHttp(nft.metadata.image)} alt={nft.metadata.name} width="150%" height="190px" objectFit="cover" borderRadius="8px" />
                    <Text fontWeight="bold" fontSize="lg" mt="10px" color="white" textAlign="left">
                      {nft.metadata.name}
                    </Text>
                  </Flex>
                </Link>
                <Flex justifyContent="space-between" alignItems="left" w="100%" mt="10px">
                  <Box textAlign="left">
                    <Text color="gray.300">Price</Text>
                    {nft.currencyValuePerToken ? (
                      <Text fontWeight="bold" fontSize="lg" color="white">
                        {nft.currencyValuePerToken.displayValue} {nft.currencyValuePerToken.symbol === "ETH" ? "MELD" : nft.currencyValuePerToken.symbol}
                      </Text>
                    ) : (
                      <Text fontWeight="bold" fontSize="lg" color="gray.500">
                        Not Listed
                      </Text>
                    )}
                  </Box>

                  {nft.currencyValuePerToken && listingsInSelectedCollection && account && (
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
          ))}
        </Swiper>
      </Box>
    </Box>
  );
}