import { Dispatch, SetStateAction, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { AlertCircle, X } from 'lucide-react';

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

        <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center text-red-500 dark:text-red-400 mb-4">
                <AlertCircle className="size-6" />
            </div>

            <h2 className="text-2xl font-bold mb-2 font-kalam">Confirm Deletion</h2>

            <p className="text-gray-500 dark:text-gray-400 mb-8 font-kalam text-lg">
                Are you sure you want to delete this? This action cannot be undone.
            </p>

            <div className="flex gap-4 w-full">
                <button
                    onClick={() => setOpen(false)}
                    className="flex-1 py-2.5 rounded-[255px_15px_225px_15px/15px_225px_15px_255px] border-2 border-black/10 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/5 font-bold font-kalam text-gray-700 dark:text-white transition-all cursor-pointer"
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    onClick={handleDelete}
                    className={`flex-1 py-2.5 rounded-[255px_15px_225px_15px/15px_225px_15px_255px] font-bold font-kalam text-white transition-all cursor-pointer border-2 border-transparent ${
                    loading
                        ? 'bg-red-300 cursor-not-allowed'
                        : 'bg-red-500 hover:bg-red-600 shadow-[2px_2px_0px_0px_rgba(220,38,38,0.4)] hover:shadow-[4px_4px_0px_0px_rgba(220,38,38,0.4)] hover:-translate-y-1'
                    }`}
                    disabled={loading}
                >
                    {loading ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </div>
      </motion.div>
    </div>
  );
}