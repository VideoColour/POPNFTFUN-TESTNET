"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { NFT_CONTRACTS } from "@/consts/home_nft_contracts";
import { ChakraNextLink } from '@/components/ChakraNextLink';
import { Box, Flex, Heading, Image, Text, Button, IconButton, SimpleGrid, Fade } from "@chakra-ui/react";
import Slider from "react-slick";
import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import { FaPlay, FaPause, FaTelegramPlane, FaExclamationTriangle } from "react-icons/fa";
import { FaRegFileLines, FaXTwitter } from "react-icons/fa6";
import HomeHighlights from "@/components/HomeHighlights";
import MarketplaceProvider from "@/hooks/useMarketplaceContext";
import HomeHighlights2 from "@/components/HomeHighlights2";
import HomeHighlights3 from "@/components/HomeHighlights3";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import '@/consts/customstyles.css';
import { keyframes } from "@emotion/react";
import '@/styles/slider.css';
const sliderSettings = {
  dots: false,
  infinite: true,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 7000,
  arrows: false,
  pauseOnHover: true,
  fade: false,
  cssEase: 'cubic-bezier(0.45, 0, 0.55, 1)', // Smooth easing function
  speed: 1000, // Transition duration in milliseconds
};

export default function Home() {
  const [isPlaying, setIsPlaying] = useState(true);
  const sliderRef = React.useRef<Slider | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [listings, setListings] = useState([]);
  const [allValidListings, setAllValidListings] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleBeforeChange = (_: any, next: React.SetStateAction<number>) => setCurrentIndex(next);

  const colorWave = keyframes`
    0% { color: #ff007c; }
    25% { color: #ffca3a; }
    50% { color: #8ac926; }
    75% { color: #1982c4; }
    100% { color: #ff007c; }
  `;

  useEffect(() => {
    // Fetch listings and valid listings here and set the state
  }, []);

  const currentNFT = NFT_CONTRACTS[currentIndex];

  const handlePrevClick = useCallback(() => {
    sliderRef.current?.slickPrev();
  }, []);

  const handleNextClick = useCallback(() => {
    sliderRef.current?.slickNext();
  }, []);

  const memoizedSliderSettings = useMemo(() => ({
    ...sliderSettings,
    beforeChange: handleBeforeChange,
  }), [handleBeforeChange]);

  const memoizedNFTContracts = useMemo(() => NFT_CONTRACTS.map((item, index) => (
    <div key={index}>
      <Flex direction="column" justifyContent="center" height="100%">
        {/* ... */}
      </Flex>
    </div>
  )), []);

  const memoizedFeaturedCollections = useMemo(() => NFT_CONTRACTS.map((item, index) => (
    <ChakraNextLink
      href={`/collection/${item.chain.id}/${item.address}`}
      key={index}
      borderRadius="16px"
      p="0px"
      w={{ base: "70px", md: "120px", lg: "200px", xl: "300px", "2xl": "440px" }}
      h={{ base: "70px", md: "120px", lg: "200px", xl: "300px", "2xl": "440px" }}
      mt="30px"
      ml="30px"
      _hover={{
        transform: "scale(1.05)",
        transition: "all 0.2s ease-in-out",
      }}
      transition="all 0.2s ease-in-out"
    >
      <Image
        src={item.thumbnailUrl}
        alt={item.title}
        w={{ base: "70px", md: "120px", lg: "200px", xl: "300px", "2xl": "440px" }}
        h={{ base: "70px", md: "120px", lg: "200px", xl: "300px", "2xl": "440px" }}
        borderRadius="300px"
        objectFit="cover"
        _hover={{
          transform: "scale(1.02)",
          transition: "all 0.2s ease-in-out",
        }}
      />
      <Text mt="10px" fontSize={{ base: "md", md: "md", lg: "xl" }} textAlign="center" color="white">
        {item.title}
      </Text>
    </ChakraNextLink>
  )), []);

  return (
    <Flex direction="column" alignItems="center" width="100%">
      <Flex
        justifyContent="center"
        alignItems="center"
        width="90%"
        height={{ base: "30vh", sm: "40vh", md: "55vh", lg: "70vh", xl: "80vh" }}
        maxW="2750px"
        mx="auto"
        mt="0px"
        position="relative"
        borderRadius="lg"
        boxShadow="2xl"
        overflow="hidden"
        bg="blackAlpha.300"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          backgroundImage={`url(${currentNFT?.thumbnailUrl || "/home_creator_1.jpg"})`}
          backgroundSize="cover"
          backgroundPosition="center"
          filter="blur(120px) saturate(2.2) contrast(1.4) brightness(1.4)"
          opacity={0.3}
          zIndex={-1}
        />

        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          zIndex={1}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
        >
          <Image
            src={currentNFT?.thumbnailUrl || "/home_creator_1.jpg"}
            alt={currentNFT?.title || "Default Title"}
            loading="lazy"
            borderRadius="25px"
            boxShadow="2xl"
            width={{ base: "160px", md: "350px", lg: "550px" }}
            height={{ base: "160px", md: "350px", lg: "550px" }}
            mb={8}
          />

          <Heading fontSize={{ base: "2xl", md: "4xl", lg: "5xl" }} mb={4} color="white">
            {currentNFT?.title || "Default Title"}
          </Heading>

          <Flex alignItems="center" justifyContent="center" mb={4}>
            <Image
              src={currentNFT?.avatarUrl || "/home_creator_1.jpg"}
              alt={currentNFT?.name || "Creator Avatar"}
              boxSize="32px"
              borderRadius="full"
              mr={1.5}
            />
            <Text fontSize="xl">
              by {" "}
              <ChakraNextLink
                href={currentNFT?.profileUrl || ""}
                _hover={{ color: "red.500" }}
                _focus={{ boxShadow: "none" }}
                textDecoration="none"
                fontWeight="bold"
                transition="color 0.2s ease-in-out"
                color="white.200"
              >
                {currentNFT?.name || "Unknown Creator"}
              </ChakraNextLink>
            </Text>
          </Flex>

          <Box
            maxW="600px"
            mb={10}
            color="gray.200"
            overflow={isExpanded ? "visible" : "hidden"}
            textOverflow="ellipsis"
            whiteSpace="normal"
            display="-webkit-box"
            sx={{
              WebkitLineClamp: isExpanded ? "none" : "2",
              WebkitBoxOrient: "vertical",
              lineHeight: "1.5",
              maxHeight: isExpanded ? "none" : "3em",
              minHeight: "3.2em",
              paddingBottom: "-5em",
              transition: "all 0.3s ease-in-out",
              position: "relative",
            }}
          >
            <Text fontSize={{ base: "md", md: "md", lg: "md", xl: "md" }} mb={isExpanded ? 4 : 0}>
              {currentNFT?.description || "No description available."}
            </Text>
          </Box>

          {currentNFT?.description && currentNFT.description.split(" ").length > 20 && (
            <Flex justifyContent="center" alignItems="center" mt={2}>
              <Button
                size="sm"
                mt={isExpanded ? 4 : 0}
                color="gray.300"
                backgroundColor="transparent"
                _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                onClick={() => setIsExpanded((prev: boolean) => !prev)}
                alignSelf="center"
                justifySelf="center"
                visibility="visible"
                position="relative"
                top="-40px"
                zIndex={100}
              >
                {isExpanded ? <ChevronUpIcon boxSize={5} /> : <ChevronDownIcon boxSize={5} />}
              </Button>
            </Flex>
          )}

          <Flex justifyContent="center" gap={4} mt={-2}>
            <ChakraNextLink href={`/collection/${currentNFT?.chain?.id || 0}/${currentNFT?.address || "#"}`}>
              <Button colorScheme="rgb(222, 222, 222, 0.5)" variant="outline" size="lg">
                Open Collection
              </Button>
            </ChakraNextLink>
          </Flex>
        </Box>

        <Box width="100%" height="100%">
          <Slider
            {...memoizedSliderSettings}
            ref={sliderRef}
            className="custom-slider"
          >
            {memoizedNFTContracts}
          </Slider>
        </Box>

        <IconButton
          aria-label="Previous"
          icon={<ArrowBackIcon />}
          onClick={handlePrevClick}
          position="absolute"
          top="50%"
          left="10px"
          transform="translateY(-50%)"
          zIndex="1000"
          colorScheme="gray.500"
          variant="none"
          size="lg"
          _hover={{ color: "gray.100", bg: "transparent" }}
        />

        <IconButton
          aria-label="Next"
          icon={<ArrowForwardIcon />}
          onClick={handleNextClick}
          position="absolute"
          top="50%"
          right="10px"
          transform="translateY(-50%)"
          zIndex="1000"
          colorScheme="gray.500"
          variant="none"
          size="lg"
          _hover={{ color: "gray.100", bg: "transparent" }}
        />
      </Flex>

      <Flex
        justifyContent="space-between"
        mt="30px"
        alignItems="center"
        p="20px"
        borderRadius="lg"
        maxW="90%"
        mx="auto"
        width="100%"
        position="relative"
        boxShadow="2xl"
        _before={{
          content: `""`,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url('/BG-v1.webp')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(0px)",
          zIndex: -1,
          opacity: 1,
          borderRadius: "15px",
        }}
      >
        <Box
          h="12vh"
          w="140vw"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Box
            maxW="80%"
            bg="rgba(0, 0, 0, 0.4)"
            p="20px"
            borderRadius="2xl"
            zIndex="1"
            backdropFilter="blur(10px)"
            boxShadow="lg"
            display="flex"
            flexDirection="column"
          >
            <Heading
              fontSize={{
                base: "3xl",
                md: "4xl",
                lg: "5xl",
                xl: "6xl",
              }}
              animation={`${colorWave} 20s infinite alternate`}
              textAlign="center"
            >
              A Marketplace Built for the Community
            </Heading>
            <Text mt="14px"
              fontSize={{
                base: "sm",
                md: "md",
                lg: "lg",
                xl: "lg",
              }}
              textAlign="center"
            >
              Finally, a place on MELD where you can buy, sell, and trade NFTs. <br />
            </Text>
          </Box>
        </Box>
      </Flex>

      <Box width="90%" mt="20px" flexGrow={1} mb="-50px">
        <MarketplaceProvider chainId="222000222" contractAddress="0x0307Cd59fe2Ac48C8573Fda134ed75E78bb94ECA">
          <HomeHighlights allValidListings={allValidListings} />
        </MarketplaceProvider>
      </Box>

      <Box width="90%" mt="20px" flexGrow={1} mb="-50px">
        <MarketplaceProvider chainId="222000222" contractAddress="0x2220001D2CFb9B6066A91dE5D4e861A21f549BA0">
          <HomeHighlights allValidListings={allValidListings} />
        </MarketplaceProvider>
      </Box>

      <Box width="90%" mt="20px" flexGrow={1} mb="80px">
        <MarketplaceProvider chainId="222000222" contractAddress="0xEdc67F3f52D9afd84D0487BD3b830a83c98FEe2B">
          <HomeHighlights allValidListings={allValidListings} />
        </MarketplaceProvider>
      </Box>

      <Box mt="30px" width="90%" mx="auto" mb={{ base: "-90px", lg: "-200px" }} mr="100px">
        <Heading ml="20px" mt="40px" pb={"-60px"}>
          Featured Collections
        </Heading>
        <Flex
          wrap="wrap"
          gap={6}
          justifyContent="center"
          minH={{ base: "25vh", sm: "25vh", md: "30vh", lg: "52vh" }}
          pb={{ base: "10px", lg: "100px" }}
        >
          {memoizedFeaturedCollections}
        </Flex>
      </Box>

      <Flex
        justifyContent="center"
        alignItems="center"
        mt="50px"
        p="40px"
        borderRadius="lg"
        maxW="100%"
        mx="auto"
        width="100%"
        height="150px"
        position="relative"
        boxShadow="2xl"
        bg="rgba(20, 20, 20, 0.8)"
        backdropFilter="blur(12px)"
        _before={{
          content: `""`,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url('/BG-v2.webp')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(1px)",
          zIndex: -1,
          opacity: 0.5,
        }}
      >
        <Box maxW="60%" ml="20px">
          <Heading
            fontSize={{
              base: "3xl",
              md: "3xl",
              lg: "4xl",
            }}
            color="white"
            textAlign="left"
          >
            Have a Question?
          </Heading>
        </Box>

        <Box
          height="40px"
          width="2px"
          bg="gray"
          mx="40px"
        />

        <Box display="flex" justifyContent="flex-end" alignItems="center" color="gray">
          <Flex gap={6} mr="20px">
            <Box
              as="a"
              href="https://x.com/VideoColour"
              target="_blank"
              rel="noopener noreferrer"
              transition="color 0.2s ease-in-out"
              _hover={{ color: "white" }}
            >
              <FaXTwitter size={24} />
            </Box>

            <Box
              as="a"
              href="https://x.com/VideoColour"
              target="_blank"
              rel="noopener noreferrer"
              transition="color 0.2s ease-in-out"
              _hover={{ color: "white" }}
            >
              <FaTelegramPlane size={24} />
            </Box>

            <Box
              as="a"
              href="/docs"
              target="_blank"
              rel="noopener noreferrer"
              transition="color 0.2s ease-in-out"
              _hover={{ color: "white" }}
            >
              <FaRegFileLines size={24} />
            </Box>
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
}
