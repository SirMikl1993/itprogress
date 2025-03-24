"use client";

import { FC, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const Auth: FC = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isRegistering, setIsRegistering] = useState<boolean>(true);
    const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const router = useRouter();

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            const { clientX, clientY } = event;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const offsetX = (clientX - centerX) / centerX;
            const offsetY = (clientY - centerY) / centerY;
            setMousePos({ x: offsetX, y: offsetY });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    const handleAuth = async () => {
        try {
            if (isRegistering) {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                // Сохраняем данные пользователя в Firestore
                await setDoc(doc(db, "users", user.uid), {
                    email: user.email,
                    displayName: user.email?.split("@")[0],
                    role: "user", // По умолчанию роль user
                    likedPosts: [],
                    favoritePosts: [],
                }, { merge: true });
                alert("Пользователь успешно зарегистрирован!");
                router.push("/posts");
            } else {
                await signInWithEmailAndPassword(auth, email, password);
                alert("Вход выполнен успешно!");
                router.push("/posts");
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка";
            console.error("Ошибка:", errorMessage);
            alert(errorMessage);
        }
    };

    return (
        <div className="min-h-screen bg-gray-200 flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-white rounded-l-full transform translate-x-1/4"></div>

            <div className="relative z-10 flex items-center justify-between w-full max-w-6xl px-6">
                <div className="text-center">
                    <div className="flex items-center justify-center mb-8">
                        <Image
                            src="/img/logo.png"
                            alt="IT.PROGRESS Logo"
                            className="mr-2"
                            width={40}
                            height={40}
                        />
                        <span className="text-2xl font-bold text-gray-600">IT.PROGRESS</span>
                    </div>

                    <h1 className="text-4xl font-bold text-teal-600 mb-4">
                        Всё о программировании – ваш портал в мир кода
                    </h1>

                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Программируй будущее: погружайся в код, изучай технологии и вдохновляйся вместе с нами!
                    </p>

                    <div className="mb-6">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-72 p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <input
                            type="password"
                            placeholder="Пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-72 p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={handleAuth}
                            className="px-6 py-3 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition"
                        >
                            {isRegistering ? "Регистрация" : "Вход"}
                        </button>
                        <button
                            onClick={() => setIsRegistering(!isRegistering)}
                            className="px-6 py-3 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition mt-2 sm:mt-0"
                        >
                            {isRegistering ? "Уже есть аккаунт? Войдите" : "Нет аккаунта? Зарегистрируйтесь"}
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <Image
                        src="/img/person-with-laptop.jpg"
                        alt="Person with laptop"
                        className="w-70 h-auto object-contain transition-transform duration-200"
                        style={{
                            transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 20}px)`,
                        }}
                        width={400}
                        height={500}
                    />
                    <div
                        className="absolute -top-10 -left-10 w-16 h-16 bg-teal-500 rounded-full opacity-20 transition-transform duration-200"
                        style={{
                            transform: `translate(${mousePos.x * -10}px, ${mousePos.y * -10}px)`,
                        }}
                    ></div>
                    <div
                        className="absolute -bottom-10 -right-10 w-12 h-12 bg-teal-500 rounded-full opacity-20 transition-transform duration-200"
                        style={{
                            transform: `translate(${mousePos.x * 15}px, ${mousePos.y * 15}px)`,
                        }}
                    ></div>
                    <div
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-teal-500 transition-transform duration-200"
                        style={{
                            transform: `translate(${-mousePos.x * 30}px, ${-mousePos.y * 30}px)`,
                        }}
                    >
                        <svg
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                    </div>
                    <div
                        className="absolute top-1/4 right-10 w-12 h-12 bg-teal-500 rounded-full opacity-20 transition-transform duration-200"
                        style={{
                            transform: `translate(${mousePos.x * -5}px, ${mousePos.y * -5}px)`,
                        }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default Auth;