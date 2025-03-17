import { AuthProvider } from "@/context/AuthContext";
import "../app/globals.css";
import React from "react";

export const metadata = {
    title: "My Forum App",
    description: "A forum with articles and comments",
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