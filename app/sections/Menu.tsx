"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Category } from "@/types";

export const Menu = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);

    // Загрузка категорий из Firestore
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoriesRef = collection(db, "categories");
                const snapshot = await getDocs(categoriesRef);
                const categoriesData = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                } as Category));
                setCategories(categoriesData);
            } catch (error) {
                console.error("Ошибка загрузки категорий:", error);
            }
        };

        fetchCategories();
    }, []);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md rounded-xl mb-6">
            <div className="max-w-6xl mx-auto">
                {/* Заголовок и кнопка для мобильного меню */}
                <div className="flex justify-between items-center text-white">
                    <h2 className="text-base font-semibold">Категории</h2>
                    <button
                        className="md:hidden focus:outline-none"
                        onClick={toggleMenu}
                        aria-label="Toggle menu"
                    >
                        <svg
                            className="w-5 h-5"
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
                    } md:block text-center md:flex md:justify-center md:gap-3 text-white mt-2 md:mt-0`}
                >
                    {categories.length > 0 ? (
                        categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/categories/${category.id}`}
                                className="block md:inline-block py-1 px-2 text-sm rounded-lg hover:bg-white hover:bg-opacity-20 transition duration-300 ease-in-out transform hover:scale-105"
                            >
                                {category.name}
                            </Link>
                        ))
                    ) : (
                        <p className="text-white text-sm">Категории не найдены</p>
                    )}
                </nav>
            </div>
        </div>
    );
};