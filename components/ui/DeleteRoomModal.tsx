import { Dispatch, SetStateAction, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify'

export function DeleteRoomModal({
  open,
  setOpen,
  onDelete,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  onDelete: () => Promise<void>; 
}) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete();
      setOpen(false);
    } catch (err) {
      console.error('Error deleting:', err);
      toast.error('Error deleting...')
    } finally {
      setLoading(false);
    }
  };

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
        className="bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md p-6 text-white"
      >
        <h2 className="text-center text-2xl font-bold mb-4">Confirm Deletion</h2>

        <p className="text-center text-sm text-gray-300 mb-6">
          Are you sure you want to delete this item? This action cannot be undone.
        </p>

        <div className="flex justify-center gap-3">
          <button
            onClick={() => setOpen(false)}
            className="px-8 py-2 rounded-md bg-white/80 font-semibold hover:bg-white/90 text-black text-sm transition-all cursor-pointer"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className={`px-8 py-2 rounded-md text-sm font-semibold transition-all duration-200 cursor-pointer ${
              loading
                ? 'bg-red-800/60 cursor-not-allowed'
                : 'bg-red-800 hover:bg-red-700'
            }`}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}