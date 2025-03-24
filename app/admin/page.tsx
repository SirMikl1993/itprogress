"use client";

import { FC, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { collection, getDocs, doc, deleteDoc, updateDoc, getDoc, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import PrivateRoute from "../../components/PrivateRoute";
import { Post, Category, Comment } from "@/types";
import { Footer } from "@/app/sections/Footer";

interface AppUser {
    id: string;
    email: string;
    displayName?: string;
    role?: string;
}

const AdminPanel: FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [users, setUsers] = useState<AppUser[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [sortBy, setSortBy] = useState<"date" | "title">("date");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryInput, setNewCategoryInput] = useState("");
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editContent, setEditContent] = useState("");
    const [editCategoryId, setEditCategoryId] = useState("");
    const [editImage, setEditImage] = useState<File | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 6;
    const router = useRouter();
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            const userRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userRef);
            if (!userDoc.exists() || userDoc.data().role !== "admin") {
                alert("Доступ запрещен. Только администраторы могут войти в панель управления.");
                router.push("/posts");
                return;
            }

            const postsRef = collection(db, "posts");
            const postsSnapshot = await getDocs(postsRef);
            const postsData = postsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            } as Post));
            setPosts(postsData);

            const usersRef = collection(db, "users");
            const usersSnapshot = await getDocs(usersRef);
            const usersData = usersSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            } as AppUser));
            setUsers(usersData);

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

        fetchData();
    }, [user, router]);

    const filteredPosts = posts.filter((post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase())
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

    const handleDeletePost = async (postId: string) => {
        if (confirm("Вы уверены, что хотите удалить этот пост?")) {
            try {
                await deleteDoc(doc(db, "posts", postId));
                setPosts(posts.filter((post) => post.id !== postId));
                setComments(comments.filter((comment) => comment.postId !== postId));
            } catch (error) {
                console.error("Ошибка удаления поста:", error);
            }
        }
    };

    const handleDeleteComment = async (postId: string, commentId: string) => {
        if (confirm("Вы уверены, что хотите удалить этот комментарий?")) {
            try {
                await deleteDoc(doc(db, `posts/${postId}/comments`, commentId));
                setComments(comments.filter((comment) => comment.id !== commentId));
            } catch (error) {
                console.error("Ошибка удаления комментария:", error);
            }
        }
    };

    const handleEditCategory = (category: Category) => {
        setEditingCategory(category);
        setNewCategoryName(category.name);
    };

    const handleUpdateCategory = async () => {
        if (!editingCategory || !newCategoryName) return;
        try {
            const categoryRef = doc(db, "categories", editingCategory.id);
            await updateDoc(categoryRef, { name: newCategoryName });
            setCategories(
                categories.map((cat) =>
                    cat.id === editingCategory.id ? { ...cat, name: newCategoryName } : cat
                )
            );
            setEditingCategory(null);
            setNewCategoryName("");
        } catch (error) {
            console.error("Ошибка обновления категории:", error);
        }
    };

    const handleDeleteCategory = async (categoryId: string) => {
        if (confirm("Вы уверены, что хотите удалить эту категорию? Посты с этой категорией останутся без категории.")) {
            try {
                await deleteDoc(doc(db, "categories", categoryId));
                setCategories(categories.filter((cat) => cat.id !== categoryId));
                const updatedPosts = posts.map((post) =>
                    post.categoryId === categoryId ? { ...post, categoryId: undefined } : post
                );
                setPosts(updatedPosts);
            } catch (error) {
                console.error("Ошибка удаления категории:", error);
            }
        }
    };

    const handleAddCategory = async () => {
        if (!newCategoryInput.trim()) {
            alert("Название категории не может быть пустым.");
            return;
        }

        if (categories.some((cat) => cat.name.toLowerCase() === newCategoryInput.trim().toLowerCase())) {
            alert("Категория с таким названием уже существует.");
            return;
        }

        try {
            const newCategory = {
                name: newCategoryInput.trim(),
            };
            const docRef = await addDoc(collection(db, "categories"), newCategory);
            setCategories([...categories, { id: docRef.id, name: newCategoryInput.trim() }]);
            setNewCategoryInput("");
        } catch (error) {
            console.error("Ошибка добавления категории:", error);
            alert("Не удалось добавить категорию.");
        }
    };

    const handleEditPost = (post: Post) => {
        setEditingPost(post);
        setEditTitle(post.title);
        setEditDescription(post.description);
        setEditContent(post.content);
        setEditCategoryId(post.categoryId || "");
    };

    const handleUpdatePost = async () => {
        if (!editingPost || !editTitle || !editDescription || !editContent) return;

        try {
            let updatedImageUrl = editingPost.imageUrl;

            if (editImage) {
                const imageRef = ref(storage, `images/${editImage.name}`);
                await uploadBytes(imageRef, editImage);
                updatedImageUrl = await getDownloadURL(imageRef);
            }

            const postRef = doc(db, "posts", editingPost.id);
            const updatedPost = {
                title: editTitle,
                description: editDescription,
                content: editContent,
                categoryId: editCategoryId || undefined,
                imageUrl: updatedImageUrl,
                createdAt: editingPost.createdAt,
            };

            await updateDoc(postRef, updatedPost);
            setPosts(
                posts.map((post) =>
                    post.id === editingPost.id ? { ...post, ...updatedPost } : post
                )
            );
            setEditingPost(null);
            setEditTitle("");
            setEditDescription("");
            setEditContent("");
            setEditCategoryId("");
            setEditImage(null);
        } catch (error) {
            console.error("Ошибка обновления поста:", error);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setEditImage(e.target.files[0]);
        }
    };

    const formatDate = (date: Date | undefined) =>
        date
            ? `${date.toLocaleDateString("ru-RU")} ${date.toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
            })}`
            : "Не указано";

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    return (
        <PrivateRoute>
            <div className="min-h-screen bg-gray-200 flex flex-col">
                <header className="p-4 bg-white shadow-md">
                    <div className="max-w-6xl mx-auto flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-600">Панель администратора</h1>
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
                        <section className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">Список постов</h2>
                            <div className="mb-4 flex gap-4 flex-wrap">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="Поиск по названию..."
                                    className="p-2 border rounded-lg flex-1 min-w-[200px]"
                                />
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
                                                {editingPost?.id === post.id ? (
                                                    <div className="flex flex-col gap-4">
                                                        <input
                                                            type="text"
                                                            value={editTitle}
                                                            onChange={(e) => setEditTitle(e.target.value)}
                                                            placeholder="Заголовок"
                                                            className="p-2 border rounded-lg"
                                                        />
                                                        <textarea
                                                            value={editDescription}
                                                            onChange={(e) => setEditDescription(e.target.value)}
                                                            placeholder="Описание"
                                                            className="p-2 border rounded-lg"
                                                            rows={4}
                                                        />
                                                        <textarea
                                                            value={editContent}
                                                            onChange={(e) => setEditContent(e.target.value)}
                                                            placeholder="Содержимое"
                                                            className="p-2 border rounded-lg"
                                                            rows={6}
                                                        />
                                                        <select
                                                            value={editCategoryId}
                                                            onChange={(e) => setEditCategoryId(e.target.value)}
                                                            className="p-2 border rounded-lg"
                                                        >
                                                            <option value="">Без категории</option>
                                                            {categories.map((cat) => (
                                                                <option key={cat.id} value={cat.id}>
                                                                    {cat.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleImageChange}
                                                            className="p-2 border rounded-lg"
                                                        />
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={handleUpdatePost}
                                                                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
                                                            >
                                                                Сохранить
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingPost(null)}
                                                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                                                            >
                                                                Отмена
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Image
                                                            src={post.imageUrl}
                                                            alt={post.title}
                                                            width={400}
                                                            height={160}
                                                            className="w-full h-40 object-cover rounded-t-lg mb-4"
                                                        />
                                                        <h3 className="text-lg font-semibold">{post.title}</h3>
                                                        <p className="text-gray-600 mb-2">{post.description}</p>
                                                        <p className="text-gray-500 text-sm">
                                                            Категория: {categories.find((cat) => cat.id === (post.categoryId ?? undefined))?.name || "Без категории"}
                                                        </p>
                                                        <p className="text-gray-500 text-sm">
                                                            Дата: {formatDate(post.createdAt ? new Date(post.createdAt) : undefined)}
                                                        </p>
                                                        <div className="flex gap-2 mt-2">
                                                            <button
                                                                onClick={() => handleEditPost(post)}
                                                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                                                            >
                                                                Редактировать
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeletePost(post.id)}
                                                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                                            >
                                                                Удалить
                                                            </button>
                                                        </div>
                                                    </>
                                                )}
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
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">Список пользователей</h2>
                            {users.length === 0 ? (
                                <p className="text-gray-500">Пользователи не найдены.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {users.map((appUser) => (
                                        <div
                                            key={appUser.id}
                                            className="bg-white rounded-lg shadow-md p-4"
                                        >
                                            <p className="font-semibold">{appUser.displayName || "Без имени"}</p>
                                            <p className="text-gray-600">{appUser.email}</p>
                                            <p className="text-gray-500">Роль: {appUser.role || "user"}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-semibold mb-4">Управление категориями</h2>
                            <div className="mb-6 bg-white rounded-lg shadow-md p-4">
                                <h3 className="text-lg font-semibold mb-2">Добавить новую категорию</h3>
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        value={newCategoryInput}
                                        onChange={(e) => setNewCategoryInput(e.target.value)}
                                        placeholder="Название категории"
                                        className="p-2 border rounded-lg flex-1"
                                    />
                                    <button
                                        onClick={handleAddCategory}
                                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                                    >
                                        Добавить
                                    </button>
                                </div>
                            </div>

                            {categories.length === 0 ? (
                                <p className="text-gray-500">Категории не найдены.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {categories.map((category) => (
                                        <div
                                            key={category.id}
                                            className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center"
                                        >
                                            {editingCategory?.id === category.id ? (
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={newCategoryName}
                                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                                        className="p-2 border rounded-lg w-full mb-2"
                                                    />
                                                    <button
                                                        onClick={handleUpdateCategory}
                                                        className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition mr-2"
                                                    >
                                                        Сохранить
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingCategory(null)}
                                                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                                                    >
                                                        Отмена
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <span>{category.name}</span>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleEditCategory(category)}
                                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                                                        >
                                                            Редактировать
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteCategory(category.id)}
                                                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                                        >
                                                            Удалить
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-4">Управление комментариями</h2>
                            {comments.length === 0 ? (
                                <p className="text-gray-500">Комментарии не найдены.</p>
                            ) : (
                                <div className="space-y-4">
                                    {comments.map((comment) => (
                                        <div
                                            key={comment.id}
                                            className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center"
                                        >
                                            <div>
                                                <p className="font-semibold">{comment.userName || "Аноним"}</p>
                                                <p className="text-gray-600">{comment.text}</p>
                                                <p className="text-gray-500 text-sm">
                                                    Пост ID: {comment.postId} | Дата: {formatDate(comment.timestamp)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteComment(comment.postId!, comment.id)}
                                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </main>

                <Footer />
            </div>
        </PrivateRoute>
    );
};

export default AdminPanel;