
import { getContract, Chain } from "thirdweb";

export const meldTestnet: Chain = {
  name: "Meld Testnet",
  id: 222000222, 
  rpc: "https://testnet-rpc.meld.com", 
  blockExplorers: [
    {
      name: "Meld Explorer",
      url: "https://testnet.meldscan.io", 
    },
  ],
  testnet: true,
};

export const NETWORK = meldTestnet;

type MarketplaceContract = {
  [x: string]: any;
  address: string;
  chain: Chain;
};


export const MARKETPLACE_CONTRACTS: MarketplaceContract[] = [
  {
    address: "0x0cbC65F23dd08Cf4BaE58197639Ea1490Fd3D8AC",
    chain: meldTestnet,
  }
];