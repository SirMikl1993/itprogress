"use client";

import { FC, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { collection, getDocs, doc, getDoc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Post, Category, Comment } from "@/types";
import { Footer } from "@/app/sections/Footer";
import Link from "next/link";

const CategoryPage: FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [category, setCategory] = useState<Category | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const { categoryId } = useParams();
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            if (typeof categoryId !== "string") return;

            const categoryRef = doc(db, "categories", categoryId);
            const categoryDoc = await getDoc(categoryRef);
            if (categoryDoc.exists()) {
                setCategory({ id: categoryDoc.id, ...categoryDoc.data() } as Category);
            }

            const postsRef = collection(db, "posts");
            const postsSnapshot = await getDocs(postsRef);
            const postsData = postsSnapshot.docs
                .map((doc) => ({ id: doc.id, ...doc.data() } as Post))
                .filter((post) => post.categoryId === categoryId);
            setPosts(postsData);

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

        fetchData();
    }, [categoryId]);

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
                    <h1 className="text-2xl font-bold text-gray-600">
                        Категория: {category?.name || "Загрузка..."}
                    </h1>
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
                    {posts.length === 0 ? (
                        <p className="text-gray-500">Посты не найдены.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.map((post) => (
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
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CategoryPage;