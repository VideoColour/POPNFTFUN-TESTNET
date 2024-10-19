"use client";
import { useState, useRef, useEffect } from "react";
import { client } from "@/consts/client";
import { Link } from "@chakra-ui/next-js";
import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  useColorMode,
  Text,
  InputGroup,
  InputLeftElement,
  Input,
  ButtonProps,
} from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";
import {
  ConnectButton,
  useActiveAccount,
  useActiveWallet,
} from "thirdweb/react";
import { usePathname, useRouter } from "next/navigation";
import { SideMenu } from "./SideMenu";
import { NFT_CONTRACTS, NftContract } from "@/consts/nft_contracts";
import { BlurredBackdrop } from './BlurredBackdrop';

const menuItems = [
  { label: "EXPLORE", href: "/All-Collections" },
];

export function Navbar() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { colorMode } = useColorMode();
  const pathname = usePathname();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<NftContract[]>([]);
  // Remove the isSearchFocused state
  // const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [isHovered, setIsHovered] = useState(false);

  const buttonStyle = {
    height: "36px",
    minWidth: "120px",
    background: "transparent",
    color: "white",
    border: "1px solid gray",
    borderRadius: "full",
    backdropFilter: "blur(12px)",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0)",
    transition: "all 0.3s ease",
    fontSize: "14px",
    fontFamily: "'BR Hendrix', sans-serif",
    fontWeight: "600",
    padding: "0 12px",
    pos: "relative", // Changed from 'position' to 'pos'
    _hover: {
      textDecoration: "none",
      borderColor: "transparent",
      _before: {
        content: '""',
        pos: "absolute", // Changed from 'position' to 'pos'
        top: "-2px",
        left: "-2px",
        right: "-2px",
        bottom: "-2px",
        background: "linear-gradient(90deg, #ff00cc, #333399)",
        borderRadius: "inherit",
        filter: "blur(50px)",
        opacity: 0.1,
        zIndex: -1,
      },
      _after: {
        content: '""',
        pos: "absolute", // Changed from 'position' to 'pos'
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: "inherit",
        border: "2px solid transparent",
        background: "linear-gradient(90deg, #ff00cc, #333399) border-box",
        WebkitMask: 
          "linear-gradient(#fff 0 0) padding-box, " +
          "linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "destination-out",
        maskComposite: "exclude",
      }
    },
  };

  const sideMenuButtonStyle: React.ComponentProps<typeof Button> = {
    bg: "transparent",
    p: 0,
    minW: "auto",
    h: "50px",
    w: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    transition: "all 0.3s ease",
    _hover: {
      bg: "transparent",
    },
  };

  // Add a new style for the connected wallet button
  const connectedWalletStyle = {
    ...buttonStyle,
    background: "transparent",
    border: "none",
    boxShadow: "none",
    color: "white",
    padding: "0",
    minWidth: "auto",
    borderRadius: "12px",
    ':hover': {
      background: "transparent",
    },
  };

  useEffect(() => {
    console.log("Navbar component mounted");
    return () => {
      console.log("Navbar component unmounted");
    };
  }, []);

  useEffect(() => {
    console.log("Search query changed:", searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    console.log("Search results updated:", searchResults);
  }, [searchResults]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    
    if (query.length > 0) {
      const results = fetchSearchResults(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const fetchSearchResults = (query: string) => {
    const filteredCollections = NFT_CONTRACTS.filter((item) =>
      (item.title ?? "").toLowerCase().includes(query.toLowerCase())
    );
    console.log("Filtered collections:", filteredCollections);
    return filteredCollections;
  };

  const handleResultClick = (result: NftContract) => {
    console.log("Clicked result:", result);
    const url = `/collection/${result.chain.id}/${result.address}`;
    console.log("Navigating to:", url);
    window.location.href = url;
  };
  console.log("NFT_CONTRACTS:", NFT_CONTRACTS);

  return (
    <Box
      py="12px"
      px={{ base: "48px", sm: "40px", md: "58px", lg: "72px", xl: "102px", xxl: "142px" }}
      position="sticky"
      top="0"
      zIndex="1005"
      bg="rgba(0, 0, 0, 0)"
      backdropFilter="blur(26px)"
      WebkitBackdropFilter="blur(26px)"
      boxShadow="0 4px 10px rgba(0, 0, 0, 0)"
    >
      <Flex direction="row" alignItems="center" justifyContent="space-between">
        <Flex alignItems="center" gap={1}>
          <img
            src="/POPNFT-BUBBLE.png"
            alt="POP NFT Bubble" 
            width="38px" 
            height="auto"
            style={{
              transform: "translateY(-2px)",
              maxWidth: "100%"
            }} 
          />
          <Heading
            as={Link}
            href="/"
            fontFamily="'Bebas Neue', sans-serif"
            fontWeight="800"
            _hover={{ textDecoration: "none" }}
            textDecoration="none"
            color="rgba(229, 27, 68)"
            fontSize={{ base: "33px", lg: "33px" }} 
            ml={-0.5} 
          >
            POP
          </Heading>
          <Heading
            as={Link}
            href="/"
            fontFamily="'Bebas Neue', sans-serif"
            fontWeight="800"
            _hover={{ textDecoration: "none" }}
            textDecoration="none"
            fontSize={{ base: "33px", lg: "33px" }} 
            color="rgba(222, 222, 222)"
            ml={-0.5} 
          >
            NFT
          </Heading>
          <Text
            fontFamily="'Bebas Neue', sans-serif"
            fontWeight="400"
            fontSize={{ base: "17px", lg: "17px" }} 
            color="rgba(222, 222, 222)"
            transform="translateY(-5px)" 
            ml={0.5} 
          >
            BETA
          </Text>
          <Box position="relative" ml="30px"> 
            <InputGroup size="md" w={{ base: "200px", lg: "320px" }}>
              <InputLeftElement pointerEvents="none">
                <FiSearch color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search for Collections"
                fontSize={{ base: "13px", lg: "13px" }}
                value={searchQuery}
                onChange={handleSearchChange}
                bg="transparent" 
                color="white"
                borderRadius="999px"
                _placeholder={{ color: "gray.400" }}
                border="1px solid rgba(255, 255, 255, 0.3)" 
                _focus={{
                  borderColor: "rgba(255, 255, 255, 0.3)", 
                  boxShadow: "none", 
                }}
              />
            </InputGroup>
            {searchQuery && searchResults.length > 0 && (
              <Box
                position="absolute"
                top="100%"
                left="0"
                width="100%"
                zIndex="1010"
                borderRadius="8px"
                maxHeight="300px"
                overflowY="auto"
                boxShadow="0 4px 10px rgba(0, 0, 0, 0.3)"
                border="1px solid rgba(200, 200, 200, 0.2)"
              >
                <Box
                  position="absolute"
                  top="0"
                  left="0"
                  right="0"
                  bottom="0"
                  bg="rgba(32, 32, 32, 0.8)"
                  css={{
                    backdropFilter: "blur(25px)",
                    WebkitBackdropFilter: "blur(25px)",
                    '&::before': {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backdropFilter: "blur(5px)",
                      WebkitBackdropFilter: "blur(5px)",
                      zIndex: -1,
                    }
                  }}
                  borderRadius="8px"
                  zIndex="1"
                />
                <Box
                  position="relative"
                  zIndex="2"
                  borderRadius="8px"
                  border="1px solid rgba(255, 255, 255, 0.1)"
                >
                  {searchResults.map((result, index) => (
                    <Flex
                      key={index}
                      alignItems="center"
                      p="10px"
                      position="relative"
                      overflow="hidden"
                      _hover={{
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: "rgba(255, 255, 255, 0.05)",
                          backdropFilter: "blur(10px)",
                          WebkitBackdropFilter: "blur(10px)",
                          borderRadius: "0px",
                          zIndex: 1,
                        }
                      }}
                      cursor="pointer"
                      onClick={() => handleResultClick(result)}
                    >
                      <Box position="relative" zIndex="2" display="flex" alignItems="center" width="100%">
                        <Image
                          src={result.thumbnailUrl}
                          alt={result.title ?? "Unknown"}
                          borderRadius="full"
                          boxSize="30px"
                          mr="10px"
                        />
                        <Text color="white">{result.title ?? "Unknown"}</Text>
                      </Box>
                    </Flex>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
          <Flex
            display={{  lg: "none", base: "none" }}
            alignItems="center"
            gap={1}
            ml="20px" 
          >
            {menuItems.map((item) => (
              <Button
                key={item.label}
                as={Link}
                href={item.href}
                variant=""
                height="36px"
                width="85px" 
                px={2}      
                fontSize="14px" 
                fontFamily="'BR Hendrix', sans-serif"
                fontWeight="600"
                bg={pathname === item.href ? "rgba(203, 26, 79)" : "transparent"}
                _hover={{
                  bg: pathname === item.href ? "rgba(203, 26, 79)" : "rgba(203, 26, 79)",
                  textDecoration: "none",
                  cursor: "pointer",
                }}
                _focus={{ boxShadow: "none" }}
                _active={{ textDecoration: "none" }}
              >
                {item.label}
              </Button>
            ))}
          </Flex>
        </Flex>
        <Flex alignItems="center" gap={6}>
          {wallet && (
            <Button
              as={Link}
              href="/profile"
              variant="outline"
              height="36px"
              minWidth="120px"
              display={{ lg: "flex", base: "none" }}
              px={4}
              fontFamily="'BR Hendrix', sans-serif"
              fontWeight="600"
              fontSize="14px"
              position="relative"
              color="white"
              bg="transparent"
              border="1px solid gray"
              borderRadius="full"
              _hover={{
                textDecoration: "none",  // Add this line to prevent text underline on hover
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
                  opacity: 0.1,
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
                  border: "2px solid transparent",
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
                textShadow="0 0 0 transparent"
                transition="text-shadow 0.3s ease"
                _groupHover={{
                  textShadow: "0 0 0 white",
                }}
              >
                Owned NFTs
              </Box>
            </Button>
          )}
          <Box display={{  lg: "flex", base: "none" }} 
            justifyContent="flex-end" alignItems="center" height="100%"> 
            <ConnectButton
              client={client}
              connectModal={{ size: "wide" }}
              theme={colorMode}
              connectButton={{
                label: "Connect Wallet",
                style: buttonStyle,
              }}
              detailsButton={{
                style: {
                  ...buttonStyle,
                  background: "transparent",
                  border: "none",
                  boxShadow: "none",
                  padding: "0",
                  minWidth: "auto",
                },
              }}
            />
            <Box display={{ lg: "block" }} ml={6}>
              <SideMenu 
                buttonStyle={sideMenuButtonStyle}
                iconSize={28}
              />
            </Box>
          </Box>
        </Flex>
        <Box display={{ md: "block", lg: "none", base: "block" }}>
          <SideMenu 
            buttonStyle={sideMenuButtonStyle}
            iconSize={28}
          />
        </Box>
      </Flex>
    </Box>
  );
}
