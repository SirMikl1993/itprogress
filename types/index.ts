export interface Post {
    id: string;
    title: string;
    description: string;
    content: string;
    imageUrl: string;
}

export interface Comment {
    id: string;
    text: string;
    userName: string;
    userId: string;
    timestamp: Date;
}