import HeroCarousel from "@/components/Carousel";
import CardGrid from "@/components/GridCard";

export default function Home() {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mt-6">
        Welcome to Our Learning Platform
      </h1>
      <HeroCarousel />
      <CardGrid />
    </div>
  );
}
