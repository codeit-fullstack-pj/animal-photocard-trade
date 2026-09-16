import PhotoCard from "@/components/card/PhotoCard";

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
          <PhotoCard
            variant="sale"
            title={card.title ?? card.name}
            tag={card.tag}
            imageUrl={card.imageUrl}
            category={card.category}
            score={card.score}
            filterType={card.filterType}
            point={card.point ?? card.price}
            status={card.status}
            isSoldOut={card.isSoldOut}
            onClick={() => onCardClick?.(card)}
          />
        </li>
      ))}
    </ul>
  );
}
