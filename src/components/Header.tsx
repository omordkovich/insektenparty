import Image from "next/image";

export function Header() {
  return (
    <header className="page-shell flex items-center justify-center pt-6 pb-4">
      <Image
        src="/logo-milan.png"
        alt="Milans Geburtstagsparty Logo"
        width={256}
        height={256}
        className="h-auto w-64"
        priority
      />
    </header>
  );
}
