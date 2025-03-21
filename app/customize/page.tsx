import Link from "next/link";

export default function CustomizePage() {
  return (
    <div className="flex flex-col items-center px-6 py-12 md:px-10">
      <section className="w-full max-w-5xl">
        <h1 className="text-4xl font-bold mb-6 text-center">Customize Your Cube</h1>
        <p className="text-lg mb-10 text-center">
          Personalize your Rubik&apos;s cube with various visual effects and settings
        </p>
        
        {/* Coming Soon Banner */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Customization Coming Soon!</h2>
          <p className="mb-6">
            We&apos;re working hard to bring you amazing customization options. Check back soon to personalize your cube with these features:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-background rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold mb-2">Edge Chamfering</h3>
              <p className="text-sm">Adjust the roundness of your cube&apos;s edges from sharp to spherical</p>
            </div>
            <div className="bg-background rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold mb-2">Surface Effects</h3>
              <p className="text-sm">Add textures, glows, and other visual effects to cube faces</p>
            </div>
            <div className="bg-background rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold mb-2">Color Schemes</h3>
              <p className="text-sm">Choose from classic colors or create your own custom palette</p>
            </div>
          </div>
        </div>
        
        {/* Notification Sign-up */}
        <div className="bg-black/5 dark:bg-white/5 p-6 rounded-lg mb-12">
          <h2 className="text-2xl font-bold mb-4 text-center">Get Notified</h2>
          <p className="text-center mb-6">
            Sign up to be the first to know when customization features are ready!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="flex-1 px-4 py-2 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              disabled
            />
            <button 
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              disabled
            >
              Coming Soon
            </button>
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