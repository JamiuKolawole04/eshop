import Link from "next/link";

const Header = () => {
  return (
    <header className="w-full bg-white">
      <div className="w-[80%] py-5 m-auto flex items-center justify-between">
        <div>
          <Link href="/">
            <span className="text-8xl font-semibold text-red-900">Eshop</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
