import Link from "next/link";

export const AuthButtons = () => (
  <div className="flex items-center gap-4">
    <Link
      href="#"
      className="login text-xl py-2 px-6 rounded-3xl bg-[#1ED760] hover:opacity-70 transition-[1s] text-black font-medium"
    >
      Login
    </Link>
    <Link
      href="#"
      className="text-xl py-2 px-6 rounded-3xl hover:opacity-70 transition-[1s] text-white font-medium border-solid border-2"
    >
      Register
    </Link>
  </div>
);
