import { Dispatch, SetStateAction, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'

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

  return (
    open && (
      <div
        onClick={() => setOpen(false)}
        className="fixed top-0 left-0 z-50 h-screen w-screen bg-black/50 backdrop-blur-sm flex items-center justify-center"
      >
        <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-zinc-900 rounded-lg shadow-xl w-full max-w-md p-8 text-white "
        >
            <div className="font-bold text-3xl pb-1  flex justify-center">
              Join Room
            </div>

            <div className="flex justify-center items-center gap-2 mt-5">
              <input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading) handleJoin()
                }}
                className="bg-white rounded-md text-sm text-black px-3 py-2 w-full"
                placeholder="Enter room slug or full link"
                disabled={loading}
              />
              <button
                disabled={loading}
                onClick={handleJoin}
                className="rounded-md font-bold px-4 py-2 text-sm bg-green-800 text-white hover:bg-green-600 cursor-pointer duration-200 transition-all"
              >
                {loading ? "Joining..." : "Join"}
              </button>
            </div>
        </motion.div>
      </div>
    )
  )
}