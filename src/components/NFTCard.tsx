import React, { useState, useRef, useEffect } from 'react';
import { Box, Text, Heading, Flex, Image, IconButton, Icon, Menu, MenuButton, MenuList, MenuItem, MenuDivider } from "@chakra-ui/react";
import { ChakraNextLink } from '@/components/ChakraNextLink';
import { FiMoreHorizontal, FiRefreshCw, FiShare2, FiExternalLink, FiDollarSign } from "react-icons/fi";
import { FaHandHolding } from "react-icons/fa";
import BuyNowButton from '@/components/BuyNowButton';
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
  const [menuWidth, setMenuWidth] = useState("220px");
  const [isHovered, setIsHovered] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useOutsideClick({
    ref: menuRef,
    handler: () => setIsMenuOpen(false),
  });

  useEffect(() => {
    const updateMenuWidth = () => {
      if (imageContainerRef.current) {
        const rect = imageContainerRef.current.getBoundingClientRect();
        setMenuWidth(`${rect.width * 1.03}px`);
      }
    };

    updateMenuWidth();
    window.addEventListener('resize', updateMenuWidth);

    return () => {
      window.removeEventListener('resize', updateMenuWidth);
    };
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
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
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Box
        rounded="12px"
        bg="rgba(28, 28, 28, 0.6)"
        border="1px solid rgb(222, 222, 222, 0.1)"
        p="15px"
        width="100%"
        height="340px"
        transition="all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
        display="flex"
        flexDirection="column"
        sx={{
          boxShadow: isHovered ? "0 6px 15px rgba(0, 0, 0, 0.15)" : "none",
          transform: isHovered ? "scale(1.03) translateY(-1px)" : "none",
          zIndex: isHovered ? 10 : "auto",
        }}
      >
        <ChakraNextLink href={`/collection/${nftContract.chain.id}/${nftContract.address}/token/${nft.id}`} _hover={{ textDecoration: "none" }} flex="1">
          <Flex direction="column" height="100%">
            <Box
              ref={imageContainerRef}
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
          <Menu 
            isOpen={isMenuOpen} 
            onClose={() => setIsMenuOpen(false)} 
            placement="top-end"
            offset={[0, 10]}
          >
            <MenuButton
              as={IconButton}
              aria-label="Options"
              icon={<Icon as={FiMoreHorizontal} />}
              size="sm"
              variant="ghost"
              color="gray.300"
              _hover={{ 
                background: 'transparent',
                color: "gray.300"
              }}
              _active={{ 
                background: 'transparent',
                color: "gray.300"
              }}
              _focus={{ 
                boxShadow: 'none',
                background: 'transparent',
                color: "gray.300"
              }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            />
            <Portal>
              <MenuList
                ref={menuRef}
                bg="rgba(0, 0, 0, 0.1)"
                backdropFilter="blur(20px)"
                border="1px solid rgba(128, 128, 128, 0.3)"
                borderRadius="8px"
                boxShadow="0 4px 6px rgba(0, 0, 0, 0.1)"
                padding="0"
                zIndex="9999"
                width={menuWidth}
                maxWidth={menuWidth}
                position="absolute"
                right="-14px"
                bottom="100%"
                marginBottom="5px"
                overflow="hidden"
                sx={{
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    backdropFilter: 'blur(20px)',
                    background: 'rgba(0, 0, 0, 0.1)',
                    margin: '-5px',
                    zIndex: -1,
                  }
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                  if (!cardRef.current?.contains(e.relatedTarget as Node)) {
                    setIsHovered(false);
                    setIsMenuOpen(false);
                  }
                }}
              >
                <Box px="20px" py="10px">
                  <MenuItem bg="transparent" _hover={{ bg: "rgba(255, 255, 255, 0.1)" }} icon={<Icon as={FiDollarSign} />}>Buy now</MenuItem>
                  <MenuItem bg="transparent" _hover={{ bg: "rgba(255, 255, 255, 0.1)" }} icon={<Icon as={FaHandHolding} />}>Make offer</MenuItem>
                  <MenuDivider borderColor="rgba(128, 128, 128, 0.2)" />
                  <MenuItem bg="transparent" _hover={{ bg: "rgba(255, 255, 255, 0.1)" }} icon={<Icon as={FiRefreshCw} />}>Refresh metadata</MenuItem>
                  <MenuItem bg="transparent" _hover={{ bg: "rgba(255, 255, 255, 0.1)" }} icon={<Icon as={FiShare2} />}>Share</MenuItem>
                  <MenuItem bg="transparent" _hover={{ bg: "rgba(255, 255, 255, 0.1)" }} icon={<Icon as={FiExternalLink} />}>Open original</MenuItem>
                </Box>
              </MenuList>
            </Portal>
          </Menu>
        </Flex>
        <Flex 
          justifyContent="space-between" 
          alignItems="center" 
          w="107%" 
          mt="auto" 
          borderRadius="8px" 
          p="12px" 
          bg="rgb(40, 40, 40, 0.8)"
          position="relative"
          left="50%"
          transform="translateX(-50%)"
          mb="-6px"
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
