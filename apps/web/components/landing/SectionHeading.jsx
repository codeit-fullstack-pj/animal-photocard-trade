export default function SectionHeading({ children, subtitle }) {
  return (
    <div>
      <h2 className="font-sans-600 text-[calc(var(--landing-rem)*1.375)] leading-tight sm:text-[calc(var(--landing-rem)*2)]">
        {children}
      </h2>
      <p className="mt-3 font-sans-400 text-[calc(var(--landing-rem)*0.8125)] leading-relaxed whitespace-pre-line text-gray-300 sm:text-sm">
        {subtitle}
      </p>
    </div>
  );
}
