import RubiksCube from "@/components/cube/RubiksCube";

export default function Home() {
  return (
    <div className="flex flex-col items-center px-6 py-12 md:px-10">
      <section className="w-full max-w-5xl">
        <h1 className="text-4xl font-bold mb-6 text-center">RubiksMaster</h1>
        <p className="text-lg mb-10 text-center">
          The most beautiful way to learn and master the Rubik's cube
        </p>
        
        {/* 3D Cube Viewer */}
        <div className="mb-12 bg-black/5 dark:bg-white/5 rounded-lg p-4">
          <RubiksCube />
        </div>
        
        {/* Quick Start Guide */}
        
        {/* Learn to Cube Teaser */}

      </section>
    </div>
  );
}
