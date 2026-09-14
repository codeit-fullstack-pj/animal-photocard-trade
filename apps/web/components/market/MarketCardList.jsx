import MarketCard from "./MarketCard";

export default function MarketCardList({ cards }) {
  return (
    <ul
      className="
        grid
        grid-cols-3
        gap-[20px]
      "
    >
      {cards.map((card) => (
        <MarketCard key={card.id} card={card} />
      ))}
    </ul>
  );
}
