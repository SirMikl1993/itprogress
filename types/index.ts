// Обновите тип Post, чтобы включить categories
export interface Post {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    categoryId?: string; // Исправлено: categoryId вместо category, сделано необязательным
    userId?: string;
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
}

