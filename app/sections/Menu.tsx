import { useState } from "react";
import Link from "next/link";

export const Menu = () => {
    const [isOpen, setIsOpen] = useState(false); // Для мобильного меню

    const toggleMenu = () => setIsOpen(!isOpen);

    const menuItems = [
        { name: "Алгоритмы", href: "/categories/algorithms" },
        { name: "Базы данных", href: "/categories/databases" },
        { name: "Frontend", href: "/categories/frontend" },
        { name: "Backend", href: "/categories/backend" },
        { name: "DevOps", href: "/categories/devops" },
        { name: "Машинное обучение", href: "/categories/ml" },
    ];

    return (
        <div className="p-4 bg-gradient-to-r from-teal-500 to-blue-500 shadow-lg rounded-lg mb-8">
            <div className="max-w-6xl mx-auto">
                {/* Заголовок и кнопка для мобильного меню */}
                <div className="flex justify-between items-center text-white p-2">
                    <h2 className="text-lg font-semibold">Меню</h2>
                    <button
                        className="md:hidden focus:outline-none"
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                            />
                        </svg>
                    </button>
                </div>

                {/* Меню */}
                <nav
                    className={`${
                        isOpen ? "block" : "hidden"
                    } md:block text-center md:flex md:justify-center md:gap-4 text-white p-2`}
                >
                    {menuItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="block md:inline-block py-1 px-3 rounded-md hover:bg-white hover:bg-opacity-20 transition duration-300 ease-in-out"
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
};