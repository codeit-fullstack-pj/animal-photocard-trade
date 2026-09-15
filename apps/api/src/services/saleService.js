import {
  findSaleById,
  updateSaleById,
  cancelSaleTransaction,
} from "../repositories/saleRepository.js";
import { ApiError } from "../lib/api-error.js";

// 판매글 조회: 존재하지 않으면 404 에러, 있으면 그대로 반환
export const getSaleById = async (id) => {
  const sale = await findSaleById(id);
  if (!sale) {
    throw new ApiError(404, "SALE_NOT_FOUND", "Sale not found");
  }
  return sale;
};

// 판매글 수정: 존재 확인 후, 전달받은 data로 Repository의 수정 함수 호출
export const updateSale = async (id, data) => {
  const sale = await findSaleById(id);
  if (!sale) {
    throw new ApiError(404, "SALE_NOT_FOUND", "Sale not found");
  }
  return updateSaleById(id, data);
};

// 판매글 취소: 존재 확인 후, 트랜잭션(판매글 취소 + 교환신청 일괄 취소) 실행
// 트랜잭션 결과(배열)에서 각각 판매글 결과, 교환신청 취소 개수를 꺼내 응답 형태로 가공
export const cancelSale = async (id) => {
  const sale = await findSaleById(id);
  if (!sale) {
    throw new ApiError(404, "SALE_NOT_FOUND", "Sale not found");
  }

  const [canceledSale, exchangeResult] = await cancelSaleTransaction(id);

  return {
    id: canceledSale.id,
    status: canceledSale.status,
    closedAt: canceledSale.closedAt,
    canceledExchangeCount: exchangeResult.count,
  };
};
