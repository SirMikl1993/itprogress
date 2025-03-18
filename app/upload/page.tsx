"use client";

import { FC, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/context/AuthContext";
import PrivateRoute from "../../components/PrivateRoute";
import { Footer } from "@/app/sections/Footer";
import { db, storage } from "@/lib/firebase";
import { Category } from "@/types";

const Upload: FC = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [categoryId, setCategoryId] = useState(""); // Исправлено: categoryId вместо category
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const { user } = useAuth();

    // Загрузка категорий
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description || !image || !categoryId) {
            setError("Пожалуйста, заполните все поля.");
            return;
        }

        try {
            // Загрузка изображения в Firebase Storage
            const imageRef = ref(storage, `images/${image.name}`);
            await uploadBytes(imageRef, image);
            const imageUrl = await getDownloadURL(imageRef);

            // Создание нового поста
            await addDoc(collection(db, "posts"), {
                title,
                description,
                imageUrl,
                categoryId, // Исправлено: categoryId вместо category
                userId: user?.uid,
            });

            router.push("/posts");
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Ошибка при загрузке поста";
            setError(errorMessage);
        }
    };

    return (
        <PrivateRoute>
            <div className="min-h-screen bg-gray-200 flex flex-col">
                {/* Header */}
                <header className="p-4 bg-white shadow-md">
                    <div className="max-w-6xl mx-auto flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-600">Загрузка поста</h1>
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
                        <h2 className="text-3xl font-bold text-teal-600 mb-4 text-center">
                            Создайте новый пост
                        </h2>
                        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                            <div className="mb-4">
                                <label className="block text-gray-600 mb-2">Заголовок</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-600 mb-2">Описание</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    rows={4}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-600 mb-2">Категория</label>
                                <select
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                    required
                                >
                                    <option value="">Выберите категорию</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-600 mb-2">Изображение</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full px-6 py-3 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition"
                            >
                                Загрузить пост
                            </button>
                        </form>
                    </div>
                </main>

                {/* Footer */}
                <Footer />
            </div>
        </PrivateRoute>
    );
};

export default Upload;