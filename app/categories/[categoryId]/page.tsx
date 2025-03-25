"use client";

import { FC, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Post, Category } from "@/types";
import { Footer } from "@/app/sections/Footer";

const POSTS_PER_PAGE = 9;

const CategoryPosts: FC = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const [category, setCategory] = useState<Category | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const router = useRouter();

    // Загрузка категории и постов
    useEffect(() => {
        const fetchCategoryAndPosts = async () => {
            if (!categoryId) return;

            try {
                // Загрузка данных категории
                const categoryRef = doc(db, "categories", categoryId);
                const categoryDoc = await getDoc(categoryRef);
                if (categoryDoc.exists()) {
                    setCategory({ id: categoryDoc.id, ...categoryDoc.data() } as Category);
                } else {
                    console.error("Категория не найдена");
                    return;
                }

                // Загрузка постов
                const postsRef = collection(db, "posts");
                const snapshot = await getDocs(postsRef);
                const postsData = snapshot.docs
                    .map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    } as Post))
                    .filter((post) => post.categoryId === categoryId); // Исправлено: post.categoryId вместо post.category
                setPosts(postsData);
            } catch (error) {
                console.error("Ошибка загрузки данных:", error);
            }
        };

        fetchCategoryAndPosts();
    }, [categoryId]);

    const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
    const paginatedPosts = posts.slice(
        (currentPage - 1) * POSTS_PER_PAGE,
        currentPage * POSTS_PER_PAGE
    );

    const handlePostClick = (id: string) => {
        router.push(`/posts/${id}`);
    };

    if (!category) return <div className="text-center p-6">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-200 flex flex-col">
            {/* Header */}
            <header className="p-4 bg-white shadow-md">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-600">
                        Посты в категории: {category.name}
                    </h1>
                    <button
                        onClick={() => router.push("/posts")}
                        className="px-4 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition"
                    >
                        Назад
                    </button>
                </div>
            </header>

            {/* Основной контент */}
            <main className="flex-1 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {paginatedPosts.map((post) => (
                            <div
                                key={post.id}
                                className="bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition"
                                onClick={() => handlePostClick(post.id)}
                            >
                                <img
                                    src={post.imageUrl}
                                    alt={post.title}
                                    className="w-full h-40 object-cover rounded-t-lg"
                                />
                                <div className="p-4">
                                    <h2 className="text-lg font-semibold">{post.title}</h2>
                                </div>
                            </div>
                        ))}
                    </div>

                    {paginatedPosts.length === 0 && (
                        <p className="text-center text-gray-500 mt-6">
                            Посты в этой категории не найдены.
                        </p>
                    )}

                    {/* Пагинация */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-8">
                            {Array.from({ length: totalPages }, (_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => setCurrentPage(index + 1)}
                                    className={`mx-1 px-3 py-1 rounded-full ${
                                        currentPage === index + 1
                                            ? "bg-teal-500 text-white"
                                            : "bg-gray-300 text-gray-600 hover:bg-gray-400"
                                    }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
};

export default CategoryPosts;