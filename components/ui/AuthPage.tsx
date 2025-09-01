"use client"

import Link from "next/link"
import { useRef, useState } from "react"
import axios from "axios"
import { toast } from "react-toastify";
import { useRouter } from "next/navigation"

interface AuthResponse {
    message: string,
    token: string
}

export function AuthPage({ isSignin }: { isSignin: boolean }) {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    if(!BACKEND_URL){
        throw new Error("Backend url not provided")
    }

    const router = useRouter();

    const [loading, setLoading] = useState<boolean>(false)

    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);

    async function handleAuth() {
        const username = usernameRef.current?.value
        const password = passwordRef.current?.value
        const name = nameRef.current?.value
        if (!username || !password || (!isSignin && !name)) {
            toast.error("All fields are required");
            return;
        }
        setLoading(true)
        try {
            const response = await axios.post<AuthResponse>(`${BACKEND_URL}/api/auth/${isSignin ? "signin" : "signup"}`,
                isSignin ?
                    {
                        username,
                        password
                    }
                    :
                    {
                        name,
                        username,
                        password
                    }
            )
            console.log(response);
            toast.success(response?.data.message || "Success")
            routeToPage(response.data)
        }
        catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const errMessage = err.response?.data?.message || "An error occured during the request."
                console.log('Auth request failed.', + err);
                toast.error(errMessage);
            }

        } finally {
            setLoading(false)
        }
    }

    function routeToPage(response: AuthResponse) {
        if (response.token) {
            localStorage.setItem('Authorization', `${response.token}`)
            router.push("/dashboard")
        } else {
            router.push("/signin");
        }
    }

    return <div className="flex justify-center items-center min-w-screen min-h-screen bg-black/95 text-black overflow-hidden">
        <div className="p-6 m-2 w-88 bg-white/90 rounded-lg">
            <div className="text-4xl font-bold pb-2 flex justify-center">
                {isSignin ? "Login" : "Sign-up"}
            </div>
            <div className="text-md text-gray-600 mb-3 text-center">
                {isSignin ? "Enter your information to create an account" : "Enter your credentials to access the account"}
            </div>
            {isSignin ? null : (
                <label htmlFor="name" className="font-semibold "> Name:
                    <input
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                usernameRef.current?.focus();
                            }
                        }}
                        id="name" ref={nameRef} type="text"
                        className="font-normal rounded-md border border-black/40 px-1 py-1 w-full mb-2"
                        placeholder="John Doe" disabled={loading} />
                </label>
            )}
            <label htmlFor="username" className="font-semibold "> Username:
                <input
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            passwordRef.current?.focus();
                        }
                    }}
                    id="username" ref={usernameRef}
                    className="border font-normal w-full border-black/40 px-2 py-1 rounded-md mb-2"
                    type="text" placeholder="exapmle@gmail.com" disabled={loading} />
            </label>

            <label htmlFor="password" className="font-semibold "> Password:
                <input
                    onKeyDown={async (e) => {
                        if (e.key === "Enter") {
                            await handleAuth()
                        }
                    }}
                    id="password" type="password" ref={passwordRef}
                    className="border font-normal w-full border-black/40 px-2 py-1 mb-2 rounded-md"
                    placeholder="********" disabled={loading} />
            </label>

            <div className="pt-3 flex justify-center items-center">
                <button className="w-full bg-black/90 rounded-md text-white cursor-pointer font-semibold px-4 hover:bg-black/75 duration-300 transition-all py-1"
                    onClick={handleAuth} disabled={loading}>
                    {loading ? "Processing..." : isSignin ? "Login" : "Sign-up"}</button>
            </div>
            <div className="text-sm text-gray-500 flex justify-center pt-2">
                {isSignin ? "If you don't have an account..." : "Do you already have an account?"}
                {isSignin ? (
                    <Link href="/signup" className="text-sm text-black hover:underline hover:underline-offset-2 pl-2 hover:-translate-y-1 duration-300 transition-all
                     font-semibold">Sign-up</Link>
                ) : (
                    <Link href="/signin" className="text-sm text-black hover:underline hover:underline-offset-2 pl-2 hover:-translate-y-1 duration-300 transition-all
                     font-semibold">Sign-in</Link>
                )}
            </div>
        </div>
    </div>
}