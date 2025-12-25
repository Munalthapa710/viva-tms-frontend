import "./globals.css";
import LandingLayout from "../components/LandingLayout";
import { Toaster } from "react-hot-toast";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LandingLayout>
          {children}
          <Toaster position="top-right" />
        </LandingLayout>
      </body>
    </html>
  );
}
