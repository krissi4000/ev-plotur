import Navbar from "../components/Navbar";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl font-bold text-gradient-orange mb-4">Plata</h1>
        <p className="text-zinc-400">Finndu plötu og bættu henni í safnið þitt.</p>
      </div>
    </div>
  );
}
