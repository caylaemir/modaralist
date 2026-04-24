"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  setReviewStatusAction,
  deleteReviewAction,
} from "../actions";

type Props = {
  id: string;
  status: string;
};

export function ReviewActions({ id, status }: Props) {
  const [pending, startTransition] = useTransition();

  function approve() {
    startTransition(async () => {
      await setReviewStatusAction(id, "APPROVED");
      toast.success("Onaylandı.");
    });
  }

  function reject() {
    startTransition(async () => {
      await setReviewStatusAction(id, "REJECTED");
      toast.success("Reddedildi.");
    });
  }

  function revert() {
    startTransition(async () => {
      await setReviewStatusAction(id, "PENDING");
      toast.success("Beklemeye alındı.");
    });
  }

  function remove() {
    if (!confirm("Değerlendirmeyi kalıcı olarak sil?")) return;
    startTransition(async () => {
      await deleteReviewAction(id);
      toast.success("Silindi.");
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {status !== "APPROVED" ? (
        <button
          onClick={approve}
          disabled={pending}
          className="text-[11px] uppercase tracking-[0.3em] text-ink hover:text-mist disabled:opacity-50"
        >
          Onayla
        </button>
      ) : null}
      {status !== "REJECTED" ? (
        <button
          onClick={reject}
          disabled={pending}
          className="text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink disabled:opacity-50"
        >
          Reddet
        </button>
      ) : null}
      {status !== "PENDING" ? (
        <button
          onClick={revert}
          disabled={pending}
          className="text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink disabled:opacity-50"
        >
          Beklemeye al
        </button>
      ) : null}
      <button
        onClick={remove}
        disabled={pending}
        className="text-[11px] uppercase tracking-[0.3em] text-red-600 hover:text-red-800 disabled:opacity-50"
      >
        Sil
      </button>
    </div>
  );
}
