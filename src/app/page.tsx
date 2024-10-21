"use client";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { NFT_CONTRACTS } from "@/consts/home_nft_contracts";
import { ChakraNextLink } from '@/components/ChakraNextLink';
import { Box, Flex, Heading, Image, Text, Button, IconButton, SimpleGrid, Fade } from "@chakra-ui/react";
import Slider from "react-slick";
import { ArrowBackIcon, ArrowForwardIcon } from "@chakra-ui/icons";
import { FaPlay, FaPause, FaTelegramPlane, FaExclamationTriangle } from "react-icons/fa";
import { FaRegFileLines, FaXTwitter } from "react-icons/fa6";

import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import '@/consts/customstyles.css';
import { keyframes } from "@emotion/react";
import '@/styles/slider.css';
import dynamic from 'next/dynamic';
import { debounce } from 'lodash';
import { motion, AnimatePresence } from 'framer-motion';
import { Global, css } from "@emotion/react";
import AccessibleSlider from '@/components/AccessibleSlider';
const HomeHighlights = dynamic(() => import('@/components/HomeHighlights'), { ssr: false });
const MarketplaceProvider = dynamic(() => import('@/hooks/useMarketplaceContext'), { ssr: false });

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface CustomSlider extends Slider {
  slickNext(): void;
  slickPrev(): void;
  slickGoTo(slideNumber: number, dontAnimate?: boolean): void;
}

const glowing = keyframes`
  0% { background-position: 0 0; }
  50% { background-position: 400% 0; }
  100% { background-position: 0 0; }
`;

export default function Home() {
  const sliderRef = useRef<Slider>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState(0);
  const [listings, setListings] = useState(null);
  const [allValidListings, setAllValidListings] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const [expandedStates, setExpandedStates] = useState(NFT_CONTRACTS.map(() => false));
  const [bgImage, setBgImage] = useState(NFT_CONTRACTS[0].thumbnailUrl);
  const [slideDirection, setSlideDirection] = useState(0);
  const [isLastToFirstTransition, setIsLastToFirstTransition] = useState(false);

  const handleBeforeChange = (oldIndex: number, newIndex: number) => {
    setPrevIndex(oldIndex);
    setCurrentIndex(newIndex);
    setBgIndex(newIndex);
    setBgImage(NFT_CONTRACTS[newIndex].thumbnailUrl);
    setSlideDirection(newIndex > oldIndex ? 1 : -1);
    
    // Preload next 3 images when we're 3 slides away from the end
    if (oldIndex >= NFT_CONTRACTS.length - 3) {
      preloadImages(0, 3);
    }
    
    setIsLastToFirstTransition(oldIndex === NFT_CONTRACTS.length - 1 && newIndex === 0);
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
    dots: true,
    infinite: true,
    speed: 700, // Reduced from 920 to 700 for faster transitions
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1000,
    arrows: false,
    centerMode: true,
    centerPadding: '30%', 
    beforeChange: handleBeforeChange,
    afterChange: (current: number) => {
      console.log(`Changed to slide ${current}`);
    },
    cssEase: 'cubic-bezier(0.25, 0.1, 0.25, 1.2)', // Adjusted for a slightly quicker ease-out
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

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
    }),
  };

  useEffect(() => {
    if (isLastToFirstTransition) {
      const timer = setTimeout(() => {
        setIsLastToFirstTransition(false);
      }, 50); // Reduced from 300ms to 50ms for a quicker reset
      return () => clearTimeout(timer);
    }
  }, [isLastToFirstTransition]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      preloadImages(0, 4); // Preload first 4 images
    }
  }, []);

  const preloadImages = (startIndex: number, count: number) => {
    if (typeof window !== 'undefined') {
      for (let i = 0; i < count; i++) {
        const index = (startIndex + i) % NFT_CONTRACTS.length;
        if (NFT_CONTRACTS[index]?.thumbnailUrl) {
          const img = new window.Image();
          img.src = NFT_CONTRACTS[index].thumbnailUrl;
        }
      }
    }
  };

  return (
    <Flex direction="column" alignItems="center" width="100%">
      <Global
        styles={css`
          @keyframes glowing {
            0% { background-position: 0 0; }
            50% { background-position: 400% 0; }
            100% { background-position: 0 0; }
          }
          .slick-slider {
            overflow: visible !important;
          }
          .slick-list {
            overflow: visible !important;
          }
          .slick-track {
            display: flex !important;
            align-items: center !important;
          }
          .slick-slide {
            transition: all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1);
            opacity: 0;
            filter: blur(70px); // Keeping the increased blur
            transform: scale(0.5) translateX(100%);
            z-index: 1;
          }
          .slick-slide.slick-active {
            opacity: 0.3;
            filter: blur(30px); // Keeping the increased blur
            transform: scale(0.7) translateX(50%);
          }
          .slick-slide.slick-current {
            opacity: 1;
            filter: blur(0);
            transform: scale(1.1) translateX(0);
            z-index: 2;
          }
          .slick-slide > div {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0 50px; // Reduced padding
          }
          .custom-slider {
            overflow: visible !important;
            margin: 0 -50px; // Adjusted to match new padding
          }
          .slick-dots {
            bottom: 25px;
          }
          .slick-dots li button:before {
            color: white;
          }
          .slick-dots li.slick-active button:before {
            color: white;
          }
        `}
      />
      <Box 
        width="90%" // Changed from 95% to 90%
        position="relative" 
        height={{ base: "75vh", sm: "80vh", md: "85vh", lg: "90vh", xl: "95vh" }}
        borderRadius="3xl"
        overflow="hidden"
        boxShadow="0 0 20px rgba(0,0,0,0.2)"
        bg="rgba(0,0,0,0.5)"
        backdropFilter="blur(10px)"
      >
        {/* Background image */}
        <AnimatePresence initial={false} custom={slideDirection}>
          <motion.div
            key={bgImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }} // Reduced from 1 to 0.5 for faster background transitions
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${bgImage})`,
              backgroundSize: '150% 120%',
              backgroundPosition: 'center',
              filter: 'blur(100px) saturate(1.5) contrast(1.2) brightness(1.2)',
              zIndex: -1,
            }}
          />
        </AnimatePresence>

        <Box position="relative" height="100%" overflow="hidden">
          <AccessibleSlider
            {...sliderSettings}
            ref={sliderRef}
            className="custom-slider"
          >
            {NFT_CONTRACTS.map((item, index) => (
              <Box key={item.address || index} height="100%" className="slide-item">
                <Flex 
                  direction="column" 
                  justifyContent="center" 
                  alignItems="center" 
                  height="100%"
                  width="100%"
                  transition="all 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)"
                  px={4} // Added horizontal padding
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
                      transition: "transform 0.5s cubic-bezier(0.2, 0, 0.38, 0.9), opacity 0.3s ease-in-out", // Reduced opacity transition time
                      transform: expandedStates[index] ? 'translateY(-20px)' : 'translateY(0)',
                      opacity: isLastToFirstTransition && index === 0 ? 0 : 1,
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
                      <Button 
                        size="lg"
                        position="relative"
                        color="white"
                        fontWeight="bold"
                        px={6}
                        py={3}
                        borderRadius="full"
                        bg="transparent"
                        border="2px solid white"
                        _hover={{
                          borderColor: "transparent",
                          _before: {
                            content: '""',
                            position: "absolute",
                            top: "-2px",
                            left: "-2px",
                            right: "-2px",
                            bottom: "-2px",
                            background: "linear-gradient(90deg, #ff00cc, #333399)",
                            borderRadius: "inherit",
                            filter: "blur(50px)",
                            opacity: 0.8,
                            zIndex: -1,
                          },
                          _after: {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            borderRadius: "inherit",
                            border: "2.5px solid transparent",
                            background: "linear-gradient(90deg, #ff00cc, #333399) border-box",
                            WebkitMask: 
                              "linear-gradient(#fff 0 0) padding-box, " +
                              "linear-gradient(#fff 0 0)",
                            WebkitMaskComposite: "destination-out",
                            maskComposite: "exclude",
                          }
                        }}
                        transition="all 0.3s ease"
                      >
                        <Box
                          as="span"
                          position="relative"
                          zIndex="2"
                        >
                          Open Collection
                        </Box>
                        <Box
                          position="absolute"
                          top="1px"
                          left="1px"
                          right="1px"
                          bottom="1px"
                          borderRadius="full"
                          bg="rgba(0, 0, 0, 0.3)"
                          opacity="0"
                          transition="opacity 0.3s ease"
                          _groupHover={{ opacity: 1 }}
                        />
                      </Button>
                    </ChakraNextLink>
                  </Flex>
                </Flex>
              </Box>
            ))}
          </AccessibleSlider>

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

      <Box width="90%" mt="12px" flexGrow={1} mb="-60px">
        <MarketplaceProvider chainId="222000222" contractAddress="0x0307Cd59fe2Ac48C8573Fda134ed75E78bb94ECA">
          <HomeHighlights allValidListings={allValidListings || []} activeWallet={undefined} />
        </MarketplaceProvider>
      </Box>

      <Box width="90%" mt="20px" flexGrow={1} mb="-60px">
        <MarketplaceProvider chainId="222000222" contractAddress="0x2220001D2CFb9B6066A91dE5D4e861A21f549BA0">
          <HomeHighlights allValidListings={allValidListings || []} activeWallet={undefined} />
        </MarketplaceProvider>
      </Box>

      <Box width="90%" mt="20px" flexGrow={1} mb="-60px">
        <MarketplaceProvider chainId="222000222" contractAddress="0xEdc67F3f52D9afd84D0487BD3b830a83c98FEe2B">
          <HomeHighlights allValidListings={allValidListings || []} activeWallet={undefined} />
        </MarketplaceProvider>
      </Box>

      <Box width="90%" mt="20px" flexGrow={1} mb="20px">
        <MarketplaceProvider chainId="222000222" contractAddress="0x0307Cd59fe2Ac48C8573Fda134ed75E78bb94ECA">
          <HomeHighlights allValidListings={allValidListings || []} activeWallet={undefined} />
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
