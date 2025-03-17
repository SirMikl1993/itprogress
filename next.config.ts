import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "firebasestorage.googleapis.com",
                port: "",
                pathname: "/v0/b/blog-65967.appspot.com/o/**",
            },
            {
                protocol: "https",
                hostname: "cdn-icons-png.flaticon.com",
                port: "",
                pathname: "/**",
            },
        ],
    },
};

export default nextConfig;
