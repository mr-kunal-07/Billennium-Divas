import type { Metadata } from "next";
import "./globals.css";
import Provider from "@/Provider";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

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
        className={`${poppins.className}  min-h-screen bg-linear-to-br from-pink-50 via-white to-pink-50`}
      >
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
