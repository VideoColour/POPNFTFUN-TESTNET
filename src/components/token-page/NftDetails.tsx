import { useMarketplaceContext } from "@/hooks/useMarketplaceContext";
import { ChakraNextLink } from '@/components/ChakraNextLink';
import { AccordionPanel, Box, Flex, Text } from "@chakra-ui/react";
import type { NFT } from "thirdweb";
import { shortenAddress } from "thirdweb/utils";

type Props = {
  nft?: NFT; 
};

export function NftDetails({ nft }: Props) {
  const { type, nftContract } = useMarketplaceContext();

  if (!nft) {
    return <Text>No NFT details available.</Text>;
  }

  const contractUrl = `${
    nftContract.chain.blockExplorers
      ? nftContract.chain.blockExplorers[0]?.url
      : ""
  }/address/${nftContract.address}`;

  const tokenUrl = `${
    nftContract.chain.blockExplorers
      ? nftContract.chain.blockExplorers[0]?.url
      : ""
  }/nft/${nftContract.address}/${nft.id.toString()}`;

  return (
    <Box>
      <Flex direction="row" justifyContent="space-between" mb="1">
        <Text>Contract address</Text>
        <ChakraNextLink color="purple" href={contractUrl} target="_blank">
          {shortenAddress(nftContract.address)}
        </ChakraNextLink>
      </Flex>
      <Flex direction="row" justifyContent="space-between" mb="1">
        <Text>Token ID</Text>
        <ChakraNextLink color="purple" href={tokenUrl} target="_blank">
          {nft?.id.toString()}
        </ChakraNextLink>
      </Flex>
      <Flex direction="row" justifyContent="space-between" mb="1">
        <Text>Token Standard</Text>
        <Text>{type}</Text>
      </Flex>
      <Flex direction="row" justifyContent="space-between" mb="1">
        <Text>Chain</Text>
        <Text>{nftContract.chain.name ?? "Unnamed chain"}</Text>
      </Flex>
    </Box>
  );
}
