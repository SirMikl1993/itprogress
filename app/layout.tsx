import { AuthProvider } from "@/context/AuthContext";
import "../app/globals.css";
import React from "react";
import "highlight.js/styles/github.css";

export const metadata = {
    title: "IT.PROGRESS",
    description: "Всё о программировании – ваш портал в мир кода",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>
        <AuthProvider>{children}</AuthProvider>
        </body>
        </html>
    );
}