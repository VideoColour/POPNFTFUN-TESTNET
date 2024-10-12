"use client";
import { NFT_CONTRACTS, type NftContract } from "@/consts/nft_contracts";
import { Box, Button, Flex, Image, Text } from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";
import type { Dispatch, SetStateAction } from "react";
import { getContract, ContractOptions, Chain } from 'thirdweb';
import { client, meldTestnet } from "@/consts/client"; // Adjust the import path as needed

// Modify meldTestnet to use the first RPC URL
const meldTestnetWithId: Chain = {
  ...meldTestnet,
  id: meldTestnet.chainId,
  rpc: meldTestnet.rpc[0], // Use the first RPC URL
  testnet: true, // Explicitly set testnet to true
};

const originalWarn = console.warn;
console.warn = function (...args) {
  if (typeof args[0] === 'string' && args[0].includes('partially resolved')) {
    return;
  }
  originalWarn.apply(console, args);
};

type Props = {
  selectedCollection: NftContract;
  setSelectedCollection: Dispatch<SetStateAction<NftContract>>;
};

export function ProfileMenu(props: Props) {
  const { selectedCollection, setSelectedCollection } = props;
  const account = useActiveAccount();
  const [ownedCollections, setOwnedCollections] = useState<NftContract[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    if (!account || isFetching) return;

    const fetchOwnedCollections = async () => {
      setIsFetching(true);
      const owned: NftContract[] = [];
      for (const nftContract of NFT_CONTRACTS) {
        const contractOptions: ContractOptions<[]> = {
          address: nftContract.address,
          client: client,
          chain: meldTestnetWithId,
        };
        
        const contract = getContract(contractOptions);

        try {
          // This might vary depending on your contract's ABI
          const balance = await (contract as any).balanceOf(account.address);
          
          if (balance && balance > 0) {
            owned.push(nftContract);
          }
        } catch (error) {
          console.error(`Failed to fetch balance for ${nftContract.title}:`, error);
        }
      }

      setOwnedCollections(owned);
      setIsFetching(false);
    };

    fetchOwnedCollections();
  }, [account]);

  if (isFetching) {
    return <Text>Loading your collections...</Text>;
  }

  if (ownedCollections.length === 0) {
    return <Text>No collections found for this wallet.</Text>;
  }

  return (
    <Box w={{ lg: "300px", base: "90vw" }}>
      <Text fontSize="lg" mb="10px">Collections</Text>
      {ownedCollections.map((item: NftContract) => (
        <Box
          key={item.address}
          mb="10px"
          as={Button}
          h="56px"
          bg="transparent"
          _hover={{ bg: "transparent" }}
          opacity={item.address === selectedCollection.address ? 1 : 0.4}
          onClick={() => setSelectedCollection(item)}
        >
          <Flex direction="row" gap="3">
            <Image
              src={item.thumbnailUrl ?? ""}
              w="40px"
              h="40px"
              borderRadius="8px"
              objectFit="cover"
            />
            <Box my="auto">
              <Text>{item.title ?? "Unknown collection"}</Text>
            </Box>
          </Flex>
        </Box>
      ))}
    </Box>
  );
}
