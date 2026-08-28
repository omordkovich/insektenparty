import Image from "next/image";

export function Header() {
  return (
    <header className="page-shell relative flex items-center justify-center pt-6 pb-4">
      <Image
        src="/insects/bee.png"
        alt=""
        width={144}
        height={80}
        aria-hidden="true"
        className="insect-deco animate-buzz header-insect top-1/2 left-[6%] h-20 w-36 -translate-y-1/2 sm:left-[10%]"
      />
      <Image
        src="/insects/butterfly.png"
        alt=""
        width={144}
        height={96}
        aria-hidden="true"
        className="insect-deco animate-float header-insect top-1/2 right-[6%] h-24 w-36 -translate-y-1/2 sm:right-[10%]"
      />

      <Image
        src="/logo-milan.png"
        alt="Milans Geburtstagsparty Logo"
        width={256}
        height={256}
        className="relative h-auto w-64"
        priority
      />
    </header>
  );
}
