import { Box, Skeleton, Flex } from "@chakra-ui/react";

export function NFTCardSkeleton() {
  return (
    <Box
      position="relative"
      width="100%"
      height="473px"
      overflow="hidden"
      padding="6px"
    >
      <Box
        rounded="12px"
        bg="rgba(28, 28, 28, 0.6)"
        border="1px solid rgb(222, 222, 222, 0.1)"
        p="15px"
        width="100%"
        height="100%"
        display="flex"
        flexDirection="column"
      >
        <Box
          width="100%"
          height="320px"
          overflow="hidden"
          borderRadius="8px"
          position="relative"
        >
          <Skeleton height="100%" width="100%" />
        </Box>
        
        <Flex justifyContent="space-between" alignItems="center" mt="10px">
          <Skeleton height="24px" width="80%" />
          <Skeleton height="24px" width="24px" borderRadius="full" />
        </Flex>
        
        <Flex 
          justifyContent="space-between" 
          alignItems="center" 
          w="102%" 
          height="100%"
          mt="auto" 
          borderRadius="8px" 
          p="12px" 
          bg="rgb(40, 40, 40, 0.8)"
          position="relative"
          left="50%"
          transform="translateX(-50%)"
          mb="-4px"
        >
          <Box>
            <Skeleton height="14px" width="40px" mb="4px" />
            <Skeleton height="18px" width="80px" />
          </Box>
          <Skeleton height="36px" width="100px" borderRadius="md" />
        </Flex>
      </Box>
    </Box>
  );
}
