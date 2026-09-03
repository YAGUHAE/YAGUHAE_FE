"use client";

import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./button";

export type DialogAction = {
  label: string;
  onClick?: () => void;
};

export type DialogPanelProps = HTMLAttributes<HTMLDivElement> & {
  title: string;
  description?: ReactNode;
  /** 주요 액션 (Primary). */
  primary: DialogAction;
  /** 보조 액션 (Secondary). 있으면 Actions=Two. */
  secondary?: DialogAction;
};

/** Figma `Dialog`의 카드 부분. 모달 껍데기 없이 그대로 배치할 때(갤러리·인라인) 씁니다. */
export function DialogPanel({
  title,
  description,
  primary,
  secondary,
  className,
  ...rest
}: DialogPanelProps) {
  return (
    <div
      className={cn(
        "flex w-[300px] max-w-full flex-col gap-sm rounded-lg bg-bg-default px-2xl pt-2xl pb-lg shadow-dialog",
        className,
      )}
      {...rest}
    >
      <h2 className="type-heading-sm text-text-default">{title}</h2>
      {description ? <p className="type-body-md text-text-secondary">{description}</p> : null}
      <div className="flex gap-sm pt-sm">
        {secondary ? (
          <Button variant="secondary" size="medium" className="min-w-0 flex-1" onClick={secondary.onClick}>
            {secondary.label}
          </Button>
        ) : null}
        <Button size="medium" className="min-w-0 flex-1" onClick={primary.onClick}>
          {primary.label}
        </Button>
      </div>
    </div>
  );
}

export type DialogProps = DialogPanelProps & {
  open: boolean;
  /** 배경 탭 · Esc · 액션 후 닫힐 때 호출됩니다. */
  onClose: () => void;
};

/**
 * Figma `Dialog` — Actions(One/Two). 네이티브 `<dialog>`의 `showModal()`로 포커스 트랩·Esc를 얻습니다.
 * P-5 제출 실패(GAME_NOT_OPEN · TIME_SLOT_CONFLICT), 취소 확인에 사용.
 */
export function Dialog({ open, onClose, className, ...panel }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto bg-transparent p-lg backdrop:bg-bg-overlay/40 open:flex"
    >
      <DialogPanel className={className} {...panel} />
    </dialog>
  );
}
