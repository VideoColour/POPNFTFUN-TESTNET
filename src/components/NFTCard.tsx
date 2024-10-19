import React, { useState, useRef } from 'react';
import { Box, Text, Heading, Flex, Image, IconButton, Icon, Menu, MenuButton, MenuList, MenuItem, MenuDivider } from "@chakra-ui/react";
import { ChakraNextLink } from '@/components/ChakraNextLink';
import { FiMoreHorizontal, FiRefreshCw, FiShare2, FiExternalLink } from "react-icons/fi";
import BuyNowButton from '@/components/BuyNowButton'; // Changed to default import
import { useOutsideClick } from "@chakra-ui/react";
import { Portal } from "@chakra-ui/react";

interface NFTCardProps {
  nft: any;
  nftContract: any;
  account: any;
  listingsInSelectedCollection: any[];
  convertIpfsToHttp: (url: string | undefined) => string;
}

export function NFTCard({ nft, nftContract, account, listingsInSelectedCollection, convertIpfsToHttp }: NFTCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useOutsideClick({
    ref: menuRef,
    handler: () => setIsMenuOpen(false),
  });

  const handleMouseLeave = () => {
    setIsMenuOpen(false);
  };

  return (
    <Box
      ref={cardRef}
      position="relative"
      width="100%"
      height="380px"
      overflow="visible"
      padding="6px 6px"
      onMouseLeave={handleMouseLeave}
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
          transform: "scale(1.035)",
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
              transform="translate(-5px, -4.2px)"
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
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  const target = e.currentTarget;
                  console.error('Image load error:', target.src, 'NFT ID:', nft.id);
                  target.onerror = null;
                  target.src = '/Molder-01.jpg';
                }}
              />
            </Box>
          </Flex>
        </ChakraNextLink>
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
          <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} placement="top-end">
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<Icon as={FiMoreHorizontal} />}
              size="sm"
              variant="ghost"
              color="gray.300"
              _hover={{ color: "white" }}
              _focus={{ boxShadow: 'none' }}
              _active={{ bg: 'transparent' }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            />
            <MenuList
              ref={menuRef}
              bg="rgba(0, 0, 0, 0.3)"
              backdropFilter="blur(8px)"
              border="1px solid rgba(128, 128, 128, 0.3)"
              borderRadius="md"
              boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
              padding="8px"
              zIndex="1001"
              maxWidth="220px"
              minWidth="220px"
              position="absolute"
              right="-14px"
              bottom="100%"
              marginBottom="5px"
            >
              <MenuItem bg="transparent" _hover={{ bg: "rgba(255, 255, 255, 0.1)" }} icon={<Icon as={FiRefreshCw} />} justifyContent="flex-end">Buy now</MenuItem>
              <MenuItem bg="transparent" _hover={{ bg: "rgba(255, 255, 255, 0.1)" }} icon={<Icon as={FiShare2} />} justifyContent="flex-end">Make offer</MenuItem>
              <MenuDivider borderColor="rgba(128, 128, 128, 0.2)" />
              <MenuItem bg="transparent" _hover={{ bg: "rgba(255, 255, 255, 0.1)" }} icon={<Icon as={FiRefreshCw} />} justifyContent="flex-end">Refresh metadata</MenuItem>
              <MenuItem bg="transparent" _hover={{ bg: "rgba(255, 255, 255, 0.1)" }} icon={<Icon as={FiShare2} />} justifyContent="flex-end">Share</MenuItem>
              <MenuItem bg="transparent" _hover={{ bg: "rgba(255, 255, 255, 0.1)" }} icon={<Icon as={FiExternalLink} />} justifyContent="flex-end">Open original</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
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
          {account && nft.currencyValuePerToken ? (
            <BuyNowButton
              listing={listingsInSelectedCollection.find((listing: any) => listing.tokenId.toString() === nft.id.toString())!}
              account={account}
            />
          ) : (
            <Text fontSize="sm" color="gray.500">
              {account ? "Not for sale" : "Connect wallet to buy"}
            </Text>
          )}
        </Flex>
      </Box>
    </Box>
  );
}
