import { Token } from "@/components/token-page/TokenPage";
import { useRouter } from "next/router";
import { ThirdwebProvider } from "thirdweb/react";

export default function TokenPage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id || typeof id !== "string") {
    return <div>Invalid token ID</div>;
  }

  return (
    <ThirdwebProvider>
      <Token tokenId={BigInt(id)} />
    </ThirdwebProvider>
  );
}
