// SellerActionButtons.jsx
const SellerActionButtons = ({ sale }) => {
  return (
    <>
      <button className="w-full h-[80px] bg-[#a656f5] text-white">판매글 수정하기</button>
      <button className="w-full h-[80px] bg-transparent border border-white text-white">
        판매 내리기
      </button>
    </>
  );
};
export default SellerActionButtons;
