import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="w-full py-4 px-6 md:px-10 flex items-center justify-between absolute top-0 left-0 z-20 text-primary">
      <Link href="/" className="text-xl font-bold">
        RubiksMaster
      </Link>
      <div className="flex gap-6">
        <Link href="/" className="hover:font-bold transition-colors">
          Home
        </Link>
        <Link href="/learn" className="hover:font-bold transition-colors">
          Learn
        </Link>
        <Link href="/customize" className="hover:font-bold transition-colors">
          Log In
        </Link>
      </div>
    </nav>
  );
};

export default Navbar; 