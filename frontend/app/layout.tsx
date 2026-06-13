import "./globals.css";
import React from "react";

export const metadata = {
  title: 'AI Doc QA',
  description: 'Assistant and admin for document QA'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
