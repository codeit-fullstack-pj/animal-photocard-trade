import ScaledPhotoCard from "@/components/card/ScaledPhotoCard";

export default function MarketCardList({ cards, onCardClick }) {
  return (
    <ul
      className="
        grid
        w-full
        grid-cols-2
        gap-[8px]

        tablet:grid-cols-2
        tablet:gap-[12px]

        pc:grid-cols-3
        pc:gap-[20px]
      "
    >
      {cards.map((card) => (
        <li key={card.id} className="w-full min-w-0">
          <ScaledPhotoCard
            variant={card.variant}
            card={card.card}
            point={card.point}
            status={card.status}
            isSoldOut={card.isSoldOut}
            onClick={() => onCardClick?.(card)}
          />
        </li>
      ))}
    </ul>
  );
}
