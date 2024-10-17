import React from 'react';
import { Box } from '@chakra-ui/react';

interface BlurredBackdropProps {
  children: React.ReactNode;
}

export const BlurredBackdrop: React.FC<BlurredBackdropProps> = ({ children }) => {
  return (
    <Box position="relative">
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(0, 0, 0, 0.7)"
        backdropFilter="blur(10px)"
        WebkitBackdropFilter="blur(10px)"
        borderRadius="8px"
        boxShadow="0 4px 10px rgba(0, 0, 0, 0.3)"
      />
      <Box position="relative" zIndex={1}>
        {children}
      </Box>
    </Box>
  );
};
