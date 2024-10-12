import React, { useState, useRef } from "react";
import {
  Button,
  Flex,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  Image,
  useToast,
  Box,
} from "@chakra-ui/react";
import { useActiveWalletChain, useSwitchActiveWalletChain, useSendTransaction } from "thirdweb/react";
import { makeOffer } from "thirdweb/extensions/marketplace";
import { SUPPORTED_TOKENS, Token } from "@/consts/supported_tokens";
import { useMarketplaceContext } from "@/hooks/useMarketplaceContext";
import type { Account } from "thirdweb/wallets";

type Props = {
  tokenId: bigint; 
  account: Account;
  listingId?: string;
  marketplace: any;
  listingType: "direct-listing" | "auction"; 
};

export function MakeOffer({ tokenId, account, listingId, marketplace, listingType }: Props) {
  const { supportedTokens, marketplaceContract, nftContract, type } = useMarketplaceContext();
  const offerRef = useRef<HTMLInputElement>(null);
  const [currency, setCurrency] = useState<Token>();
  const toast = useToast();
  const switchChain = useSwitchActiveWalletChain();
  const activeChain = useActiveWalletChain();
  const sendTransaction = useSendTransaction();

  const options: Token[] = supportedTokens || SUPPORTED_TOKENS;

  console.log("Context: ", { type, marketplaceContract, nftContract });

  const handleMakeOffer = async () => {
    const value = offerRef.current?.value;

    console.log("--- Make Offer Details ---");
    console.log("Token ID:", tokenId.toString());
    console.log("Account:", account);
    console.log("Listing ID:", listingId);
    console.log("Marketplace:", marketplace);
    console.log("Offer Value:", value);
    console.log("Selected Currency:", currency);
    console.log("Active Chain:", activeChain);
    console.log("Marketplace Contract:", marketplaceContract);
    console.log("NFT Contract:", nftContract);

    if (!value || !currency || !marketplace || typeof marketplace !== "object" || !marketplaceContract || !nftContract) {
      console.error("Invalid input. Missing required fields.");
      toast({
        title: "Invalid input",
        description: "Please check all fields and try again.",
        status: "error",
        isClosable: true,
        duration: 5000,
      });
      return;
    }

    if (type !== "ERC721" && type !== "ERC1155") {
      toast({
        title: "Unsupported Token Type",
        description: "The token must be of type ERC721 or ERC1155 to make an offer.",
        status: "error",
        isClosable: true,
        duration: 5000,
      });
      return;
    }

    try {
      if (activeChain?.id !== marketplaceContract.chain.id) {
        console.log("Chain mismatch. Attempting to switch...");
        await switchChain(marketplaceContract.chain);
        console.log("Chain switched successfully");
      }

      console.log("Preparing offer transaction...");
      const offerTx = makeOffer({
        contract: marketplaceContract,
        assetContractAddress: nftContract.address,
        tokenId,
        currencyContractAddress: currency.tokenAddress,
        totalOffer: value,
        offerExpiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), 
      });

      console.log("Offer transaction prepared:", offerTx);

      console.log("Sending transaction...");
      const transaction = await sendTransaction.mutateAsync(offerTx);
      console.log("Transaction sent:", transaction);

      console.log("Waiting for transaction to be mined...");
      const receipt = await transaction;
      console.log("Transaction mined. Receipt:", receipt);

      toast({
        title: "Offer made successfully",
        description: `Transaction hash: ${receipt.transactionHash}`,
        status: "success",
        isClosable: true,
        duration: 5000,
      });
    } catch (error) {
      console.error("Error making offer:", error);
      toast({
        title: "Error making offer",
        description: `An error occurred while making the offer: ${(error as Error).message}`,
        status: "error",
        isClosable: true,
        duration: 5000,
      });
    }
  };

  return (
    <Flex
      direction="column"
      w={{ base: "85vw", sm: "370px", md: "230px", lg: "290px", xl: "400px", xxl: "400px" }}
      gap="8px"
      p={{ base: "20px", md: "10px" }}
      borderRadius="15px"
      bg="rgba(0, 0, 0, 0.07)"
    >
      <Box>
        <Text>Offer Amount</Text>
        <Input type="number" ref={offerRef} placeholder="Enter an offer price" />
      </Box>

      <Menu matchWidth>
        <MenuButton minH="48px" as={Button} w="100%" size={{ base: "sm", md: "md" }}>
          {currency ? (
            <Flex direction="row" justifyContent="center">
              <Image boxSize={{ base: "1.5rem", md: "2rem" }} borderRadius="full" src={currency.icon} mr={{ base: "8px", md: "12px" }} />
              <Text fontSize={{ base: "xs", md: "md" }} my="auto">
                {currency.symbol}
              </Text>
            </Flex>
          ) : (
            "Select currency"
          )}
        </MenuButton>
        <MenuList
          w="100%"
          bg="rgba(0, 0, 0, 0.15)"
          backdropFilter="blur(5px)"
          borderRadius="10px"
          padding="0px"
          left="0"
          sx={{
            "& .chakra-menu__menuitem": {
              _focus: { bg: "transparent", boxShadow: "none", outline: "none" },
              _hover: { bg: "rgba(0, 0, 0, 0.18)", rounded: "20px" },
              "--menu-bg": "transparent",
            },
          }}
        >
          {options.map((token) => (
            <MenuItem
              key={token.tokenAddress}
              onClick={() => setCurrency(token)}
              display="flex"
              flexDir="row"
              justifyContent="center"
            >
              <Image boxSize="2rem" borderRadius="full" src={token.icon} ml="2px" mr="14px" />
              <Text my="auto">{token.symbol}</Text>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>

      <Button
        isDisabled={!currency}
        onClick={handleMakeOffer}
        w="100%"
        size={{ base: "sm", md: "md" }}
        borderRadius="15px"
        bg="rgba(0, 0, 0, 0.15)"
        _hover={{ bg: "rgba(0, 0, 0, 0.25)" }}
      >
        Make Offer
      </Button>
    </Flex>
  );
}
