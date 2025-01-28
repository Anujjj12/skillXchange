import { Card, CardContent } from "@/components/ui/card";

const cards = [
  {
    title: "Learn Programming",
    description: "Pair up and improve coding skills.",
  },
  {
    title: "Math Tutoring",
    description: "Help each other with math challenges.",
  },
  {
    title: "Language Exchange",
    description: "Practice a new language with native speakers.",
  },
];

export default function CardGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 my-8 px-6">
      {cards.map((card, index) => (
        <Card key={index} className="p-4 shadow-lg">
          <CardContent>
            <h3 className="text-lg font-semibold">{card.title}</h3>
            <p className="text-gray-600">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
