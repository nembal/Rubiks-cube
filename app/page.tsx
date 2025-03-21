import RubiksCube from "@/components/cube/RubiksCube";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Full-screen background cube */}
      <div className="fixed inset-0 z-0 w-screen h-screen overflow-hidden">
        <RubiksCube />
      </div>
      
      {/* Main content overlay */}
      <div className="relative z-10 pointer-events-none">
        {/* Navigation Bar */}
        <nav className="w-full bg-white/80 backdrop-blur-sm shadow-md pointer-events-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold">RubiksMaster</h1>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-center space-x-4">
                  <Link href="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-900 hover:bg-gray-100">
                    Home
                  </Link>
                  <Link href="/about" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                    About
                  </Link>
                  <Link href="/learn" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                    Learn
                  </Link>
                  <Link href="/settings" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
                    Settings
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Central viewing area with space for floating UI elements */}
        <div className="min-h-[80vh] w-full relative">
          {/* Action Bubbles below nav */}
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex space-x-4 pointer-events-auto">
            <Link href="/quickstart" className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg hover:bg-white transition duration-300">
              Quick Start Guide
            </Link>
            <Link href="/learn" className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg hover:bg-white transition duration-300">
              Learn to Cube
            </Link>
          </div>
          
          {/* Future UI overlay elements */}
          {/* 
          <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg pointer-events-auto">
            Speed controls
          </div>
          <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-lg pointer-events-auto">
            Settings
          </div>
          */}
        </div>
        
        {/* Footer that sticks to bottom with transparent background */}
        <footer className="fixed bottom-0 left-0 right-0 py-3 bg-transparent backdrop-blur-sm pointer-events-auto">
          <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-600 opacity-70 hover:opacity-100 transition-opacity">
            <p>vibecoded with luv - 2025</p>
          </div>
        </footer>
      </div>
    </>
  );
}
