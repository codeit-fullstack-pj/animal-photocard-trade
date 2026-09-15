-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'EXCHANGE_RECEIVED';

-- 카드 하나당 ON_SALE 판매글은 1건
CREATE UNIQUE INDEX "Sale_card_on_sale_key"
  ON "Sale" ("cardId")
  WHERE "status" = 'ON_SALE';

-- 같은 판매글에 같은 카드로 중복 제시 금지 (PENDING 인 것만)
CREATE UNIQUE INDEX "Exchange_no_duplicate_pending_key"
  ON "Exchange" ("saleId", "offerCardId")
  WHERE "status" = 'PENDING';
