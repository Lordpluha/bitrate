import Link from "next/link";

export const AuthButtons = () => (
  <div className="flex items-center gap-4">
    <Link
      href="registration"
      className="login text-xl py-2 px-6 rounded-3xl bg-green hover:opacity-70 transition-[1s] text-primary font-medium"
    >
      Login
    </Link>
    <Link
      href="login"
      className="text-xl py-2 px-6 rounded-3xl hover:opacity-70 transition-[1s] text-tBase font-medium border-solid border-2"
    >
      Register
    </Link>
  </div>
);
