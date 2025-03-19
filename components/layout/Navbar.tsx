import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="w-full py-4 px-6 md:px-10 bg-background border-b border-border flex items-center justify-between">
      <Link href="/" className="text-xl font-bold">
        RubiksMaster
      </Link>
      <div className="flex gap-6">
        <Link href="/" className="hover:text-primary transition-colors">
          Home
        </Link>
        <Link href="/learn" className="hover:text-primary transition-colors">
          Learn
        </Link>
        <Link href="/customize" className="hover:text-primary transition-colors">
          Customize
        </Link>
      </div>
    </nav>
  );
};

export default Navbar; 