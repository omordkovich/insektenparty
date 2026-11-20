import Image from "next/image";

// Logo is fixed at w-64 (256px), so half its width is a constant here.
const LOGO_HALF_WIDTH = 128;
const ACCENT_GAP = 24;
const ACCENT_OFFSET = `calc(50% + ${LOGO_HALF_WIDTH}px + ${ACCENT_GAP}px)`;
// Floating accents are shown at a fixed 110px. The size must be set
// explicitly: with "w-auto" it would follow the loaded file, and the 2x
// srcset variant (capped at the 128px source by Cloudinary's c_limit) then
// renders at half size on high-DPI screens.
const ACCENT_SIZE = 110;

// The two floating graphics left and right of a theme's 256px logo (event
// header, design pages). The parent must be `relative` and centre the logo.
export function FloatingAccents({ accentOne, accentTwo }: { accentOne?: string; accentTwo?: string }) {
  return (
    <>
      {accentOne ? (
        <Image
          src={accentOne}
          alt=""
          width={ACCENT_SIZE}
          height={ACCENT_SIZE}
          aria-hidden="true"
          className="floating-accent animate-buzz top-1/2 h-[110px] w-[110px] -translate-y-1/2"
          style={{ right: ACCENT_OFFSET }}
          priority
        />
      ) : null}
      {accentTwo ? (
        <Image
          src={accentTwo}
          alt=""
          width={ACCENT_SIZE}
          height={ACCENT_SIZE}
          aria-hidden="true"
          className="floating-accent animate-float top-1/2 h-[110px] w-[110px] -translate-y-1/2"
          style={{ left: ACCENT_OFFSET }}
          priority
        />
      ) : null}
    </>
  );
}
