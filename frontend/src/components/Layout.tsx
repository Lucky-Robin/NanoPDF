import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-[#EAEAEA] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-black text-[#0066FF] tracking-tight">Nano<span className="text-black">PDF</span></span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="text-gray-600 hover:text-[#0066FF] font-medium transition-colors"
              >
                Tools
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
