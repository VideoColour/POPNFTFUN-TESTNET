import Image from 'next/image';

interface GifImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}

const GifImage: React.FC<GifImageProps> = ({ src, alt, width, height }) => {
  const [cid, filename] = src.replace('ipfs://', '').split('/');
  const proxyUrl = `/api/ipfs-proxy?cid=${encodeURIComponent(cid)}&filename=${encodeURIComponent(filename)}`;
  
  return <img src={proxyUrl} alt={alt} width={width} height={height} style={{ objectFit: 'cover', borderRadius: '8px' }} />;
};

export default GifImage;
