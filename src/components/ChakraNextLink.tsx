import NextLink from 'next/link'
import { Link as ChakraLink, LinkProps as ChakraLinkProps } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'

interface ChakraNextLinkProps extends ChakraLinkProps {
  href: string
}

export const ChakraNextLink = ({ href, children, ...props }: PropsWithChildren<ChakraNextLinkProps>) => {
  return (
    <NextLink href={href} passHref legacyBehavior>
      <ChakraLink {...props}>{children}</ChakraLink>
    </NextLink>
  )
}