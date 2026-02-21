import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "Billennium Divas | Womenpreneurship Unleashed",
  description:
    "Billennium Divas empowers women entrepreneurs through funding, mentorship, and a strong startup ecosystem in India.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`min-h-screen bg-linear-to-br from-pink-50 via-white to-pink-50`}
      >
        {children}
      </body>
    </html>
  );
}
