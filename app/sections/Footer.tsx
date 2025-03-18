import Link from "next/link";

export const Footer = () => {
    return (
        <footer className="p-6 bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                {/* Логотип и название */}
                <div className="flex items-center gap-3">
                    <img
                        src="/img/logo.png"
                        alt="IT.PROGRESS Logo"
                        className="w-10 h-10"
                    />
                    <h3 className="text-xl font-bold">IT.PROGRESS</h3>
                </div>

                {/* Навигация */}
                <div className="flex flex-col md:flex-row gap-4 text-center">
                    <Link href="/posts" className="hover:text-teal-400 transition duration-300">
                        Посты
                    </Link>
                    <Link href="/upload" className="hover:text-teal-400 transition duration-300">
                        Загрузить пост
                    </Link>
                    <Link href="/auth" className="hover:text-teal-400 transition duration-300">
                        Авторизация
                    </Link>
                </div>

                {/* Социальные сети */}
                <div className="flex gap-4">
                    <a
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-teal-400 transition duration-300"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.12-1.47-1.12-1.47-.91-.62.07-.61.07-.61 1.01.07 1.54 1.04 1.54 1.04.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.564 9.564 0 0112 6.8c.85.004 1.71.115 2.51.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.94.68 1.89v2.8c0 .27.18.58.69.48A10.014 10.014 0 0022 12c0-5.52-4.48-10-10-10z" />
                        </svg>
                    </a>
                    <a
                        href="https://twitter.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-teal-400 transition duration-300"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 4.56a9.87 9.87 0 01-2.83.77 4.94 4.94 0 002.16-2.73c-.95.56-2 .96-3.12 1.18a4.92 4.92 0 00-8.39 4.48A13.94 13.94 0 011.67 3.15 4.93 4.93 0 003.2 9.72a4.9 4.9 0 01-2.23-.62v.06a4.92 4.92 0 003.95 4.83 4.9 4.9 0 01-2.22.08 4.92 4.92 0 004.6 3.42A9.87 9.87 0 010 19.54a13.94 13.94 0 007.55 2.22c9.06 0 14-7.5 14-14 0-.21 0-.42-.02-.62A10 10 0 0024 4.56z" />
                        </svg>
                    </a>
                    <a
                        href="https://linkedin.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-teal-400 transition duration-300"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9.78h3.42v1.53h.05c.48-.91 1.64-1.87 3.38-1.87 3.62 0 4.28 2.38 4.28 5.48v5.53zM5.34 8.25c-1.14 0-2.06-.92-2.06-2.06S4.2 4.13 5.34 4.13s2.06.92 2.06 2.06-.92 2.06-2.06 2.06zm1.78 12.2H3.56V9.78h3.56v10.67zM22.22 0H1.78C.8 0 0 .8 0 1.78v20.44C0 23.2.8 24 1.78 24h20.44c.98 0 1.78-.8 1.78-1.78V1.78C24 .8 23.2 0 22.22 0z" />
                        </svg>
                    </a>
                </div>
            </div>

            {/* Нижняя часть футера */}
            <div className="mt-6 text-center text-gray-400 text-sm">
                <p>&copy; {new Date().getFullYear()} IT.PROGRESS. Все права защищены.</p>
            </div>
        </footer>
    );
};
