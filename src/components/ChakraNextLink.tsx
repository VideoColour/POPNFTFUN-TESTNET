import NextLink from 'next/link'
import { Link as ChakraLink } from '@chakra-ui/react'
import type { ComponentProps } from 'react'

type ChakraNextLinkProps = ComponentProps<typeof ChakraLink> & { href: string }

export const ChakraNextLink = ({ href, children, ...props }: ChakraNextLinkProps) => {
  return (
    <NextLink href={href} passHref legacyBehavior>
      <ChakraLink {...props}>{children}</ChakraLink>
    </NextLink>
  )
}