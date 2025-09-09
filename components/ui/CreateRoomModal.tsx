
import { Dispatch, SetStateAction, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from "@clerk/nextjs"

interface axiosResponse {
   message: string;
   roomId: string;
}

export function CreateRoomModal({
   open,
   setOpen,
}: {
   open: boolean;
   setOpen: Dispatch<SetStateAction<boolean>>;
}) {
   const { getToken } = useAuth();

   const [slug, setSlug] = useState<string>('');
   const [loading, setLoading] = useState<boolean>(false);
   const router = useRouter();

   const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

   async function createRoom(slug: string) {
      if (!slug.trim()) {
         toast.error('Room name cannot be empty.');
         return;
      }

      const token = await getToken();
      if (!token) {
         toast.error('You need to login first!');
         router.push('/');
         return;
      }

      setLoading(true);
      try {
         const res = await axios.post<axiosResponse>(
            `${BACKEND_URL}/api/room/create`,
            { slug },
            { headers: { Authorization: `Bearer ${token}` } }
         );

         toast.success(res.data.message);
         router.push(`/canvas/${slug}`);
      } catch (err: unknown) {
         console.log('Create room request failed: ', err);
         toast.error('Failed to create room. Please try again.');
      } finally {
         setLoading(false);
      }
   }

   if (!open) return null;

   return (
      <div
         onClick={() => setOpen(false)}
         className="fixed top-0 left-0 z-50 h-screen w-screen bg-black/50 backdrop-blur-sm flex items-center justify-center"
      >
         <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="bg-zinc-900 rounded-xl shadow-xl w-full max-w-md p-6 text-white"
         >
            <h2 className="text-center text-2xl font-bold mb-4">Create a Room</h2>

            <input
               type="text"
               value={slug}
               onChange={(e) => setSlug(e.target.value)}
               onKeyDown={async (e) => {
                  if (e.key === 'Enter' && !loading) {
                     await createRoom(slug);
                  }
               }}
               className="w-full px-4 py-2 rounded-md text-white border border-white/20 text-sm mb-4 
            focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50"
               placeholder="Enter room slug (e.g. chat-room-1)"
               disabled={loading}
            />

            <button
               disabled={loading}
               onClick={async () => await createRoom(slug)}
               className={`w-full py-2 rounded-md text-sm font-semibold transition-all duration-200 cursor-pointer ${loading
                  ? 'bg-gray-500 text-white cursor-not-allowed'
                  : 'bg-white text-black hover:bg-gray-200'
                  }`}
            >
               {loading ? 'Creating...' : 'Create Room'}
            </button>
         </motion.div>
      </div>
   );
}
