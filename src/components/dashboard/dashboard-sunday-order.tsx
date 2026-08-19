"use client";

import type { ReactNode } from "react";
import { isSundayReviewPromoted } from "@/lib/reminders";

export function DashboardSundayOrder({
  reviewWidget,
  children,
}: {
  reviewWidget: ReactNode;
  children: ReactNode;
}) {
  const promoteReview = isSundayReviewPromoted(new Date());

  if (promoteReview) {
    return (
      <>
        {reviewWidget}
        {children}
      </>
    );
  }

  return (
    <>
      {children}
      {reviewWidget}
    </>
  );
}
