import Link from "next/link";

export default function LearnPage() {
  return (
    <div className="flex flex-col items-center px-6 py-12 md:px-10">
      <section className="w-full max-w-5xl">
        <h1 className="text-4xl font-bold mb-6 text-center">Learn to Cube</h1>
        <p className="text-lg mb-10 text-center">
          Master the Rubik&apos;s cube with our interactive tutorials based on badmephisto&apos;s method
        </p>
        
        {/* Tutorial Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-black/5 dark:bg-white/5 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Beginner&apos;s Method</h2>
            <p className="mb-4">
              Learn the basic solve method with layer-by-layer techniques. Perfect for those who are new to the Rubik&apos;s cube.
            </p>
            <p className="text-muted-foreground italic mb-4">Coming soon!</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/10 dark:bg-white/10 p-4 rounded-lg text-center">
                <h3 className="font-semibold mb-2">White Cross</h3>
                <p className="text-sm">First step in solving</p>
              </div>
              <div className="bg-black/10 dark:bg-white/10 p-4 rounded-lg text-center">
                <h3 className="font-semibold mb-2">First Layer</h3>
                <p className="text-sm">Complete the white face</p>
              </div>
              <div className="bg-black/10 dark:bg-white/10 p-4 rounded-lg text-center">
                <h3 className="font-semibold mb-2">Middle Layer</h3>
                <p className="text-sm">Solve the middle section</p>
              </div>
              <div className="bg-black/10 dark:bg-white/10 p-4 rounded-lg text-center">
                <h3 className="font-semibold mb-2">Last Layer</h3>
                <p className="text-sm">Complete the cube</p>
              </div>
            </div>
          </div>
          
          <div className="bg-black/5 dark:bg-white/5 p-6 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Advanced Techniques</h2>
            <p className="mb-4">
              Learn F2L, OLL, and PLL to drastically improve your solving speed and efficiency.
            </p>
            <p className="text-muted-foreground italic mb-4">Coming soon!</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/10 dark:bg-white/10 p-4 rounded-lg text-center">
                <h3 className="font-semibold mb-2">F2L</h3>
                <p className="text-sm">First 2 Layers at once</p>
              </div>
              <div className="bg-black/10 dark:bg-white/10 p-4 rounded-lg text-center">
                <h3 className="font-semibold mb-2">OLL</h3>
                <p className="text-sm">Orient Last Layer</p>
              </div>
              <div className="bg-black/10 dark:bg-white/10 p-4 rounded-lg text-center">
                <h3 className="font-semibold mb-2">PLL</h3>
                <p className="text-sm">Permute Last Layer</p>
              </div>
              <div className="bg-black/10 dark:bg-white/10 p-4 rounded-lg text-center">
                <h3 className="font-semibold mb-2">Finger Tricks</h3>
                <p className="text-sm">Speed optimization</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <Link href="/" className="inline-block px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
            Back to Cube
          </Link>
        </div>
      </section>
    </div>
  );
} 