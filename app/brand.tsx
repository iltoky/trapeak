import Image from "next/image";

type BrandLogoProps = Readonly<{
  alt?: string;
  className?: string;
}>;

type BrandIconProps = Readonly<{
  alt?: string;
  className?: string;
  size?: number;
}>;

export function BrandLogo({
  alt = "TRAPEAK",
  className = "",
}: BrandLogoProps) {
  return (
    <Image
      className={`brand-logo ${className}`.trim()}
      src="/brand/trapeak-logo.svg"
      width={210}
      height={50}
      alt={alt}
    />
  );
}

export function BrandIcon({
  alt = "",
  className = "",
  size = 64,
}: BrandIconProps) {
  return (
    <Image
      className={`brand-icon ${className}`.trim()}
      src="/brand/trapeak-app-icon.svg"
      width={size}
      height={size}
      alt={alt}
    />
  );
}
