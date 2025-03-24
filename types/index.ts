export interface Post {
    id: string;
    title: string;
    description: string;
    content: string; // Добавляем поле для содержимого поста
    imageUrl: string;
    categoryId?: string | null; // Разрешаем null
    userId: string; // Делаем userId обязательным
    createdAt?: string;
}

export interface Category {
    id: string;
    name: string;
}

export interface Comment {
    id: string;
    text: string;
    userName: string;
    userId: string;
    timestamp: Date;
    postId?: string;
}