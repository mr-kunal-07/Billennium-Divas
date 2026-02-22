"use client";

import { use } from "react";
import InvoiceBuilder from "@/app/(root)/resources/invoice/new/page";

export default function InvoiceViewEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
}) {
  const { id } = use(params);
  const resolvedSearchParams = use(searchParams);
  const mode = resolvedSearchParams?.mode === "view" ? "view" : "edit";

  return <InvoiceBuilder mode={mode} invoiceId={id} />;
}
