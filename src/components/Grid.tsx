import type { Item } from "@/lib/data";
import { ItemCard } from "./ItemCard";

export function Grid({ items }: { items: Item[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {items.map((item) => (
        <ItemCard key={item.url} item={item} />
      ))}
    </div>
  );
}
