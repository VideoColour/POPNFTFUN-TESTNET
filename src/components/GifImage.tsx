import Image from 'next/image';

interface GifImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
}

const GifImage: React.FC<GifImageProps> = ({ src, alt, width, height }) => {
  return <Image src={src} alt={alt} width={width} height={height} unoptimized />;
};

export default GifImage;