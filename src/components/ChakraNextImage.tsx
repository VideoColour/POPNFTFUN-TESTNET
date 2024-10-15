import { Box } from '@chakra-ui/react'
import NextImage from 'next/image'
import React from 'react'

type BoxProps = React.ComponentProps<typeof Box>;
type NextImageProps = React.ComponentProps<typeof NextImage>;

type ChakraNextImageProps = Omit<NextImageProps, keyof BoxProps> & 
  BoxProps & {
    imgProps?: Partial<NextImageProps>;
  };

export const ChakraNextImage: React.FC<ChakraNextImageProps> = ({
  src,
  alt,
  width,
  height,
  imgProps,
  ...boxProps
}) => {
  return (
    <Box position="relative" overflow="hidden" {...boxProps}>
      <NextImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        onError={(e) => (e.currentTarget.src = '/Molders-01.jpg')} // Add fallback
        {...imgProps}
      />
    </Box>
  )
}
