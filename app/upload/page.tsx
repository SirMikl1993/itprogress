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
import { FaTimes } from "react-icons/fa";

const Upload: FC = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [categoryId, setCategoryId] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isAddPostModalOpen, setIsAddPostModalOpen] = useState(false);
    const router = useRouter();
    const { user } = useAuth();

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

    const handleSubmit = async () => {
        if (!title || !description || !content || !image || !categoryId) {
            setError("Пожалуйста, заполните все поля.");
            return;
        }

        try {
            const imageRef = ref(storage, `images/${image.name}`);
            await uploadBytes(imageRef, image);
            const imageUrl = await getDownloadURL(imageRef);

            await addDoc(collection(db, "posts"), {
                title,
                description,
                content, // Сохраняем содержимое как обычную строку
                imageUrl,
                categoryId,
                userId: user?.uid,
                createdAt: new Date().toISOString(),
                authorName: user?.displayName || user?.email?.split("@")[0] || "Аноним",
            });

            setIsAddPostModalOpen(false);
            setTitle("");
            setDescription("");
            setContent("");
            setImage(null);
            setCategoryId("");
            setError(null);
            router.push("/posts");
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Ошибка при загрузке поста";
            setError(errorMessage);
        }
    };

    return (
        <PrivateRoute>
            <div className="min-h-screen bg-gray-200 flex flex-col">
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

                <main className="flex-1 p-6">
                    <div className="max-w-6xl mx-auto">
                        <h2 className="text-3xl font-bold text-teal-600 mb-4 text-center">
                            Создайте новый пост
                        </h2>
                        <div className="flex justify-center">
                            <button
                                onClick={() => setIsAddPostModalOpen(true)}
                                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                            >
                                Создать пост
                            </button>
                        </div>

                        {/* Модальное окно для добавления поста */}
                        {isAddPostModalOpen && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative">
                                    <button
                                        onClick={() => setIsAddPostModalOpen(false)}
                                        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
                                    >
                                        <FaTimes size={24} />
                                    </button>
                                    <h2 className="text-2xl font-semibold mb-4">Добавить новый пост</h2>
                                    {error && <p className="text-red-500 mb-4">{error}</p>}
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Заголовок"
                                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        />
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Описание"
                                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            rows={4}
                                        />
                                        <textarea
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            placeholder="Содержимое поста"
                                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                            rows={6}
                                        />
                                        <select
                                            value={categoryId}
                                            onChange={(e) => setCategoryId(e.target.value)}
                                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        >
                                            <option value="">Выберите категорию</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="flex items-center gap-2">
                                            <label className="px-4 py-2 bg-gray-300 text-black rounded-lg cursor-pointer hover:bg-gray-400 transition">
                                                Выбрать изображение
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                />
                                            </label>
                                            {image && <span className="text-gray-600">{image.name}</span>}
                                        </div>
                                        <button
                                            onClick={handleSubmit}
                                            className="w-full px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
                                        >
                                            Загрузить пост
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                <Footer />
            </div>
        </PrivateRoute>
    );
};

export default Upload;