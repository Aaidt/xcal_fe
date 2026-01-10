import { Dispatch, SetStateAction, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from "@clerk/nextjs"
import { X } from 'lucide-react';

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
         className="fixed top-0 left-0 z-50 h-screen w-screen bg-black/20 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      >
         <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, rotate: -1 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
            className="relative bg-white dark:bg-[#1e1e1e] rounded-[255px_15px_225px_15px/15px_225px_15px_255px] border-2 border-black/10 dark:border-white/20 shadow-xl w-full max-w-md p-8 text-gray-900 dark:text-white"
         >
            <button 
               onClick={() => setOpen(false)}
               className="absolute top-4 right-4 p-2 text-gray-500 hover:text-red-500 transition-colors"
            >
               <X className="size-5" />
            </button>

            <h2 className="text-center text-3xl font-bold mb-6 font-kalam text-indigo-600 dark:text-[#A8A5FF]">Create a Room</h2>

            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-sm font-kalam font-bold ml-2 opacity-70">Room Name</label>
                  <input
                     type="text"
                     value={slug}
                     onChange={(e) => setSlug(e.target.value)}
                     onKeyDown={async (e) => {
                        if (e.key === 'Enter' && !loading) {
                           await createRoom(slug);
                        }
                     }}
                     className="w-full px-4 py-3 bg-black/5 dark:bg-white/5 border-2 border-black/10 dark:border-white/10 rounded-[255px_15px_225px_15px/15px_225px_15px_255px] 
                     text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 dark:focus:border-[#A8A5FF] transition-colors font-kalam"
                     placeholder="e.g. brainstorming-session"
                     disabled={loading}
                     autoFocus
                  />
               </div>

               <button
                  disabled={loading}
                  onClick={async () => await createRoom(slug)}
                  className={`w-full py-3 rounded-[255px_15px_225px_15px/15px_225px_15px_255px] font-bold font-kalam text-lg transition-all duration-200 cursor-pointer border-2 border-black ${loading
                     ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed border-transparent'
                     : 'bg-indigo-300 dark:bg-[#A8A5FF] text-black hover:bg-indigo-400 dark:hover:bg-[#B8B5FF] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1'
                     }`}
               >
                  {loading ? 'Creating...' : 'Start Drawing!'}
               </button>
            </div>
         </motion.div>
      </div>
   );
}
