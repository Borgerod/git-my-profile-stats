import StatCard from "@/app/components/StatsCard";
export default function Home() {
  return (
    // <StatCard></StatCard>

    <div className="flex flex-col flex-1 items-center justify-center  font-sans ">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center py-32 px-16  sm:items-start justify-center gap-5">
        <StatCard></StatCard>
      </main>
    </div>
  );
}

// TODO : make a generator that generates SVG's from this.
