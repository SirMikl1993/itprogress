"use client";

import { FC, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

const PrivateRoute: FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Если пользователь не авторизован, перенаправляем на страницу авторизации
        if (!user) {
            router.push("/auth");
        }
    }, [user, router]);

    // Если пользователь не авторизован, возвращаем null, чтобы избежать рендеринга дочерних компонентов
    if (!user) {
        return null;
    }

    // Если пользователь авторизован, рендерим дочерние компоненты
    return <>{children}</>;
};

export default PrivateRoute;