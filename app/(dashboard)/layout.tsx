"use client";

import LandingLayout from "@/components/LandingLayout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LandingLayout>{children}</LandingLayout>;
}
