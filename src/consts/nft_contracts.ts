import type { Chain } from "thirdweb";

export const meldTestnet: Chain = {
  name: "Meld Testnet",
  id: 222000222, 
  rpc: "https://testnet-rpc.meld.com",
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
  rpc: "https://testnet-rpc.meld.com", 
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
};






export const NFT_CONTRACTS: NftContract[] = [
  {
    address: "0x0307Cd59fe2Ac48C8573Fda134ed75E78bb94ECA",
    chain: meldTestnet,
    title: "Galactic Eyes",
    thumbnailUrl:
      "https://ipfs.io/ipfs/QmXTUrNhqzfq6KxwrhKgF1cZDG5oKVuJWvC7oEzFNt9B1w/ezgif-7-09165e0bdc.gif",
    type: "ERC721",
  },


  {
    address: "0x29B89B40Ab77A59048161370990164d3D3E3ADbF",
    chain: meldTestnet,
    title: "MeldBankManager",
    thumbnailUrl: "https://pfp.jpgstoreapis.com/b06729158210bf1ba13f8f3d7d422a918d3eaa82561a705552a2568b-hero",
    type: "ERC721",
  },
  {
    address: "0xEdc67F3f52D9afd84D0487BD3b830a83c98FEe2B",
    chain: meldTestnet,
    title: "Torus",
    thumbnailUrl: "https://ipfs.io/ipfs/QmbhqP1kN1jjNbJzQMj5f9iN7s6JrQYKBeHvdxvdGpHoNb",
    type: "ERC1155",
  },
  {
    address: "0x2220001D2CFb9B6066A91dE5D4e861A21f549BA0",
    chain: meldTestnet,
    title: "MeldStakingNFT",
    thumbnailUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8ejv86ODBa1mOj91QPsZ3xQRK7KQJc7GmmA&s",
    type: "ERC721",
  },
  {
    address: "0xf88c4df6D56011bf0c2c3014d1b11E25055c0f19",
    chain: meldTestnet,
    title: "MOTHER-721",
    thumbnailUrl: "https://s3.coinmarketcap.com/static-gravity/image/bba3f09ec18a43baaf06214693e0f09f.jpg",
    type: "ERC721",
  },
  {
    address: "0xd49ec1EbBB09D5f92284E4f534094F662C955Fd2",
    chain: meldTestnet,
    title: "MELD Diamond Hand",
    thumbnailUrl: "https://ipfs5.jpgstoreapis.com/ipfs/QmeNhNhTHFgiEo8hqYbFeLv5PBwm2Ab1gs2cTXaSVSdh9r",
    type: "ERC721",
  },
  {
    address: "0xBA2c5021E495d2354baa613164a3c1D92d4CEece",
    chain: meldTestnet,
    title: "MintableNFT ",
    thumbnailUrl: "https://www.nftculture.com/wp-content/uploads/2021/03/logo.png",
    type: "ERC721",
  },
];
