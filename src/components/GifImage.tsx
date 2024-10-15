import Image from 'next/image';

interface GifImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}

const GifImage: React.FC<GifImageProps> = ({ src, alt, width, height }) => {
  const proxyUrl = `/api/ipfs-proxy?cid=${encodeURIComponent(src.split('/')[2])}&filename=${encodeURIComponent(src.split('/')[3])}`;
  
  return <Image src={proxyUrl} alt={alt} width={width} height={height} unoptimized />;
};

export default GifImage;
