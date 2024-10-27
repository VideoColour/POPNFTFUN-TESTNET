import { NFT } from "thirdweb/dist/types/utils/nft/parseNft";

// Define the NFTItem interface
export interface NFTItem {
  id: string;
  metadata: {
    name: string;
    image: string;
  };
  owner: string | null;
  tokenURI: string;
  type: string;
  listing?: {
    createdAt: string | number | Date;
    // ... other listing properties
  };
}

export function adaptNFTToNFTItem(nft: NFT, listings: any[]): NFTItem {
  const listing = listings.find(l => l.tokenId === nft.id);
  
  return {
    id: nft.id.toString(),
    metadata: {
      name: nft.metadata?.name || "",
      image: nft.metadata?.image || "",
    },
    owner: nft.owner || null,
    tokenURI: nft.tokenURI,
    type: nft.type,
    listing: listing ? {
      createdAt: listing.createdAt,
      // ... map other listing properties
    } : undefined,
  };
}
