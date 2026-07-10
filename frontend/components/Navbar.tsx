export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white px-8 py-4 flex items-center justify-between shadow-md">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-bold text-sm">G</span>
        </div>
        <span className="text-xl font-bold tracking-tight">GrowEasy CRM</span>
      </div>
      <span className="text-blue-100 text-sm font-medium hidden sm:block">
        AI-Powered CSV Importer
      </span>
    </nav>
  );
}
