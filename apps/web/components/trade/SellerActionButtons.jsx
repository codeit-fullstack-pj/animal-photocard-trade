const SellerActionButtons = ({ sale }) => {
  return (
    <>
      <button className="w-[236px] h-[55px] bg-[#a656f5] text-white">판매글 수정하기</button>
      <button className="w-[236px] h-[55px] bg-transparent border border-white text-white">
        판매 내리기
      </button>
    </>
  );
};

export default SellerActionButtons;
