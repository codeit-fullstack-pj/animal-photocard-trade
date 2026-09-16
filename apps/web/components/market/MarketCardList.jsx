import MarketCard from "./MarketCard";

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
        <MarketCard key={card.id} card={card} onCardClick={onCardClick} />
      ))}
    </ul>
  );
}
