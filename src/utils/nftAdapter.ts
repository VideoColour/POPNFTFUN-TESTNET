import { NFT } from "thirdweb/dist/types/utils/nft/parseNft";

// Define the NFTItem interface
export interface NFTItem {
  id: string;
  metadata: {
    name: string;
    image: string;
  };
  owner?: string | null;
  tokenURI?: string;
  type?: string;
}

export function adaptNFTToNFTItem(nft: NFT): NFTItem {
  return {
    id: nft.id.toString(),
    metadata: {
      name: nft.metadata?.name || `NFT #${nft.id}`,
      image: nft.metadata?.image || '',
    },
    owner: nft.owner,
    tokenURI: nft.tokenURI,
    type: nft.type,
  };
}
