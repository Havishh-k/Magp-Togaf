import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';

export default function ConfirmModal({ isOpen, title, requireReason, onConfirm, onCancel }) {
  const [reason, setReason] = useState('');
  const [confirmWord, setConfirmWord] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (confirmWord !== 'CONFIRM') return;
    onConfirm(reason);
    setReason('');
    setConfirmWord('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Are you sure you want to proceed? This action will be logged in the immutable audit chain.
            Please type <strong>CONFIRM</strong> to proceed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="confirm-form" className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Type CONFIRM <span className="text-destructive">*</span>
            </label>
            <Input
              required
              value={confirmWord}
              onChange={(e) => setConfirmWord(e.target.value)}
              placeholder="CONFIRM"
              className="w-full"
            />
          </div>

          {requireReason && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Reason <span className="text-destructive">*</span>
              </label>
              <Input
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Provide justification..."
                className="w-full"
              />
            </div>
          )}
        </form>

        <DialogFooter className="sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            form="confirm-form" 
            variant="destructive"
            disabled={confirmWord !== 'CONFIRM'}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
