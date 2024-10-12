import { client } from "@/consts/client";
import { useGetENSAvatar } from "@/hooks/useGetENSAvatar";
import { useGetENSName } from "@/hooks/useGetENSName";
import { HamburgerIcon } from "@chakra-ui/icons";
import { Link } from "@chakra-ui/next-js";
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  useColorMode,
  useDisclosure,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useRef } from "react";
import { FaRegMoon, FaTwitter } from "react-icons/fa";
import { IoSunny } from "react-icons/io5";
import {
  ConnectButton,
  useActiveAccount,
  useActiveWallet,
  useDisconnect,
} from "thirdweb/react";
import { FaDiscord, FaTelegramPlane, FaYoutube, FaInstagram } from "react-icons/fa"; 
import { FaXTwitter } from "react-icons/fa6";

export function SideMenu() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef<HTMLButtonElement>(null);
  const { disconnect } = useDisconnect();
  const account = useActiveAccount();
  const { data: ensName } = useGetENSName({ address: account?.address });
  const { data: ensAvatar } = useGetENSAvatar({ ensName });
  const { colorMode, toggleColorMode } = useColorMode();
  const wallet = useActiveWallet();

  useEffect(() => {
    const mainContent = document.getElementById("main-content"); 
    if (mainContent) {
      mainContent.style.filter = isOpen ? "blur(5px)" : "none";
    }
  }, [isOpen]);

  return (
    <>
      <Button
        display={{ md: "block", lg: "block",  base: "block" }}
        ref={btnRef}
        onClick={onOpen}
      >
        <HamburgerIcon />
      </Button>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay
          bg="rgba(0, 0, 0, 0.2)" 
          backdropFilter="blur(6px)" 
        />
        <DrawerContent
          bg="rgba(25, 25, 25, 0.6)" 
          backdropFilter="blur(30px)" 
          color="white" 
          w="80vw"
          maxW="400px"
          borderRadius="30px 0 0 30px" 
          border="2px solid rgba(255, 255, 255, 0.1)" 
          boxShadow="0 0 20px rgba(0, 0, 0, 0.3)" 
        >
          <DrawerCloseButton />

          <DrawerHeader display="flex" justifyContent="space-between">

          </DrawerHeader>

          <DrawerBody display="flex" flexDirection="column" alignItems="flex-start" pl="20px">
            <Box mb={8} display={{ md: "block", lg: "none", base: "block", }}>
              <ConnectButton theme={colorMode} client={client} />
            </Box>

            <Flex flexDirection="column" gap={4} fontSize="lg" fontWeight="bold">
            <Link href="/profile" _hover={{ textDecoration: "none", color: "gray.300" }}>
                Owned Items
              </Link>
              <Link href="/All-Collections" _hover={{ textDecoration: "none", color: "gray.300" }}>
                Explore
              </Link>
              <Link href="/docs" _hover={{ textDecoration: "none", color: "gray.300" }}>
                Docs
              </Link>
            </Flex>
          </DrawerBody>

          <DrawerFooter
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={4}
            borderTop="1px solid rgba(255, 255, 255, 0.1)"
            pt={4}
          >
            <Flex gap={6} mb={4}>
              <FaXTwitter size={24} />
              <FaTelegramPlane size={24} />
            </Flex>

            {account && (
              <Button
                colorScheme="gray"
                onClick={() => {
                  if (wallet) disconnect(wallet);
                }}
              >
                Logout
              </Button>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
