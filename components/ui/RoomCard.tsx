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
            className="border border-foreground/10 bg-foreground/5 p-4 rounded-md hover:bg-foreground/10 duration-200
       shadow hover:shadow-lg transition cursor-pointer">
            <div
               onClick={() => router.push(`/canvas/${room.slug}`)}
               className="flex items-center justify-between">
               <div>
                  <h3 className="text-lg font-medium">{room.slug}</h3>
                  <p className="text-sm text-gray-500">Created: {new Date(room.created_at).toLocaleDateString()}</p>
               </div>

               {visiting ? null : <div className="flex gap-6">

                  <Share onClick={(e) => {
                     e.stopPropagation();
                     toast.success(`Share this link with your friends!!! ⚡${room.link.link}⚡`)
                  }} className="size-4 cursor-pointer" strokeWidth="1.5" />

                  <Trash2
                     className="size-4 cursor-pointer hover:text-red-700 text-red-800"
                     onClick={(e) => {
                        e.stopPropagation();
                        setDeleteModalOpen(true)
                     }}
                  />
               </div>
               }
            </div>
         </div>
      </motion.div>
   );
}
