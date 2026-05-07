import Image from "next/image";

export default function FerdiPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center max-w-sm w-full">
        <div className="relative w-40 h-40 mb-6 overflow-hidden rounded-full border-4 border-[#5E2390] shadow-lg">
          <Image
            src="https://simak.unismuh.ac.id/upload/mahasiswa/105841100422_.jpg?1778155698"
            alt="Foto Ferdi"
            fill
            className="object-cover"
            priority
          />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Ferdi</h1>
        <p className="text-[#5E2390] font-medium mb-4">Mahasiswa Informatika</p>
        
        <div className="w-full border-t border-gray-100 pt-4 mt-2 text-center text-sm text-gray-500">
          <p>Universitas Muhammadiyah Makassar</p>
        </div>
      </div>
    </div>
  );
}