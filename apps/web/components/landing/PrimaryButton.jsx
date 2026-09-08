import Link from "next/link";

export default function PrimaryButton({ href, children, className = "" }) {
  return (
    <Link
      href={href}
      className={`inline-flex h-11 items-center justify-center rounded-[0.375rem] bg-purple-button px-12 font-sans-500 text-[0.8125rem] text-white hover:bg-[#9548e6] sm:h-12 sm:text-sm lg:h-10 ${className}`}
    >
      {children}
    </Link>
  );
}
