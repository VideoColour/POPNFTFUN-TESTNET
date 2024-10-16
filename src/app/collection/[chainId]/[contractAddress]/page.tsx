import { Collection } from "@/components/collection-page/Collection";

interface CollectionPageProps {
  params: {
    chainId: string;
    contractAddress: string;
  };
}

export default function CollectionPage({ params }: CollectionPageProps) {
  const { chainId, contractAddress } = params;

  console.log("CollectionPage rendered with params:", { chainId, contractAddress });

  return <Collection chainId={chainId} contractAddress={contractAddress} />;
}
