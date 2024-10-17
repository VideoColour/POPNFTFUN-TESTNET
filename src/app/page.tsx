"use client";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { NFT_CONTRACTS } from "@/consts/home_nft_contracts";
import { ChakraNextLink } from '@/components/ChakraNextLink';
import { Box, Flex, Heading, Image, Text, Button, IconButton, SimpleGrid, Fade } from "@chakra-ui/react";
import Slider from "react-slick";
import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import { FaPlay, FaPause, FaTelegramPlane, FaExclamationTriangle } from "react-icons/fa";
import { FaRegFileLines, FaXTwitter } from "react-icons/fa6";

import HomeHighlights2 from "@/components/HomeHighlights2";
import HomeHighlights3 from "@/components/HomeHighlights3";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import '@/consts/customstyles.css';
import { keyframes } from "@emotion/react";
import '@/styles/slider.css';
import dynamic from 'next/dynamic';
import { debounce } from 'lodash';
const HomeHighlights = dynamic(() => import('@/components/HomeHighlights'), { ssr: false });
const MarketplaceProvider = dynamic(() => import('@/hooks/useMarketplaceContext'), { ssr: false });

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface CustomSlider extends Slider {
  slickNext(): void;
  slickPrev(): void;
  slickGoTo(slideNumber: number, dontAnimate?: boolean): void;
}

export default function Home() {
  const sliderRef = useRef<CustomSlider | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [listings, setListings] = useState(null);
  const [allValidListings, setAllValidListings] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const [expandedStates, setExpandedStates] = useState(NFT_CONTRACTS.map(() => false));

  const handleBeforeChange = (oldIndex: number, newIndex: number) => {
    setPrevIndex(oldIndex);
    setCurrentIndex(newIndex);
    setBgIndex(newIndex);
  };

  const colorWave = keyframes`
    0% { color: #ff007c; will-change: color; }
    25% { color: #ffca3a; }
    50% { color: #8ac926; }
    75% { color: #1982c4; }
    100% { color: #ff007c; }
  `;

  useEffect(() => {
    // Fetch listings and valid listings here and set the state
  }, []);

  const currentNFT = NFT_CONTRACTS[currentIndex];

  const debouncedHandlePrevClick = useCallback(
    debounce(() => {
      sliderRef.current?.slickPrev();
    }, 300),
    []
  );

  const debouncedHandleNextClick = useCallback(
    debounce(() => {
      sliderRef.current?.slickNext();
    }, 300),
    []
  );

  const sliderSettings = {
    dots: false,
    infinite: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    arrows: false,
    fade: false,
    speed: 850, // Faster slide transition
    cssEase: 'cubic-bezier(0.3, 0.5, 0.3, 1)',
    useCSS: true,
    useTransform: true,
    waitForAnimate: true,
    beforeChange: (current: number, next: number) => {
      console.log(`Changing from slide ${current} to ${next}`);
    },
    afterChange: (current: number) => {
      console.log(`Changed to slide ${current}`);
    },
  };

  const handlePrevClick = useCallback(() => {
    console.log('Prev button clicked');
    if (sliderRef.current) {
      const prevSlide = (currentIndex - 1 + NFT_CONTRACTS.length) % NFT_CONTRACTS.length;
      sliderRef.current.slickGoTo(prevSlide);
    }
  }, [currentIndex]);

  const handleNextClick = useCallback(() => {
    console.log('Next button clicked');
    if (sliderRef.current) {
      const nextSlide = (currentIndex + 1) % NFT_CONTRACTS.length;
      sliderRef.current.slickGoTo(nextSlide);
    }
  }, [currentIndex]);

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

  useEffect(() => {
    const images = document.querySelectorAll('.collection-image');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Fade in
          (entry.target as HTMLElement).style.opacity = '1';
        } else {
          // Fade out
          (entry.target as HTMLElement).style.opacity = '0';
        }
      });
    }, { threshold: 0.5 });

    images.forEach(img => observer.observe(img));

    return () => observer.disconnect();
  }, []);

  const handleExpandClick = useCallback((index: number) => {
    setExpandedStates(prev => {
      const newStates = [...prev];
      newStates[index] = !newStates[index];
      return newStates;
    });
  }, []);

  return (
    <Flex direction="column" alignItems="center" width="100%">
      <Box 
        width="90%" 
        position="relative" 
        height={{ base: "50vh", sm: "45vh", md: "55vh", lg: "70vh", xl: "80vh" }}
        borderRadius="lg"
        overflow="hidden"
      >
        <Slider
          {...sliderSettings}
          ref={sliderRef as React.RefObject<Slider>}
          className="custom-slider"
        >
          {NFT_CONTRACTS.map((item, index) => (
            <Box key={item.address || index} height="100%" className="slide-item">
              {/* Background image */}
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                backgroundImage={`url(${item.thumbnailUrl || "/home_creator_1.jpg"})`}
                backgroundSize="150% 120%"
                backgroundPosition="center"
                filter="blur(100px) saturate(1.5) contrast(1.2) brightness(1.2)"
                opacity={0.5}
                zIndex={-1}
                transition="opacity 0.4s ease-in-out, background-image 0.4s ease-in-out"
              />
              <Flex 
                direction="column" 
                justifyContent="center" 
                alignItems="center" 
                height="100%"
                transition="all 0.5s cubic-bezier(0.2, 0, 0.38, 0.9)"
                style={{ willChange: 'transform' }}
              >
                <Image
                  src={item.thumbnailUrl}
                  alt={item.title}
                  width={{ base: 150, sm: 180, md: 300, lg: 400, xl: 500 }}
                  height={{ base: 150, sm: 180, md: 300, lg: 400, xl: 500 }}
                  className="collection-image"
                  style={{
                    borderRadius: "25px",
                    boxShadow: "2xl",
                    maxWidth: "100%",
                    height: "auto",
                    opacity: 0,
                    transition: "opacity 1s ease-in, opacity 0.3s ease-out, transform 0.5s cubic-bezier(0.2, 0, 0.38, 0.9)",
                    transform: expandedStates[index] ? 'translateY(-20px)' : 'translateY(0)',
                  }}
                />
                <Heading 
                  fontSize={{ base: "3xl", sm: "4xl", md: "4xl", lg: "5xl" }}
                  mt={4}
                  mb={2} 
                  color="white"
                  transition="transform 0.5s cubic-bezier(0.2, 0, 0.38, 0.9)"
                  transform={expandedStates[index] ? 'translateY(-10px)' : 'translateY(0)'}
                >
                  {item.title}
                </Heading>
                {/* Creator and circle image */}
                <ChakraNextLink 
                  href={item.profileUrl || "#"}
                  _hover={{ textDecoration: 'none' }}
                >
                  <Flex 
                    alignItems="center" 
                    mt={2}
                    mb={4}
                    transition="all 0.2s"
                    _hover={{ transform: 'scale(1.012',  }}
                  >
                    <Image
                      src={item.avatarUrl || "/default-creator-image.jpg"}
                      alt={`${item.name} avatar`}
                      boxSize="40px"
                      borderRadius="full"
                      mr={2}
                    />
                    <Text color="white" fontSize="lg" fontWeight="bold">
                      by {item.name || "Unknown Creator"}
                    </Text>
                  </Flex>
                </ChakraNextLink>
                <Flex 
                  direction="column"
                  alignItems="center" 
                  justifyContent="center" 
                  transition="all 0.5s cubic-bezier(0.2, 0, 0.38, 0.9)"
                >
                  <Box
                    maxW="600px"
                    color="gray.200"
                    overflow="hidden"
                    textAlign="center"
                    height={expandedStates[index] ? "auto" : "3em"}
                    opacity={1}
                    transition="all 0.5s cubic-bezier(0.2, 0, 0.38, 0.9)"
                    mb={2}
                  >
                    <Text 
                      fontSize={{ base: "sm", sm: "sm", md: "md", lg: "md", xl: "md" }} 
                      transition="all 0.5s cubic-bezier(0.2, 0, 0.38, 0.9)"
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: expandedStates[index] ? 'unset' : 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {item.description || "No description available."}
                    </Text>
                  </Box>
                  {item.description && item.description.split(" ").length > 20 && (
                    <Button
                      size="sm"
                      color="gray.300"
                      backgroundColor="transparent"
                      _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                      onClick={() => handleExpandClick(index)}
                      mb={2}
                    >
                      {expandedStates[index] ? <ChevronUpIcon boxSize={5} /> : <ChevronDownIcon boxSize={5} />}
                    </Button>
                  )}
                  <ChakraNextLink href={`/collection/${item.chain?.id || 0}/${item.address || "#"}`}>
                    <Button colorScheme="rgb(222, 222, 222, 0.5)" variant="outline" size="lg">
                      Open Collection
                    </Button>
                  </ChakraNextLink>
                </Flex>
              </Flex>
            </Box>
          ))}
        </Slider>

        <IconButton
          aria-label="Previous"
          icon={<ArrowBackIcon />}
          onClick={() => sliderRef.current?.slickPrev()}
          position="absolute"
          top="50%"
          left="10px"
          transform="translateY(-50%)"
          zIndex="1000"
          colorScheme="gray.500"
          variant="none"
          size="lg"
          _hover={{ color: "gray.100", bg: "rgba(0, 0, 0, 0.1)" }}
        />
        <IconButton
          aria-label="Next"
          icon={<ArrowForwardIcon />}
          onClick={() => sliderRef.current?.slickNext()}
          position="absolute"
          top="50%"
          right="10px"
          transform="translateY(-50%)"
          zIndex="1000"
          colorScheme="gray.500"
          variant="none"
          size="lg"
          _hover={{ color: "gray.100", bg: "rgba(0, 0, 0, 0.1)" }}
        />
      </Box>

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
          <HomeHighlights allValidListings={allValidListings || []} />
        </MarketplaceProvider>
      </Box>

      <Box width="90%" mt="20px" flexGrow={1} mb="-50px">
        <MarketplaceProvider chainId="222000222" contractAddress="0x2220001D2CFb9B6066A91dE5D4e861A21f549BA0">
          <HomeHighlights allValidListings={allValidListings || []} />
        </MarketplaceProvider>
      </Box>

      <Box width="90%" mt="20px" flexGrow={1} mb="80px">
        <MarketplaceProvider chainId="222000222" contractAddress="0xEdc67F3f52D9afd84D0487BD3b830a83c98FEe2B">
          <HomeHighlights allValidListings={allValidListings || []} />
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
