import { client } from "@/consts/client";
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

const MARKETPLACE_ADDRESS = "0x0cbC65F23dd08Cf4BaE58197639Ea1490Fd3D8AC";
export const MARKETPLACE = getContract({
  address: MARKETPLACE_ADDRESS,
  client,
  chain: NETWORK, 
});

const NFT_COLLECTION_ADDRESS = "0x0307Cd59fe2Ac48C8573Fda134ed75E78bb94ECA";
export const NFT_COLLECTION = getContract({
  address: NFT_COLLECTION_ADDRESS,
  client,
  chain: NETWORK, 
});

export const ETHERSCAN_URL = "https://testnet.meldscan.io";

export const contracts = {
  nftContract: "0xYourNFTContractAddressHere",
  marketplaceContract: "0xYourMarketplaceContractAddressHere",
};
