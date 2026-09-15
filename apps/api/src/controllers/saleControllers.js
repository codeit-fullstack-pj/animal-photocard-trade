import {
  getSaleById as getSaleByIdService,
  updateSale as updateSaleService,
  cancelSale as cancelSaleService,
} from "../services/saleService.js";

// GET /sales/:id — URL 파라미터에서 id 꺼내서 조회, 결과 그대로 응답
export const getSaleById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const sale = await getSaleByIdService(id);
    res.json(sale);
  } catch (error) {
    next(error);
  }
};

// PATCH /sales/:id — body에서 수정 허용된 필드(description/canExchange/price)만 골라서 전달
// (cardId, sellerId, status 등은 여기서 안 걸러지므로 절대 반영 안 됨)
export const updateSale = async (req, res, next) => {
  try {
    const id = req.params.id;
    const data = {
      description: req.body.description,
      canExchange: req.body.canExchange,
      price: req.body.price,
    };
    const sale = await updateSaleService(id, data);
    res.json({ data: sale });
  } catch (error) {
    next(error);
  }
};

// PATCH /sales/:id/cancel — body 없이 id만으로 캔슬 실행, { data: ... } 형태로 응답
export const cancelSale = async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await cancelSaleService(id);
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};
