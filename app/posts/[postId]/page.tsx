"use client";

import { FC, useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { doc, getDoc, collection, addDoc, getDocs, setDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { Post, Comment } from "@/types";

const PostDetail: FC = () => {
    const { postId } = useParams<{ postId: string }>();
    const [post, setPost] = useState<Post | null>(null);
    const [authorName, setAuthorName] = useState<string>("Неизвестный автор"); // Состояние для имени автора
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [liked, setLiked] = useState<boolean>(false);
    const [favorited, setFavorited] = useState<boolean>(false);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const commentsPerPage = 5;
    const router = useRouter();
    const { user } = useAuth();

    const fetchPostAndUserData = useCallback(async () => {
        if (!postId) return;

        try {
            // Загрузка поста
            const postRef = doc(db, "posts", postId as string);
            const docSnap = await getDoc(postRef);
            if (docSnap.exists()) {
                const postData = { id: docSnap.id, ...docSnap.data() } as Post;
                setPost(postData);

                // Загрузка имени автора
                if (postData.userId) {
                    const userRef = doc(db, "users", postData.userId);
                    const userDoc = await getDoc(userRef);
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setAuthorName(userData.displayName || userData.email?.split("@")[0] || "Неизвестный автор");
                    }
                }
            } else {
                setError("Пост не найден");
                return;
            }

            // Загрузка комментариев
            const commentsRef = collection(db, `posts/${postId}/comments`);
            const commentsSnapshot = await getDocs(commentsRef);
            const loadedComments = commentsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate(),
            } as Comment));

            const sortedComments = loadedComments.sort((a, b) => {
                if (!a.timestamp || !b.timestamp) return 0;
                return b.timestamp.getTime() - a.timestamp.getTime();
            });
            setComments(sortedComments);

            // Проверка лайков и избранного
            if (user) {
                const userRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setLiked((userData.likedPosts || []).includes(postId));
                    setFavorited((userData.favoritePosts || []).includes(postId));
                }
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Неизвестная ошибка при загрузке поста";
            setError(errorMessage);
            console.error("Ошибка в fetchPostAndUserData:", errorMessage);
        }
    }, [postId, user]);

    useEffect(() => {
        fetchPostAndUserData();
    }, [fetchPostAndUserData]);

    const handleAddComment = async () => {
        if (!user) {
            alert("Пожалуйста, войдите, чтобы оставить комментарий.");
            router.push("/auth");
            return;
        }
        if (!newComment.trim()) {
            alert("Комментарий не может быть пустым.");
            return;
        }

        try {
            await addDoc(collection(db, `posts/${postId}/comments`), {
                text: newComment,
                userName: user.displayName || user.email?.split("@")[0],
                userId: user?.uid,
                timestamp: new Date(),
                createdAt: new Date().toISOString(),
            });
            setNewComment("");
            await fetchPostAndUserData();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Ошибка при добавлении комментария";
            alert(errorMessage);
            console.error("Ошибка в handleAddComment:", errorMessage);
        }
    };

    const handleLike = async () => {
        if (!user || !post) return;
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        let newLikedPosts: string[] = [];
        if (userDoc.exists()) {
            newLikedPosts = (userDoc.data().likedPosts || []).filter((id: string) => id !== postId);
        }
        if (!liked) {
            newLikedPosts.push(postId);
        }
        setLiked(!liked);
        await setDoc(userRef, { likedPosts: newLikedPosts }, { merge: true });
    };

    const handleFavorite = async () => {
        if (!user || !post) return;
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);
        let newFavoritePosts: string[] = [];
        if (userDoc.exists()) {
            newFavoritePosts = (userDoc.data().favoritePosts || []).filter((id: string) => id !== postId);
        }
        if (!favorited) {
            newFavoritePosts.push(postId);
        }
        setFavorited(!favorited);
        await setDoc(userRef, { favoritePosts: newFavoritePosts }, { merge: true });
    };

    const formatDate = (date: Date | undefined) =>
        date
            ? `${date.toLocaleDateString("ru-RU")} ${date.toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
            })}`
            : "Не указано";

    const openImageModal = () => setIsImageModalOpen(true);
    const closeImageModal = () => setIsImageModalOpen(false);

    const indexOfLastComment = currentPage * commentsPerPage;
    const indexOfFirstComment = indexOfLastComment - commentsPerPage;
    const currentComments = comments.slice(indexOfFirstComment, indexOfLastComment);
    const totalPages = Math.ceil(comments.length / commentsPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    if (error) return <div className="text-center p-6 text-red-500">{error}</div>;
    if (!post) return <div className="text-center p-6">Loading...</div>;

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <button
                onClick={() => router.push("/posts")}
                className="mb-6 px-4 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition animate-pulse"
            >
                Назад на главную
            </button>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div style={{ position: "relative", width: "100%", paddingTop: "56.25%" }}>
                    <Image
                        src={post.imageUrl}
                        alt={post.title}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-t-lg cursor-pointer"
                        onClick={openImageModal}
                    />
                </div>
                <div className="p-6">
                    {/* Название */}
                    <h1 className="text-2xl font-bold bg-gray-100 p-3 rounded-lg mb-4 text-center">
                        {post.title || "Без названия"}
                    </h1>

                    {/* Описание */}
                    <div className="bg-gray-100 p-3 rounded-lg mb-4 w-full">
                        <h2 className="text-lg font-semibold text-gray-700 mb-2">Описание:</h2>
                        <p className="text-gray-600 text-center w-full">{post.description || "Без описания"}</p>
                    </div>

                    {/* Содержимое */}
                    <div className="bg-gray-100 p-3 rounded-lg mb-4 w-full">
                        <h2 className="text-lg font-semibold text-gray-700 mb-2">Содержимое:</h2>
                        <p className="text-gray-600 w-full whitespace-pre-wrap">{post.content || "Без содержимого"}</p>
                    </div>

                    {/* Дата создания */}
                    <div className="bg-gray-100 p-3 rounded-lg mb-4 w-full">
                        <h2 className="text-lg font-semibold text-gray-700 mb-2">Дата создания:</h2>
                        <p className="text-gray-600 text-center w-full">
                            {post.createdAt ? formatDate(new Date(post.createdAt)) : "Не указано"}
                        </p>
                    </div>

                    {/* Автор */}
                    <div className="bg-gray-100 p-3 rounded-lg mb-4 w-full">
                        <h2 className="text-lg font-semibold text-gray-700 mb-2">Автор:</h2>
                        <p className="text-gray-600 text-center w-full">{authorName}</p>
                    </div>
                </div>

                {/* Комментарии */}
                <div className="p-6 border-t border-gray-200 w-full">
                    <h2 className="text-xl font-semibold mb-4 text-center">Комментарии</h2>
                    <div className="max-h-96 overflow-y-auto">
                        {comments.length === 0 ? (
                            <p className="text-gray-500 text-center">Комментариев пока нет.</p>
                        ) : (
                            currentComments.map((comment, index) => (
                                <div key={comment.id} className="flex items-center mb-4 w-full">
                                    <Image
                                        src={`https://cdn-icons-png.flaticon.com/512/3135/3135715.png`}
                                        alt="User icon"
                                        width={40}
                                        height={40}
                                        className="w-10 h-10 mr-3 rounded-full"
                                    />
                                    <div className="flex items-center gap-2 w-full">
                                        <p className="font-semibold">
                                            {comment.userName || "Аноним"} @{comment.userName || "user"}
                                        </p>
                                        <p className="text-gray-800 flex-1 break-words">{comment.text}</p>
                                        <p className="text-gray-500 text-sm">
                                            {comment.timestamp ? formatDate(comment.timestamp) : "Дата неизвестна"}
                                        </p>
                                    </div>
                                    {index < currentComments.length - 1 && <hr className="w-full border-gray-200 my-4" />}
                                </div>
                            ))
                        )}
                    </div>
                    {comments.length > commentsPerPage && (
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
                    <div className="mt-6 w-full">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Напишите комментарий..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                        />
                        <button
                            onClick={handleAddComment}
                            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            Добавить комментарий
                        </button>
                    </div>
                </div>

                {/* Кнопки лайка и избранного */}
                <div className="p-6 flex justify-end gap-4 border-t border-gray-200">
                    <button
                        onClick={handleLike}
                        className={`text-gray-600 hover:text-red-500 ${liked ? "text-red-500" : ""}`}
                    >
                        <svg
                            className="w-6 h-6"
                            fill={liked ? "currentColor" : "none"}
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
                    <button className="text-gray-600 hover:text-blue-500">
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
                                d="M8 12h.01M12 12h.01M16 12h.01M9 16h6a2 2 0 002-2V8a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z"
                            />
                        </svg>
                    </button>
                    <button
                        onClick={handleFavorite}
                        className={`text-gray-600 hover:text-yellow-500 ${favorited ? "text-yellow-500" : ""}`}
                    >
                        <svg
                            className="w-6 h-6"
                            fill={favorited ? "currentColor" : "none"}
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

            {isImageModalOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                    onClick={closeImageModal}
                >
                    <div className="relative p-4">
                        <Image
                            src={post.imageUrl}
                            alt={post.title}
                            layout="responsive"
                            width={800}
                            height={600}
                            objectFit="contain"
                            className="rounded-lg max-w-full max-h-screen"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button
                            className="absolute top-2 right-2 text-white text-2xl font-bold"
                            onClick={closeImageModal}
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostDetail;