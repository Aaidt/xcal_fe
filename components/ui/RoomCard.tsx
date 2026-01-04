'use client'

import { motion } from "framer-motion"
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { DeleteRoomModal } from "./DeleteRoomModal";
import axios from 'axios'
import { useState } from "react";
import { toast } from 'react-toastify'
import { Share } from "lucide-react";
import { useAuth } from "@clerk/nextjs";


interface RoomCardProps {
   room: {
      id: string
      slug: string
      created_at: string
      link: string
   },
   visiting: boolean,
   onRefresh?: () => void | undefined
}

export default function RoomCard({ room, visiting, onRefresh }: RoomCardProps) {
   const router = useRouter()
   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
   const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

   const { getToken } = useAuth();
   return (
      <motion.div
         initial={{ opacity: 0 }}
         whileInView={{ opacity: 1 }}
         viewport={{ once: true }}
         transition={{ duration: 0.8 }}>

         <DeleteRoomModal open={deleteModalOpen} setOpen={setDeleteModalOpen}
            onDelete={async () => {
               const token = await getToken()
               try {
                  console.log(room.id);
                  const response = await axios.delete(`${BACKEND_URL}/api/room/deleteRoom/${room.id}`, {
                     headers: { Authorization: `Bearer ${token}` }
                  });
                  toast.success(response.data.message)
                  onRefresh?.();
               } catch (err) {
                  console.log(err)
                  toast.error("Error while deleting room")
               }
            }} />

         <div
            onClick={() => router.push(`/canvas/${room.slug}`)}
            className="relative bg-white dark:bg-[#1e1e1e] border-2 border-black/10 dark:border-white/20 p-6 rounded-[255px_15px_225px_15px/15px_225px_15px_255px] 
            hover:border-indigo-400 dark:hover:border-[#A8A5FF] hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-indigo-500/10 dark:hover:shadow-[#A8A5FF]/10 group cursor-pointer h-full flex flex-col justify-between">
            
            <div className="flex items-start justify-between mb-4">
               <div>
                  <h3 className="text-2xl font-kalam font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-[#A8A5FF] transition-colors">{room.slug}</h3>
                  <p className="text-sm text-gray-500 dark:text-white/40 font-sans mt-1">Created: {new Date(room.created_at).toLocaleDateString()}</p>
               </div>
               
               {/* Decorative icon or status could go here */}
               <div className="w-8 h-8 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center bg-black/5 dark:bg-black/20">
                  <span className="text-xs text-black/30 dark:text-white/30">✎</span>
               </div>
            </div>

            <div className="border-t border-black/10 dark:border-white/10 pt-4 mt-auto flex justify-end gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
               {visiting ? (
                  <span className="text-xs text-gray-500 dark:text-white/30 font-kalam">Read Only</span>
               ) : (
                  <>
                     <button 
                        onClick={(e) => {
                           e.stopPropagation();
                           toast.success(`Share this link with your friends!!! ⚡${room.link.link}⚡`)
                        }}
                        className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full text-gray-500 dark:text-white/70 hover:text-indigo-600 dark:hover:text-[#A8A5FF] transition-colors"
                        title="Share Link"
                     >
                        <Share className="size-4" strokeWidth="2" />
                     </button>

                     <button
                        onClick={(e) => {
                           e.stopPropagation();
                           setDeleteModalOpen(true)
                        }}
                        className="p-2 hover:bg-red-500/10 rounded-full text-gray-500 dark:text-white/70 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        title="Delete Room"
                     >
                        <Trash2 className="size-4" />
                     </button>
                  </>
               )}
            </div>
         </div>
      </motion.div>
   );
}
