import RubiksCube from "@/components/cube/RubiksCube";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">

      
      <div className="flex-1 relative">
        {/* Full-screen background cube */}
        <div className="absolute inset-0 z-0">
          <RubiksCube />
        </div>
      
      </div>
      
      <Footer />
    </div>
  );
}
