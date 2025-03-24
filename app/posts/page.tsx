"use client";

import { FC, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { collection, getDocs, doc, getDoc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Post, Category, Comment } from "@/types";
import { Footer } from "@/app/sections/Footer";
import Link from "next/link";

const PostsPage: FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [sortBy, setSortBy] = useState<"date" | "title">("date");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [newComment, setNewComment] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 6;
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        const fetchPosts = async () => {
            const postsRef = collection(db, "posts");
            const postsSnapshot = await getDocs(postsRef);
            const postsData = postsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            } as Post));
            setPosts(postsData);

            const categoriesRef = collection(db, "categories");
            const categoriesSnapshot = await getDocs(categoriesRef);
            const categoriesData = categoriesSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            } as Category));
            setCategories(categoriesData);

            const allComments: Comment[] = [];
            for (const post of postsData) {
                const commentsRef = collection(db, `posts/${post.id}/comments`);
                const commentsSnapshot = await getDocs(commentsRef);
                const postComments = commentsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    postId: post.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp?.toDate(),
                } as Comment));
                allComments.push(...postComments);
            }
            setComments(allComments);
        };

        fetchPosts();
    }, []);

    const getCategoryName = (categoryId: string | undefined) => {
        const category = categories.find((cat) => cat.id === categoryId);
        return category ? category.name : "Без категории";
    };

    const filteredPosts = posts.filter((post) =>
        selectedCategory ? post.categoryId === selectedCategory : true
    );

    const sortedPosts = [...filteredPosts].sort((a, b) => {
        if (sortBy === "date") {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        } else {
            return sortOrder === "asc"
                ? a.title.localeCompare(b.title)
                : b.title.localeCompare(a.title);
        }
    });

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = sortedPosts.slice(indexOfFirstPost, indexOfLastPost);
    const totalPages = Math.ceil(sortedPosts.length / postsPerPage);

    const handleAddComment = async (postId: string) => {
        if (!user) {
            alert("Пожалуйста, войдите, чтобы оставить комментарий.");
            router.push("/login");
            return;
        }

        if (!newComment.trim()) {
            alert("Комментарий не может быть пустым.");
            return;
        }

        try {
            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);
            const userName = userDoc.exists() ? userDoc.data().displayName || "Аноним" : "Аноним";

            const commentData = {
                text: newComment,
                userId: user.uid,
                userName,
                timestamp: new Date(),
            };

            const commentsRef = collection(db, `posts/${postId}/comments`);
            const docRef = await addDoc(commentsRef, commentData);

            const newCommentData: Comment = {
                id: docRef.id,
                postId,
                ...commentData,
                timestamp: commentData.timestamp,
            };

            setComments([...comments, newCommentData]);
            setNewComment("");
        } catch (error) {
            console.error("Ошибка добавления комментария:", error);
        }
    };

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const formatDate = (date: Date | undefined) =>
        date
            ? `${date.toLocaleDateString("ru-RU")} ${date.toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
            })}`
            : "Не указано";

    return (
        <div className="min-h-screen bg-gray-200 flex flex-col">
            <header className="p-4 bg-white shadow-md">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-600">Посты</h1>
                    <div className="flex gap-2">
                        {user ? (
                            <>
                                <button
                                    onClick={() => router.push("/upload")}
                                    className="px-4 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition"
                                >
                                    Создать пост
                                </button>
                                <button
                                    onClick={() => router.push("/profile")}
                                    className="px-4 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition"
                                >
                                    Профиль
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => router.push("/login")}
                                className="px-4 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition"
                            >
                                Войти
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="flex-1 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-4 flex gap-4 flex-wrap">
                        <select
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="p-2 border rounded-lg"
                        >
                            <option value="">Все категории</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        <select
                            value={sortBy}
                            onChange={(e) => {
                                setSortBy(e.target.value as "date" | "title");
                                setCurrentPage(1);
                            }}
                            className="p-2 border rounded-lg"
                        >
                            <option value="date">Сортировать по дате</option>
                            <option value="title">Сортировать по названию</option>
                        </select>
                        <select
                            value={sortOrder}
                            onChange={(e) => {
                                setSortOrder(e.target.value as "asc" | "desc");
                                setCurrentPage(1);
                            }}
                            className="p-2 border rounded-lg"
                        >
                            <option value="asc">По возрастанию</option>
                            <option value="desc">По убыванию</option>
                        </select>
                    </div>

                    {currentPosts.length === 0 ? (
                        <p className="text-gray-500">Посты не найдены.</p>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {currentPosts.map((post) => (
                                    <div
                                        key={post.id}
                                        className="bg-white rounded-lg shadow-md p-4 flex flex-col"
                                    >
                                        <Link href={`/posts/${post.id}`}>
                                            <Image
                                                src={post.imageUrl}
                                                alt={post.title}
                                                width={400}
                                                height={160}
                                                className="w-full h-40 object-cover rounded-t-lg mb-4"
                                            />
                                            <h2 className="text-lg font-semibold">{post.title}</h2>
                                            <p className="text-sm text-gray-500">
                                                Категория: {getCategoryName(post.categoryId ?? undefined)}
                                            </p>
                                        </Link>
                                        <div className="mt-4">
                                            <h3 className="text-sm font-semibold mb-2">Комментарии</h3>
                                            {comments
                                                .filter((comment) => comment.postId === post.id)
                                                .map((comment) => (
                                                    <div key={comment.id} className="mb-2">
                                                        <p className="text-sm font-medium">
                                                            {comment.userName || "Аноним"}
                                                        </p>
                                                        <p className="text-sm text-gray-600">{comment.text}</p>
                                                        <p className="text-xs text-gray-500">
                                                            {formatDate(comment.timestamp)}
                                                        </p>
                                                    </div>
                                                ))}
                                            <div className="mt-2">
                                                <textarea
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    placeholder="Добавить комментарий..."
                                                    className="w-full p-2 border rounded-lg"
                                                    rows={2}
                                                />
                                                <button
                                                    onClick={() => handleAddComment(post.id)}
                                                    className="mt-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
                                                >
                                                    Отправить
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {sortedPosts.length > postsPerPage && (
                                <div className="flex justify-center mt-4">
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-gray-300 text-black rounded-l disabled:opacity-50 hover:bg-gray-400 transition"
                                    >
                                        Предыдущая
                                    </button>
                                    <span className="px-4 py-2 bg-gray-200">
                                        Страница {currentPage} из {totalPages}
                                    </span>
                                    <button
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 bg-gray-300 text-black rounded-r disabled:opacity-50 hover:bg-gray-400 transition"
                                    >
                                        Следующая
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PostsPage;