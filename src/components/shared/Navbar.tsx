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
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    console.log("Search query changed:", query);

    if (query.length > 0) {
      const results = fetchSearchResults(query);
      console.log("Setting search results:", results);
      setSearchResults(results);
    } else {
      console.log("Clearing search results");
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
      backdropFilter="blur(26px)"
      bg="rgba(0, 0, 0, 0.02)"
      boxShadow="0 4px 10px rgba(0, 0, 0, 0.02)"
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
                ref={searchInputRef}
                placeholder="Search for Collections"
                fontSize={{ base: "13px", lg: "13px" }}
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchFocused(true)}
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
            {isSearchFocused && searchQuery && searchResults.length > 0 && (
              <Box
                position="absolute"
                top="45px"
                left="0"
                width="100%"
                zIndex="20"
                bg="rgba(20, 20, 20, 0.8)"
                borderRadius="8px"
                maxHeight="300px"
                overflowY="auto"
                boxShadow="lg"
                padding="10px"
                border="1px solid rgba(255, 255, 255, 0.2)"
              >
                {searchResults.map((result, index) => (
                  <Flex
                    key={index}
                    alignItems="center"
                    p="10px"
                    _hover={{
                      bg: "rgba(15, 15, 15, 0.7)",
                      borderRadius: "22px",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
                    }}
                    cursor="pointer"
                    onClick={() => handleResultClick(result)}
                  >
                    <Image
                      src={result.thumbnailUrl}
                      alt={result.title ?? "Unknown"}
                      borderRadius="full"
                      boxSize="30px"
                      mr="10px"
                    />
                    <Text color="white">{result.title ?? "Unknown"}</Text>
                  </Flex>
                ))}
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
              width="110px"
              display={{  lg: "flex", base: "none" }}
              px={4}
              fontFamily="'BR Hendrix', sans-serif"
              fontWeight="650"
              bg={pathname === "/profile" ? "rgba(203, 26, 79)" : "transparent"}
              _hover={{
                bg: pathname === "/profile" ? "rgba(203, 26, 79)" : "rgba(203, 26, 79)",
                textDecoration: "none",
              }}
              _focus={{ boxShadow: "none" }}
              _active={{ textDecoration: "none" }}
            >
              Owned NFTs
            </Button>
          )}
          <Box display={{  lg: "flex", base: "none" }} 
            justifyContent="flex-end" alignItems="center" height="100%"> 
            <ConnectButton
              client={client}
              connectModal={{ size: "wide" }}
              theme={colorMode}
              connectButton={{
                style: {
                  height: "36px",
                  minWidth: "120px",
                  background: "rgba(255, 255, 255, 0.1)", 
                  color: "white", 
                  border: "1px solid rgba(255, 255, 255, 0.3)", 
                  borderRadius: "12px",
                  backdropFilter: "blur(12px)", 
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.3)", 
                  transition: "all 0.2s ease-in-out",
                },
              }}
            />
            <Box display={{ lg: "block" }} ml={6}>
              <SideMenu />
            </Box>
          </Box>
        </Flex>
        <Box display={{ md: "block", lg: "none", base: "block" }} >
          <SideMenu />
        </Box>
      </Flex>
    </Box>
  );
}
