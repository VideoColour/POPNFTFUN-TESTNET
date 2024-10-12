import { Token } from "@/consts/supported_tokens";
import { useMarketplaceContext } from "@/hooks/useMarketplaceContext";
import { ChevronDownIcon } from "@chakra-ui/icons";
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
import { useRef, useState } from "react";
import { sendAndConfirmTransaction } from "thirdweb";
import {
  isApprovedForAll as isApprovedForAll1155,
  setApprovalForAll as setApprovalForAll1155,
} from "thirdweb/extensions/erc1155";
import {
  isApprovedForAll as isApprovedForAll721,
  setApprovalForAll as setApprovalForAll721,
} from "thirdweb/extensions/erc721";
import { createListing } from "thirdweb/extensions/marketplace";
import {
  useActiveWalletChain,
  useSwitchActiveWalletChain,
} from "thirdweb/react";
import type { Account } from "thirdweb/wallets";

type Props = {
  tokenId: bigint;
  account: Account;
};

export function CreateListing(props: Props) {
  const priceRef = useRef<HTMLInputElement>(null);
  const qtyRef = useRef<HTMLInputElement>(null);
  const { tokenId, account } = props;
  const switchChain = useSwitchActiveWalletChain();
  const activeChain = useActiveWalletChain();
  const [currency, setCurrency] = useState<Token>();
  const toast = useToast();

  const {
    nftContract,
    marketplaceContract,
    refetchAllListings,
    type,
    supportedTokens,
  } = useMarketplaceContext();

  const options: Token[] = supportedTokens;

  return (
    <Flex
      direction="column"
      w={{ base: "85vw", sm: "370px", md: "230px", lg: "290px", xl: "400px", xxl: "400px" }} 
      gap="8px"
      p={{ base: "20px", md: "10px" }} 
      borderRadius="15px"
      bg="rgba(0, 0, 0, 0.07)"
    >
      {type === "ERC1155" ? (
        <Flex direction="row" flexWrap="wrap" justifyContent="space-between">
          <Box>
            <Text>Price</Text>
            <Input type="number" ref={priceRef} placeholder="Enter a price" />
          </Box>
          <Box>
            <Text>Quantity</Text>
            <Input type="number" ref={qtyRef} defaultValue={1} placeholder="Quantity to sell" />
          </Box>
        </Flex>
      ) : (
        <>
          <Text>Listing Price</Text>
          <Input type="number" ref={priceRef} placeholder="Enter a price" />
        </>
      )}

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
              _focus: {
                bg: "transparent",
                boxShadow: "none",
                outline: "none",
              },
              _hover: {
                bg: "rgba(0, 0, 0, 0.18)",
                rounded: "20px",
              },
              "--menu-bg": "transparent",
            },
          }}
        >
          {options.map((token) => (
            <MenuItem key={token.tokenAddress} onClick={() => setCurrency(token)} display="flex" flexDir="row" justifyContent="center">
              <Image boxSize="2rem" borderRadius="full" src={token.icon} ml="2px" mr="14px" />
              <Text my="auto">{token.symbol}</Text>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>

      <Button
        isDisabled={!currency}
        onClick={async () => {
          const value = priceRef.current?.value;
          if (!value) {
            return toast({
              title: "Please enter a price for this listing",
              status: "error",
              isClosable: true,
              duration: 5000,
            });
          }
          if (!currency) {
            return toast({
              title: `Please select a currency for the listing`,
              status: "error",
              isClosable: true,
              duration: 5000,
            });
          }
          if (activeChain?.id !== nftContract.chain.id) {
            await switchChain(nftContract.chain);
          }
          const _qty = BigInt(qtyRef.current?.value ?? 1);
          if (type === "ERC1155") {
            if (!_qty || _qty <= 0n) {
              return toast({
                title: "Error",
                description: "Invalid quantity",
                status: "error",
                isClosable: true,
                duration: 5000,
              });
            }
          }

          const checkApprove = type === "ERC1155" ? isApprovedForAll1155 : isApprovedForAll721;

          const isApproved = await checkApprove({
            contract: nftContract,
            owner: account.address,
            operator: marketplaceContract.address,
          });

          if (!isApproved) {
            const setApproval = type === "ERC1155" ? setApprovalForAll1155 : setApprovalForAll721;

            const approveTx = setApproval({
              contract: nftContract,
              operator: marketplaceContract.address,
              approved: true,
            });

            await sendAndConfirmTransaction({
              transaction: approveTx,
              account,
            });
          }

          const transaction = createListing({
            contract: marketplaceContract,
            assetContractAddress: nftContract.address,
            tokenId,
            quantity: type === "ERC721" ? 1n : _qty,
            currencyContractAddress: currency?.tokenAddress,
            pricePerToken: value,
          });

          await sendAndConfirmTransaction({
            transaction,
            account,
          });
          refetchAllListings();
        }}
      >
        List
      </Button>
    </Flex>
  );
}
