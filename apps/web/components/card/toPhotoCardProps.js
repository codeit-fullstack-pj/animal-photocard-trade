// 라벨 표시 처리 함수
function getSaleStatusLabel(sale, hasPendingExchange) {
  if (sale.status === "ON_SALE") return hasPendingExchange ? "교환 제시 중" : "판매 중";
  if (sale.status === "CANCELED") return "판매 취소";
  return undefined;
}

// 소유 카드(Card) -> PhotoCard props
export function cardToPhotoCardProps(card) {
  return {
    variant: "owned",
    title: card.name,
    tag: card.tag,
    description: card.description,
    imageUrl: card.imageUrl,
    category: card.category,
    score: card.score,
    filterType: card.filterType,
  };
}

// 판매글(Sale) -> PhotoCard props
export function saleToPhotoCardProps(sale, hasPendingExchange) {
  return {
    variant: "sale",
    title: sale.card.name,
    tag: sale.card.tag,
    imageUrl: sale.card.image,
    category: sale.card.category,
    score: sale.card.score,
    filterType: sale.card.filterType,
    point: sale.price,
    status: getSaleStatusLabel(sale, hasPendingExchange),
    isSoldOut: sale.status === "SOLD_OUT",
  };
}
