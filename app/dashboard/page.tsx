"use client";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast } from 'react-toastify'
import RoomCard from "@/components/ui/RoomCard";
import { motion } from "framer-motion";
import { Plus, Trash2, SquarePlus } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { CreateRoomModal } from "@/components/ui/CreateRoomModal";
import { DeleteRoomModal } from "@/components/ui/DeleteRoomModal";
import { JoinRoomModal } from "@/components/ui/JoinRoomModal";
import { ModeToggle } from "@/components/ui/ModeToggle"
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

interface Room {
    id: string
    created_at: string
    slug: string
    link: string
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function Dashboard() {
    const { getToken } = useAuth();
    const router = useRouter();

    const [adminRooms, setAdminRooms] = useState<Room[]>([]);
    const [visitedRooms, setVisitedRooms] = useState<Room[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState<boolean>(false)
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState<boolean>(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false)
    const [refresh, setRefresh] = useState<boolean>(false)
    const [joinModalOpen, setJoinModalOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) { setIsOpen(false) }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("Authorization");
        router.push("/");
    };

    useEffect(() => {
        const fetchData = async () => {
            const token = await getToken()
            try {
                setLoading(true)
                const admin = await axios.get<{ adminRooms: Room[] }>(`${BACKEND_URL}/api/room/admin`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    }
                );
                // console.log(admin.data.adminRooms)
                setAdminRooms(admin.data.adminRooms || []);

                const visited = await axios.get<{ visitedRooms: Room[] }>(`${BACKEND_URL}/api/room/visited`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        }
                    }
                );
                // console.log(visited.data.visitedRooms)
                setVisitedRooms(visited.data.visitedRooms || []);
            } catch (err) {
                console.log(err);
                toast.error('Could not fetch your rooms')
            } finally { setLoading(false) }
        }
        fetchData();
    }, [refresh]);



    return (
        <div className="min-h-screen max-w-screen mx-auto bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white relative overflow-hidden font-sans selection:bg-[#A8A5FF] selection:text-black transition-colors duration-300">
             {/* Dot Grid Background */}
             <div className="absolute inset-0 opacity-[0.15] pointer-events-none"
             style={{ 
                 backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)', 
                 backgroundSize: '24px 24px' 
             }}>
            </div>

            <CreateRoomModal open={modalOpen} setOpen={setModalOpen} />

            <DeleteRoomModal open={deleteModalOpen} setOpen={setDeleteModalOpen}
                onDelete={async () => {
                    try {
                        const token = await getToken();
                        const response = await axios.delete(`${BACKEND_URL}/api/room/deleteAll`, {
                            headers: {
                                Authorization: `Bearer ${token}`
                            },
                        });
                        toast.success(response.data.message)
                    } catch (err) {
                        console.log(err)
                        toast.error("Error while deleting room")
                    } finally {
                        setRefresh(prev => !prev)
                    }
                }
                }
            />

            <JoinRoomModal open={joinModalOpen} setOpen={setJoinModalOpen} />

            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative z-10 p-8 md:p-12"
            >
                <div className="flex justify-between items-center mb-12 border-b border-black/10 dark:border-white/10 pb-6">
                    <h1 className="text-4xl md:text-5xl font-kalam font-bold text-indigo-600 dark:text-[#A8A5FF]">Dashboard</h1>
                    <div className="relative flex space-x-4 items-center" ref={dropdownRef}>
                        <ModeToggle />
                        <SignedOut>
                            <SignInButton>
                                <button className="bg-black dark:bg-white text-white dark:text-black font-kalam font-bold rounded-[255px_15px_225px_15px/15px_225px_15px_255px] px-6 py-2 cursor-pointer hover:opacity-80 transition-all border-2 border-transparent">
                                    Login
                                </button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <UserButton />
                        </SignedIn>

                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.2 }}
                                className="absolute top-12 right-0 mt-2 w-48 bg-white dark:bg-[#1e1e1e] border-2 border-black/10 dark:border-white/20 text-gray-900 dark:text-white 
                                shadow-xl rounded-[255px_15px_225px_15px/15px_225px_15px_255px] z-50 overflow-hidden"
                            >
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left font-kalam px-6 py-3 hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-red-500 dark:text-red-400"
                                >
                                    Logout
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>

                {loading ? <p className="flex justify-center items-center mt-32 text-xl font-kalam text-gray-400 dark:text-white/50 animate-pulse">Loading your canvas...</p> :
                    <div className="space-y-16">
                        {/* Admin Rooms Section */}
                        <div>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                                <h2
                                    onClick={() => { router.push("/") }}
                                    className="cursor-pointer text-3xl font-kalam font-bold hover:text-indigo-600 dark:hover:text-[#A8A5FF] transition-colors"
                                >
                                    Your Artifacts
                                </h2>
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={() => setJoinModalOpen(true)}
                                        className="bg-transparent text-gray-700 dark:text-white border-2 border-black/10 dark:border-white/20 hover:border-black/30 dark:hover:border-white hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-all 
                                        rounded-[255px_15px_225px_15px/15px_225px_15px_255px] px-5 py-2.5 font-kalam font-bold flex items-center gap-2 text-sm md:text-base hover:-translate-y-1">
                                        <SquarePlus className="size-5" /> Join Room
                                    </button>

                                    <button
                                        onClick={() => setModalOpen(true)}
                                        className="bg-indigo-300 dark:bg-[#A8A5FF] text-black border-2 border-black hover:bg-indigo-400 dark:hover:bg-[#B8B5FF] cursor-pointer transition-all 
                                        rounded-[255px_15px_225px_15px/15px_225px_15px_255px] px-5 py-2.5 font-kalam font-bold flex items-center gap-2 text-sm md:text-base hover:-translate-y-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <Plus className="size-5" /> Create New
                                    </button>

                                    <button
                                        onClick={() => setDeleteModalOpen(true)}
                                        className="bg-red-500/10 text-red-600 dark:text-red-400 border-2 border-red-500/30 hover:border-red-500 hover:bg-red-500/20 cursor-pointer transition-all 
                                        rounded-[255px_15px_225px_15px/15px_225px_15px_255px] px-5 py-2.5 font-kalam font-bold flex items-center gap-2 text-sm md:text-base hover:-translate-y-1">
                                        <Trash2 className="size-5" /> Clear All
                                    </button>
                                </div>
                            </div>
                            
                            {adminRooms.length === 0 ? (
                                <div className="border-2 border-dashed border-black/10 dark:border-white/20 rounded-3xl p-12 text-center bg-black/5 dark:bg-white/5">
                                    <p className="text-gray-500 dark:text-white/40 font-kalam text-xl">You haven't created any rooms yet. Time to draw!</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {adminRooms.map((room) => (
                                        <div key={room.id} className="relative group">
                                            {/* decorative shadow element */}
                                            <div className="absolute inset-0 bg-black/5 dark:bg-white/5 rounded-[255px_15px_225px_15px/15px_225px_15px_255px] rotate-1 scale-[1.02] -z-10 group-hover:rotate-2 group-hover:bg-indigo-500/10 dark:group-hover:bg-[#A8A5FF]/20 transition-all duration-300"></div>
                                            <RoomCard room={room} visiting={false} onRefresh={() => {
                                                setRefresh(prev => !prev)
                                            }} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Visited Rooms Section */}
                        <div>
                            <h2 className="text-3xl font-kalam font-bold mb-8 text-gray-700 dark:text-white/80">Recently Visited</h2>
                            {visitedRooms.length === 0 ? (
                                <div className="border-2 border-dashed border-black/10 dark:border-white/20 rounded-3xl p-8 text-center bg-black/5 dark:bg-white/5 opacity-60">
                                    <p className="text-gray-500 dark:text-white/40 font-kalam text-lg">No visited rooms history found.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {visitedRooms.map((room) => (
                                        <div key={room.id}>
                                            <RoomCard room={room} visiting={true} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                }
            </motion.div>
        </div>
    );
}
