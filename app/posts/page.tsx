"use client";

import { FC, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { collection, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";
import PrivateRoute from "../../components/PrivateRoute";
import { db, auth } from "@/lib/firebase";
import { Post, Category } from "@/types";
import { Footer } from "@/app/sections/Footer";
import { Menu } from "@/app/sections/Menu";

const POSTS_PER_PAGE = 9;

const Posts: FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [likedPosts, setLikedPosts] = useState<string[]>([]);
    const [favoritePosts, setFavoritePosts] = useState<string[]>([]);
    const [userName, setUserName] = useState<string>("");
    const [filterMode, setFilterMode] = useState<"all" | "liked" | "favorite">("all");
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        const fetchPostsAndCategories = async () => {
            // Загрузка постов
            const postsRef = collection(db, "posts");
            const snapshot = await getDocs(postsRef);
            const postsData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            } as Post));
            setPosts(postsData);

            // Загрузка категорий
            const categoriesRef = collection(db, "categories");
            const categoriesSnapshot = await getDocs(categoriesRef);
            const categoriesData = categoriesSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            } as Category));
            setCategories(categoriesData);
        };

        const fetchUserData = async () => {
            if (user) {
                const userRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setLikedPosts(data.likedPosts || []);
                    setFavoritePosts(data.favoritePosts || []);
                    setUserName(data.displayName || user.email?.split("@")[0] || "Пользователь");
                } else {
                    await setDoc(userRef, {
                        displayName: user.email?.split("@")[0],
                        email: user.email,
                        likedPosts: [],
                        favoritePosts: [],
                    }, { merge: true });
                    setUserName(user.email?.split("@")[0] || "Пользователь");
                }
            }
        };

        fetchPostsAndCategories();
        fetchUserData();
    }, [user]);

    const filteredPosts = posts.filter((post) => {
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
        if (filterMode === "liked") {
            return likedPosts.includes(post.id) && matchesSearch;
        } else if (filterMode === "favorite") {
            return favoritePosts.includes(post.id) && matchesSearch;
        }
        return matchesSearch;
    });

    const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE);
    const paginatedPosts = filteredPosts.slice(
        (currentPage - 1) * POSTS_PER_PAGE,
        currentPage * POSTS_PER_PAGE
    );

    const handlePostClick = (id: string) => {
        router.push(`/posts/${id}`);
    };

    const handleLike = async (postId: string) => {
        if (!user) return;
        const userRef = doc(db, "users", user.uid);
        const newLikedPosts = likedPosts.includes(postId)
            ? likedPosts.filter((id) => id !== postId)
            : [...likedPosts, postId];
        setLikedPosts(newLikedPosts);
        await setDoc(userRef, { likedPosts: newLikedPosts }, { merge: true });
    };

    const handleFavorite = async (postId: string) => {
        if (!user) return;
        const userRef = doc(db, "users", user.uid);
        const newFavoritePosts = favoritePosts.includes(postId)
            ? favoritePosts.filter((id) => id !== postId)
            : [...favoritePosts, postId];
        setFavoritePosts(newFavoritePosts);
        await setDoc(userRef, { favoritePosts: newFavoritePosts }, { merge: true });
    };

    const handleProfileClick = () => {
        setIsMenuOpen(false);
        router.push("/upload");
    };

    const handleLogout = async () => {
        setIsMenuOpen(false);
        await signOut(auth);
        router.push("/auth");
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Функция для получения названия категории по ID
    const getCategoryName = (categoryId?: string) => {
        if (!categoryId) return "Без категории";
        const category = categories.find((cat) => cat.id === categoryId);
        return category ? category.name : "Без категории";
    };

    return (
        <PrivateRoute>
            <div className="min-h-screen bg-gray-200 flex flex-col">
                {/* Header */}
                <header className="p-4 bg-white shadow-md">
                    <div className="max-w-6xl mx-auto flex items-center justify-between">
                        <div className="flex items-center">
                            <Image
                                src="/img/logo.png"
                                alt="IT.PROGRESS Logo"
                                width={40}
                                height={40}
                                className="mr-2 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14"
                            />
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-600">IT.PROGRESS</h1>
                        </div>
                        <div className="flex items-center gap-4 sm:flex hidden">
                            <button
                                onClick={() => setFilterMode(filterMode === "liked" ? "all" : "liked")}
                                className={`text-gray-600 hover:text-red-500 ${
                                    filterMode === "liked" ? "text-red-500 animate-pulse" : ""
                                }`}
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill={filterMode === "liked" ? "currentColor" : "none"}
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                </svg>
                            </button>
                            <button
                                onClick={() => setFilterMode(filterMode === "favorite" ? "all" : "favorite")}
                                className={`text-gray-600 hover:text-yellow-500 ${
                                    filterMode === "favorite" ? "text-yellow-500 animate-pulse" : ""
                                }`}
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill={filterMode === "favorite" ? "currentColor" : "none"}
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V5z"
                                    />
                                </svg>
                            </button>
                            <button onClick={handleProfileClick} className="flex items-center gap-2 text-gray-600">
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
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                                <span className="text-sm font-medium">{userName}</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-3 py-1 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition"
                            >
                                Выход
                            </button>
                        </div>
                        <div className="sm:hidden flex items-center">
                            <button onClick={toggleMenu} className="text-gray-600">
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
                                        d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                    {isMenuOpen && (
                        <div className="sm:hidden bg-white shadow-md p-4 absolute top-16 left-0 right-0 z-50">
                            <div className="flex flex-col items-center gap-4">
                                <button
                                    onClick={() => {
                                        setFilterMode(filterMode === "liked" ? "all" : "liked");
                                        setIsMenuOpen(false);
                                    }}
                                    className={`text-gray-600 hover:text-red-500 ${
                                        filterMode === "liked" ? "text-red-500 animate-pulse" : ""
                                    }`}
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill={filterMode === "liked" ? "currentColor" : "none"}
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                        />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => {
                                        setFilterMode(filterMode === "favorite" ? "all" : "favorite");
                                        setIsMenuOpen(false);
                                    }}
                                    className={`text-gray-600 hover:text-yellow-500 ${
                                        filterMode === "favorite" ? "text-yellow-500 animate-pulse" : ""
                                    }`}
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill={filterMode === "favorite" ? "currentColor" : "none"}
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V5z"
                                        />
                                    </svg>
                                </button>
                                <button onClick={handleProfileClick} className="flex items-center gap-2 text-gray-600">
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
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                    <span className="text-sm font-medium">{userName}</span>
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="px-3 py-1 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition"
                                >
                                    Выход
                                </button>
                            </div>
                        </div>
                    )}
                </header>

                {/* Основной контент */}
                <main className="flex-1 p-6">
                    <Menu />
                    <div className="max-w-6xl mx-auto">
                        <input
                            type="text"
                            className="w-full max-w-md mx-auto block p-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="Поиск по названию"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {paginatedPosts.map((post) => (
                                <div
                                    key={post.id}
                                    className="bg-white rounded-lg shadow-md cursor-pointer hover:shadow-lg transition"
                                >
                                    <div onClick={() => handlePostClick(post.id)}>
                                        <img
                                            src={post.imageUrl}
                                            alt={post.title}
                                            className="w-full h-40 object-cover rounded-t-lg"
                                        />
                                        <div className="p-4">
                                            <h2 className="text-lg font-semibold">{post.title}</h2>
                                            <p className="text-sm text-gray-500">
                                                Категория: {getCategoryName(post.categoryId)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between p-4">
                                        <button
                                            onClick={() => handleLike(post.id)}
                                            className={`text-gray-600 hover:text-red-500 ${
                                                likedPosts.includes(post.id) ? "text-red-500" : ""
                                            }`}
                                        >
                                            <svg
                                                className="w-6 h-6"
                                                fill={likedPosts.includes(post.id) ? "currentColor" : "none"}
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleFavorite(post.id)}
                                            className={`text-gray-600 hover:text-yellow-500 ${
                                                favoritePosts.includes(post.id) ? "text-yellow-500" : ""
                                            }`}
                                        >
                                            <svg
                                                className="w-6 h-6"
                                                fill={favoritePosts.includes(post.id) ? "currentColor" : "none"}
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-5-7 5V5z"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {paginatedPosts.length === 0 && (
                            <p className="text-center text-gray-500 mt-6">
                                Посты не найдены. Попробуйте изменить запрос или снять фильтр.
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
        </PrivateRoute>
    );
};

export default Posts;