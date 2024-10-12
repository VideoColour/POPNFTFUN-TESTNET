import type { Chain } from "thirdweb";

import { meldTestnet } from "./chains"; 

export type Token = {
  tokenAddress: string;
  symbol: string;
  icon: string;
  decimals: number; 
};

export type SupportedTokens = {
  chain: Chain;
  tokens: Token[];
};

export const SUPPORTED_TOKENS: SupportedTokens[] = [
  {
    chain: {
      ...meldTestnet,
      rpc: meldTestnet.rpc[0], 
    },
    tokens: [
      {
        tokenAddress: "0x22200025a5bC2C7dA9C8Ed6c051A58E12EfA7501", 
        symbol: "MELD",
        icon: "https://avatars.githubusercontent.com/u/53253566?s=200&v=4", 
        decimals: 18, 
      },
      {
        tokenAddress: "0x111111abd9aef0413C2c8792803C68C6CBaa1BA2", 
        symbol: "USDT",
        icon: "/erc20-icons/usdt.png", 
        decimals: 6, 
      },
    ],
  },
];
