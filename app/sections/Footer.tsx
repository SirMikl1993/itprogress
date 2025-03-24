import Image from "next/image"; // Import Image component
import Link from "next/link";

export const Footer = () => {
    return (
        <footer className="p-4 bg-white shadow-md">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Image
                        src="/logo.png" // Adjust the path to your logo
                        alt="Logo"
                        width={50}
                        height={50}
                        className="h-10 w-auto"
                    />
                    <p className="text-gray-600">© 2023 ITProgress</p>
                </div>
                <div className="flex gap-4">
                    <Link href="/posts" className="text-teal-500 hover:underline">
                        Посты
                    </Link>
                    <Link href="/about" className="text-teal-500 hover:underline">
                        О нас
                    </Link>
                    <Link href="/contact" className="text-teal-500 hover:underline">
                        Контакты
                    </Link>
                </div>
            </div>
        </footer>
    );
};