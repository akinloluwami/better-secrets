import { motion } from "motion/react";
import { useState } from "react";

export function DeleteConfirmDialog({
  names,
  isPending,
  onConfirm,
  onCancel,
}: {
  names: string[];
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [confirmation, setConfirmation] = useState("");
  const expected = names.length === 1 ? names[0] : "delete";
  const isValid = confirmation === expected;

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/60 z-[60]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      />
      <motion.div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-sm bg-stone-900 border border-stone-700 rounded-lg p-6 shadow-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
      >
        <div className="text-sm font-medium mb-1">Confirm deletion</div>
        <p className="text-xs text-stone-400 mb-4">
          {names.length === 1
            ? <>This will permanently delete <span className="font-mono text-stone-200">{names[0]}</span>.</>
            : <>This will permanently delete <span className="text-stone-200">{names.length} secrets</span>.</>}
        </p>
        <p className="text-xs text-stone-400 mb-3">
          Type <span className="font-mono text-stone-200 bg-stone-800 px-1.5 py-0.5 rounded">{expected}</span> to confirm.
        </p>
        <input
          type="text"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          placeholder={expected}
          autoFocus
          className="w-full bg-stone-800 border border-stone-700 rounded-md px-3 py-2 text-sm font-mono text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-red-500 mb-4"
        />
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-3 py-2 text-xs border border-stone-700 rounded-md hover:border-stone-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!isValid || isPending}
            className="flex-1 px-3 py-2 text-xs bg-red-600 text-white rounded-md font-bold hover:bg-red-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </motion.div>
    </>
  );
}
