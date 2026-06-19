export default function ConfirmModal({ isOpen, title, requireReason, onConfirm, onCancel }) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const reason = e.target.reason?.value || '';
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold text-neutral-900 mb-2">{title}</h2>
          <p className="text-sm text-neutral-600 mb-6">
            Are you sure you want to proceed? This action will be logged in the immutable audit chain.
          </p>

          <form onSubmit={handleSubmit} id="confirm-form">
            {requireReason && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Reason <span className="text-danger-600">*</span>
                </label>
                <textarea
                  name="reason"
                  required
                  rows="3"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-danger-500 outline-none resize-none"
                  placeholder="Provide justification..."
                />
              </div>
            )}
          </form>
        </div>
        <div className="bg-neutral-50 px-6 py-4 flex justify-end gap-3 border-t border-neutral-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="confirm-form"
            className="px-4 py-2 text-sm font-medium text-white bg-danger-600 hover:bg-danger-700 rounded-lg transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
