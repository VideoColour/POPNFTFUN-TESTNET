import type { Chain } from "thirdweb";

export const meldTestnet: Chain = {
  name: "Meld Testnet",
  id: 222000222, 
  rpc: "https://222000222.rpc.thirdweb.com", 
  nativeCurrency: {
    name: "gMeld",
    symbol: "gMELD",
    decimals: 18,
  },
  blockExplorers: [
    {
      name: "Meld Explorer",
      url: "https://testnet.meldscan.io",
    },
  ],
  testnet: true,
};

export const meldChain: Chain = {
  name: "Meld Chain",
  id: 333000333, 
  rpc: "https://333000333.rpc.thirdweb.com", 
  nativeCurrency: {
    name: "gMeld",
    symbol: "gMELD", 
    decimals: 18,
  },
  blockExplorers: [
    {
      name: "Meld Explorer",
      url: "https://meldscan.io", 
    },
  ],
  testnet: true,
};

export type NftContract = {
  address: string;
  chain: Chain;
  type: "ERC1155" | "ERC721";

  title?: string;
  description?: string;
  thumbnailUrl?: string;
  slug?: string;
  name?: string;
  avatarUrl?: string;
  profileUrl?: string;
};






export const NFT_CONTRACTS: NftContract[] = [
  {
    address: "0xd49ec1EbBB09D5f92284E4f534094F662C955Fd2",
    chain: meldTestnet,
    title: "MELD Diamond Hand",
    name: "MELD",
    thumbnailUrl: "https://ipfs5.jpgstoreapis.com/ipfs/QmeNhNhTHFgiEo8hqYbFeLv5PBwm2Ab1gs2cTXaSVSdh9r",
    type: "ERC721",
    description: "Thank you for supporting MELD from the very beginning.",
     avatarUrl: "https://pbs.twimg.com/profile_images/1753368023266910208/DUXyFw6X_400x400.png",
 profileUrl: "https://x.com/onMELD"
  },

  {
    address: "0x0307Cd59fe2Ac48C8573Fda134ed75E78bb94ECA",
    chain: meldTestnet,
    title: "Galactic Eyes",
    thumbnailUrl:
      "/Galactic-Vision-Collection-photo.gif",
    type: "ERC721",
    name: "VideoColour",
    description: "Galactic Eyes is a collection of 300 NFTs living on the MELD blockchain.",
    avatarUrl: "/home_creator_1.jpg",
    profileUrl: "https://x.com/VideoColour"
  },

  {
    address: "0x29B89B40Ab77A59048161370990164d3D3E3ADbF",
    chain: meldTestnet,
    title: "Bank Managers",
    thumbnailUrl: "https://pfp.jpgstoreapis.com/b06729158210bf1ba13f8f3d7d422a918d3eaa82561a705552a2568b-hero",
    type: "ERC721",
    name: "MELD",
    description: "MELD Bank Managers are a community NFT for the MELD protocol. The Bank Managers provide both identity to MELD users and utility to the lending & borrowing protocol. A Bank Manager will boost in yield when supplying by 0.3% and if you apply it to borrowing it will reduce the interest rate by 0.3%.",
 avatarUrl: "https://pbs.twimg.com/profile_images/1753368023266910208/DUXyFw6X_400x400.png",
 profileUrl: "https://x.com/onMELD"
  },
  {
    address: "0xEdc67F3f52D9afd84D0487BD3b830a83c98FEe2B",
    chain: meldTestnet,
    title: "Torus",
    name: "MELD",
    thumbnailUrl: "https://ipfs.io/ipfs/QmbhqP1kN1jjNbJzQMj5f9iN7s6JrQYKBeHvdxvdGpHoNb",
    type: "ERC1155",
    description: "An unknown matter, created from bridging into the MELD world. The genesis, V = 2π² Rr².",
     avatarUrl: "https://pbs.twimg.com/profile_images/1753368023266910208/DUXyFw6X_400x400.png",
 profileUrl: "https://x.com/onMELD"
  },

];
