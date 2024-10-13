"use client";

import { NFT_CONTRACTS } from "@/consts/nft_contracts";
import { ChakraNextLink } from '@/components/ChakraNextLink'
import {
  Box,
  Flex,
  Heading,
  Image,
  Text,
} from "@chakra-ui/react";

export default function Home() {
  return (
    <Flex direction="column">
      <Box mt="24px" m="auto">
        <Flex direction="column" gap="4">
          <Heading ml="20px" mt="40px">
            All Featured Collections
          </Heading>
          <Flex
            direction="row"
            wrap="wrap"
            mt="20px"
            gap="4"
            justifyContent="space-evenly"
          >
            {NFT_CONTRACTS.map((item) => (
              <ChakraNextLink
                _hover={{ 
                  textDecoration: "none", 
                  boxShadow: "0 6px 15px rgba(0, 0, 0, 0.3)",
                  transform: "scale(1.05)",
                  transition: "all 0.2s ease-in-out"
                }}
                w={180}
                h={215}
                key={item.address}
                href={`/collection/${item.chain.id.toString()}/${item.address}`}
                borderRadius="16px"
                boxShadow="0 4px 12px rgba(0, 0, 0, 0.2)"
                bg="rgba(25, 25, 25, 0.03)"
                border="1px solid rgb(222, 222, 222, 0.1)"
                p="10px"
              >
                <Image 
                  src={item.thumbnailUrl} 
                  alt={item.title}
                  w="160px"
                  h="160px"
                  borderRadius="12px"
                  objectFit="cover"
                />
                <Text fontSize="large" mt="10px" textAlign="center">
                  {item.title}
                </Text>
              </ChakraNextLink>
            ))}
          </Flex>
        </Flex>
      </Box>
    </Flex>
  );
}
