import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardSidebar from '../../components/Tailor/DashboardSidebar'

const TailorPortfolio = () => {
    const navigate = useNavigate();
    const [tailorData, setTailorData] = useState(null);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
            navigate('/login');
            return;
        }
        try {
            const user = JSON.parse(userInfo);
            if (user.userType !== 'tailor') {
                navigate('/');
                return;
            }
            setTailorData(user);
        } catch (error) {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const handleUpdateTailorData = (updatedData) => {
        setTailorData(updatedData);
    };

    const getInitials = (name) => {
        if (!name) return 'T';
        const names = name.split(' ');
        return names.length >= 2 ? `${names[0][0]}${names[1][0]}`.toUpperCase() : name.substring(0, 2).toUpperCase();
    };

    if (!tailorData) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-[#f5f5f0]">
                <div className="text-slate-600 text-lg">Loading...</div>
            </div>
        );
    }

    const portfolioItems = [
        { title: 'Wedding Sherwani', category: 'Menswear', description: 'Elegant traditional sherwani with intricate embroidery', price: '₹25,000' },
        { title: 'Designer Saree Blouse', category: 'Womenswear', description: 'Contemporary blouse design with mirror work', price: '₹5,000' },
        { title: 'Kids Party Wear', category: 'Kidswear', description: 'Colorful and comfortable party wear for children', price: '₹3,500' },
        { title: 'Custom Suit', category: 'Menswear', description: 'Tailored business suit with perfect fit', price: '₹18,000' },
        { title: 'Bridal Lehenga', category: 'Womenswear', description: 'Stunning bridal lehenga with hand embroidery', price: '₹45,000' },
        { title: 'Casual Kurta', category: 'Menswear', description: 'Comfortable cotton kurta for daily wear', price: '₹2,500' },
    ];

    return (
        <div className="w-full min-h-screen flex bg-[#f5f5f0] text-slate-900">
            {/* Sidebar with Profile Modal */}
            <DashboardSidebar
                tailorData={tailorData}
                onLogout={handleLogout}
                onUpdateTailorData={handleUpdateTailorData}
            />

            {/* Main Content */}
            <main className="flex-1 lg:ml-72 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-slate-800 mb-2">Portfolio 🖼️</h1>
                        <p className="text-slate-500">Showcase your best work</p>
                    </div>
                    <button className="px-6 py-3 bg-[#6b4423] text-white rounded-xl font-medium hover:bg-[#573619] transition-all shadow-lg">
                        + Add New Item
                    </button>
                </header>

                {/* Portfolio Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {portfolioItems.map((item, index) => (
                        <div key={index} className="bg-white border-2 border-dashed border-gray-300 rounded-2xl overflow-hidden hover:shadow-xl transition-all group">
                            {/* Image Placeholder */}
                            <div className="w-full h-48 bg-linear-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center relative overflow-hidden">
                                <div className="text-6xl group-hover:scale-110 transition-transform">
                                    {item.category === 'Menswear' ? '👔' : item.category === 'Womenswear' ? '👗' : '👶'}
                                </div>
                                <div className="absolute top-3 right-3 px-3 py-1 bg-white/90 rounded-full text-xs font-semibold text-[#6b4423]">
                                    {item.category}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h3>
                                <p className="text-sm text-slate-600 mb-4">{item.description}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold text-[#6b4423]">{item.price}</span>
                                    <button className="px-4 py-2 bg-amber-100 text-[#6b4423] rounded-lg text-sm font-medium hover:bg-[#6b4423] hover:text-white transition-all">
                                        Edit
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}

export default TailorPortfolio
