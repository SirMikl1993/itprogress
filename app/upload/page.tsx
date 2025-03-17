"use client";

import { FC } from "react";
import { useRouter } from "next/navigation";
import PrivateRoute from "../../components/PrivateRoute";
import { Footer } from "@/app/sections/Footer";

const Upload: FC = () => {
    const router = useRouter();

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
                    <div className="max-w-6xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-teal-600 mb-4">
                            Создайте новый пост
                        </h2>
                        <p className="text-gray-600 mb-8">
                            Здесь будет форма для загрузки нового поста (заглушка).
                        </p>
                        {/* Форма для загрузки поста (можно добавить позже) */}
                    </div>
                </main>

                {/* Footer */}
                <Footer />
            </div>
        </PrivateRoute>
    );
};

export default Upload;