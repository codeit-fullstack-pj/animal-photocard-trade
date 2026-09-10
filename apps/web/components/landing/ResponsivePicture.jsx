// 화면 폭에 따라 다른 이미지 파일을 보여준다.
// lg: 1024px 이상, md: 640px 이상, sm: 그 외(모바일)
export default function ResponsivePicture({ alt, lg, md, sm, className = "" }) {
  return (
    <picture className={`block ${className}`}>
      <source media="(min-width: 1024px)" srcSet={lg} />
      <source media="(min-width: 640px)" srcSet={md} />
      <img src={sm} alt={alt} className="h-auto w-full" />
    </picture>
  );
}
