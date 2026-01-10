import { Dispatch, SetStateAction, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { X, Search } from 'lucide-react'

export function JoinRoomModal({
  open,
  setOpen
}: {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}) {
  const router  = useRouter()

  const [link, setLink] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  const handleJoin = async () => {
    if (!link.trim()) {
      toast.error("Please enter a valid room link.")
      return
    }

    setLoading(true)
    try {
      router.push(`/joinRoom/${link}`)
    } catch (err) {
      toast.error("Failed to join room.")
      console.log(err)
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  if (!open) return null

  return (
      <div
        onClick={() => setOpen(false)}
        className="fixed top-0 left-0 z-50 h-screen w-screen bg-black/20 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, rotate: 1 }}
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

            <h2 className="text-center text-3xl font-bold mb-6 font-kalam text-indigo-600 dark:text-[#A8A5FF]">Join an existing room</h2>

            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-sm font-kalam font-bold ml-2 opacity-70">Room Name or Link</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer opacity-50 size-5" />
                    <input
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        onKeyDown={(e) => {
                        if (e.key === 'Enter' && !loading) handleJoin()
                        }}
                        className="w-full pl-12 pr-4 py-3 bg-black/5 dark:bg-white/5 border-2 border-black/10 dark:border-white/10 rounded-[255px_15px_225px_15px/15px_225px_15px_255px] 
                        text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 dark:focus:border-[#A8A5FF] transition-colors font-kalam"
                        placeholder="e.g. awesome-collab"
                        disabled={loading}
                        autoFocus
                    />
                  </div>
               </div>

              <button
                disabled={loading}
                onClick={handleJoin}
                className={`w-full py-3 rounded-[255px_15px_225px_15px/15px_225px_15px_255px] font-bold font-kalam text-lg transition-all duration-200 cursor-pointer border-2 border-black ${loading
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed border-transparent'
                    : 'bg-green-200 dark:bg-green-900/40 text-black dark:text-green-100 border-green-800 dark:border-green-500 hover:bg-green-300 dark:hover:bg-green-900/60 shadow-[2px_2px_0px_0px_rgba(21,128,61,1)] hover:shadow-[4px_4px_0px_0px_rgba(21,128,61,1)] hover:-translate-y-1'
                    }`}
              >
                {loading ? "Joining..." : "Join Room"}
              </button>
            </div>
        </motion.div>
      </div>
  )
}