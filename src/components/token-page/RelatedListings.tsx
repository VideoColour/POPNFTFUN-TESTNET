import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { Box, Text, Heading, Flex, Image, IconButton, Button } from "@chakra-ui/react";
import { getNFTs as getNFTs1155 } from "thirdweb/extensions/erc1155";
import { getNFTs as getNFTs721 } from "thirdweb/extensions/erc721";
import { useReadContract, useActiveWallet, useConnectModal } from "thirdweb/react";
import "@/consts/customstyles.css";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { useMarketplaceContext } from "@/hooks/useMarketplaceContext";
import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import { DirectListing } from "thirdweb/extensions/marketplace";
import RelatedBuyNowButton from "./RelatedBuyNowButton";
import { Swiper as SwiperType } from 'swiper';
import { meldTestnet } from "@/consts/client";

// Keep your existing convertIpfsToHttp function

interface NFTItem {
  listing: DirectListing | undefined;
  id: string;
  tokenId: string;
  metadata: {
    name: string | undefined;
    image: string | undefined;
  };
  currencyValuePerToken?: {
    displayValue: string;
    symbol: string;
  };
  startTimeInSeconds?: number;
}

interface RelatedListingsProps {
  excludedListingId: bigint;
  activeWallet: any;
}

export default function RelatedListings({ excludedListingId, activeWallet }: RelatedListingsProps) {
  const { nftContract, type, supplyInfo, listingsInSelectedCollection, marketplaceContract, isLoading: marketplaceLoading } = useMarketplaceContext();
  const [nftListings, setNftListings] = useState<NFTItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { connect } = useConnectModal();
  const swiperRef = useRef<SwiperType>();
  const [purchasedTokenId, setPurchasedTokenId] = useState<string | null>(null);

  const startTokenId = supplyInfo?.startTokenId ?? 0n;
  const totalItems: bigint = supplyInfo ? supplyInfo.endTokenId - supplyInfo.startTokenId + 1n : 0n;

  const { data: allNFTs } = useReadContract(
    type === "ERC1155" ? getNFTs1155 : getNFTs721,
    {
      contract: nftContract,
      start: Number(startTokenId),
      count: Number(totalItems),
    }
  );

  const fetchNFTs = useCallback(() => {
    if (!allNFTs) return;
    console.log("Fetching NFTs...");
    
    let mergedNfts: NFTItem[] = allNFTs.map((nft: any) => {
      const nftId = nft.id.toString();
      const listing = listingsInSelectedCollection.find(
        (l: DirectListing) => l.tokenId.toString() === nftId && l.id !== excludedListingId
      );
      return {
        id: nftId,
        tokenId: nftId,
        metadata: nft.metadata,
        currencyValuePerToken: listing ? listing.currencyValuePerToken : undefined,
        startTimeInSeconds: listing ? Number(listing.startTimeInSeconds) : undefined,
        listing: listing,
      };
    });

    mergedNfts.sort((a, b) => ((b.startTimeInSeconds || 0) - (a.startTimeInSeconds || 0)));
    setNftListings(mergedNfts);
  }, [allNFTs, listingsInSelectedCollection, excludedListingId]);

  useEffect(() => {
    if (allNFTs && listingsInSelectedCollection) {
      try {
        fetchNFTs();
      } catch (err) {
        console.error("Error fetching NFTs:", err);
        setError("Failed to load NFTs. Please try again later.");
      }
    }
  }, [allNFTs, listingsInSelectedCollection, fetchNFTs]);

  const handleConnectWallet = useCallback(async () => {
    try {
      await connect({
        chain: {
          ...meldTestnet,
          id: Number(meldTestnet.chainId),
          rpc: meldTestnet.rpc[0],
          testnet: true,
        },
        client: {
          clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || '',
          secretKey: process.env.THIRDWEB_SECRET_KEY
        }
      });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setError("Failed to connect wallet. Please try again.");
    }
  }, [connect]);

  console.log("ActiveWallet in RelatedListings:", activeWallet);

  useEffect(() => {
    if (purchasedTokenId && nftContract?.address) {
      window.location.href = `/token/${nftContract.address}/${purchasedTokenId}`;
    }
  }, [purchasedTokenId, nftContract?.address]);

  const handlePurchaseSuccess = useCallback((tokenId: string) => {
    setPurchasedTokenId(tokenId);
  }, []);

  const renderNFTItems = useMemo(() => {
    function convertIpfsToHttp(ipfsUrl: string | undefined) {
      if (!ipfsUrl) return '/Molder-01.jpg';
      
      if (ipfsUrl.startsWith('http://') || ipfsUrl.startsWith('https://')) {
        return ipfsUrl;
      }
      
      if (ipfsUrl.startsWith('data:')) {
        return ipfsUrl;
      }
      
      const cid = ipfsUrl.replace('ipfs://', '');
      const [extractedCid, ...filenameParts] = cid.split('/');
      const filename = filenameParts.join('/');
      
      return `https://ipfs.io/ipfs/${extractedCid}/${filename}`;
    }

    return nftListings.map((nft) => {
      console.log("Rendering NFT item, activeWallet:", activeWallet);
      return (
        <SwiperSlide key={nft.id}>
          <Box
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            bg="gray.800"
            _hover={{ transform: 'scale(1.05)', transition: 'transform 0.2s' }}
          >
            <Image src={convertIpfsToHttp(nft.metadata.image)} alt={nft.metadata.name || 'NFT'} />
            <Box p="6">
              <Heading size="md" mb="2">{nft.metadata.name}</Heading>
              <Flex justifyContent="space-between" alignItems="center">
                <Box>
                  <Text color="gray.300" fontSize="sm">Price</Text>
                  {nft.currencyValuePerToken ? (
                    <Text fontWeight="bold" fontSize="md" color="white">
                      {nft.currencyValuePerToken.displayValue} {nft.currencyValuePerToken.symbol}
                    </Text>
                  ) : (
                    <Text fontWeight="bold" fontSize="md" color="gray.500">
                      Not Listed
                    </Text>
                  )}
                </Box>
                <Box>
                  {activeWallet ? (
                    <RelatedBuyNowButton
                      listing={nft.listing as DirectListing}
                      wallet={activeWallet}
                      marketplaceContract={marketplaceContract}
                      onPurchaseSuccess={() => handlePurchaseSuccess(nft.tokenId)}
                    />
                  ) : (
                    <Button onClick={handleConnectWallet}>Connect Wallet</Button>
                  )}
                </Box>
              </Flex>
            </Box>
          </Box>
        </SwiperSlide>
      );
    });
  }, [nftListings, activeWallet, handleConnectWallet, marketplaceContract, handlePurchaseSuccess]);

  if (marketplaceLoading) {
    return <Box>Loading...</Box>;
  }

  if (error) {
    return <Box>Error: {error}</Box>;
  }

  if (nftListings.length === 0) {
    return (
      <Box mt="40px" textAlign="center">
        <Heading mb="40px">More from this collection</Heading>
        <Text>No NFTs found in this collection</Text>
      </Box>
    );
  }

  return (
    <Box 
      mt="40px" 
      textAlign="left" 
      position="relative" 
      className="custom-carousel"
      overflow="hidden"
    >
      <Heading mb="10px">More from this collection</Heading>
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
        <Box position="relative" mx="60px" py="60px">
          <Swiper
            modules={[Navigation]}
            spaceBetween={0}
            slidesPerGroup={3}
            breakpoints={{
              1: { slidesPerView: 2, spaceBetween: 5, slidesPerGroup: 2 },
              768: { slidesPerView: 3, spaceBetween: 10, slidesPerGroup: 3 },
              1024: { slidesPerView: 4, spaceBetween: 15, slidesPerGroup: 4 },
              1440: { slidesPerView: 5, spaceBetween: 20, slidesPerGroup: 5 },
            }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
          >
            {renderNFTItems}
          </Swiper>
          <IconButton
            aria-label="Previous slide"
            icon={<ArrowBackIcon />}
            position="absolute"
            left="-50px"
            top="50%"
            transform="translateY(-50%)"
            zIndex={2}
            onClick={() => swiperRef.current?.slidePrev()}
          />
          <IconButton
            aria-label="Next slide"
            icon={<ArrowForwardIcon />}
            position="absolute"
            right="-50px"
            top="50%"
            transform="translateY(-50%)"
            zIndex={2}
            onClick={() => swiperRef.current?.slideNext()}
          />
        </Box>
      </Box>
    </Box>
  );
}
