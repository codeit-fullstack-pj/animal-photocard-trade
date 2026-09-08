export default function SectionHeading({ children, subtitle }) {
  return (
    <div>
      <h2 className="font-sans-600 text-[1.375rem] leading-tight sm:text-[2rem]">{children}</h2>
      <p className="mt-3 font-sans-400 text-[0.8125rem] leading-relaxed whitespace-pre-line text-gray-300 sm:text-sm">
        {subtitle}
      </p>
    </div>
  );
}
