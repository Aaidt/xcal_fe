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
        <div className="p-15 min-h-screen max-w-screen mx-auto bg-background/95 text-foreground">
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
            >
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
                    <div className="relative flex space-x-4" ref={dropdownRef}>
                        <ModeToggle />
                        <SignedOut>
                            <SignInButton>
                                <button className="bg-foreground font-semibold text-background rounded-md font-medium text-sm sm:text-base h-8 sm:h-10 px-3 sm:px-5 cursor-pointer">
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
                                className="absolute translate-y-10 right-0 mt-2 w-45 bg-red-900 text-white hover:bg-red-800 
                  font-medium shadow-md rounded-md z-10"
                            >
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-sm rounded-md px-4 py-2 cursor-pointer"
                                >
                                    Logout
                                </button>
                            </motion.div>
                        )}
                    </div>
                </div>

                {loading ? <p className=" flex justify-center items-center mt-50 text-lg text-gray-500">Loading data...</p> :
                    <div>
                        <div className="mb-8 p-5 mt-8">
                            <div className="flex justify-between ">
                                <h2
                                    onClick={() => { router.push("/") }}
                                    className="cursor-pointer text-xl font-semibold mb-4"
                                >
                                    Rooms you are the admin of:
                                </h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setJoinModalOpen(true)}
                                        className="bg-foreground hover:bg-foreground/80 cursor-pointer duration-200 transition-all text-background rounded-md px-4 py-2
                  flex mb-4 gap-1 font-medium items-center text-sm">
                                        <SquarePlus className="size-4" /> Join room
                                    </button>


                                    <button
                                        onClick={() => setModalOpen(true)}
                                        className="bg-foreground hover:bg-foreground/80 cursor-pointer duration-200 transition-all text-background rounded-md px-3 py-2
                  flex mb-4 gap-1 font-medium items-center text-sm">
                                        <Plus className="size-4" /> Create room
                                    </button>

                                    <button
                                        onClick={() => setDeleteModalOpen(true)}
                                        className="bg-red-800 hover:bg-red-800/80 cursor-pointer duration-200 transition-all text-white rounded-md px-4 py-2
                  flex mb-4 gap-1 font-medium items-center text-sm">
                                        <Trash2 className="size-4" /> Delete all
                                    </button>
                                </div>
                            </div>
                            {adminRooms.length === 0 ? (
                                <p className="text-gray-500">You have not created any rooms.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {adminRooms.map((room) => (
                                        <div key={room.id}>
                                            <RoomCard room={room} visiting={false} onRefresh={() => {
                                                setRefresh(prev => !prev)
                                            }} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-5">
                            <h2 className="text-xl font-semibold mb-4">Rooms you have visited:</h2>
                            {visitedRooms.length === 0 ? (
                                <p className="text-gray-500">You havent visited any rooms yet.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
