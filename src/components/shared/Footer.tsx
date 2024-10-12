import { Box, Flex, Link, Text } from "@chakra-ui/react";
import { FaHeart } from "react-icons/fa";

export function Footer() {
  return (
    <Box
      bg="rgba(0, 0, 0, 0.1)"
      color="white"
      py={4}
      px={{ base: "12px", lg: "22px" }}
      position="relative"
      bottom={0}
      width="100%"
    >
      <Flex
        direction={{ base: "row", md: "row" }}
        justifyContent="space-between"
        alignItems="center"
        maxW="1200px"
        mx="auto"
        wrap="wrap"
        textAlign={{ base: "left", md: "left" }}
      >
        <Flex alignItems="center" mb={{ base: 0, md: 0 }} w={{ base: "auto", md: "auto" }} justifyContent={{ base: "flex-start", md: "flex-start" }}>
          <Text fontFamily="'BR Hendrix', sans-serif" fontWeight="400">
          </Text>
          <Link
            href="https://forms.gle/iB3ujxBRPy6Q9AFG9"
            isExternal
            fontWeight="600"
            ml={1}
            _hover={{ color: "rgba(229, 27, 68)" }}
            _focus={{ boxShadow: "none" }}
            textDecoration="none"
          >
            Feedback
          </Link>
        </Flex>

        <Flex mt={{ base: 0, md: 0 }} gap={4} w={{ base: "auto", md: "auto" }} justifyContent={{ base: "center", md: "center" }}>
          <Link
           href="/All-Collections"
           _hover={{ color: "rgba(229, 27, 68)" }}
            _focus={{ boxShadow: "none" }}
            textDecoration="none"
          >
            Explore
          </Link>
          <Link
            href="https://www.meldhive.com/"
            _hover={{ color: "rgba(229, 27, 68)" }}
            _focus={{ boxShadow: "none" }}
            textDecoration="none"
          >
            Docs
          </Link>
          <Link
            href="/profile"
            _hover={{ color: "rgba(229, 27, 68)" }}
            _focus={{ boxShadow: "none" }}
            textDecoration="none"
          >
            Profile
          </Link>
        </Flex>

        <Link
          href="https://thirdweb.com"
          isExternal
          mt={{ base: 0, md: 0 }}
          _hover={{ textDecoration: "none" }}
          _focus={{ boxShadow: "none" }}
          w={{ base: "auto", md: "auto" }}
          textAlign={{ base: "right", md: "right" }}
        >
          Powered by{" "}
          <Text
            as="span"
            fontWeight="bold"
            color="white"
            _hover={{ color: "rgba(229, 27, 68)" }}
          >
            Thirdweb
          </Text>
        </Link>
      </Flex>
    </Box>
  );
}