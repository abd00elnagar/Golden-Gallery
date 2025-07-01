import { Category } from "@/lib/types";

interface FilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
}

export function Filter({
  categories,
  selectedCategory,
  onCategoryChange,
}: FilterProps) {
  return (
    <div className="bg-card rounded-lg p-4 border">
      <h2 className="font-semibold mb-4">Categories</h2>
      <div className="space-y-2">
        <button
          onClick={() => onCategoryChange(null)}
          className={`w-full text-left px-2 py-1.5 rounded-md transition-colors ${
            selectedCategory === null
              ? "bg-primary text-primary-foreground"
              : "hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          All Categories
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`w-full text-left px-2 py-1.5 rounded-md transition-colors ${
              selectedCategory === category.id
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
