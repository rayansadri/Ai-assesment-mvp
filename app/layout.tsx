import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Passage Assessment",
  description: "Build and manage candidate assessment programs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ height: '100%' }}>
      <head>
        <style>{`
          :root {
            --bg: #F0F2F5;
            --panel: #FFFFFF;
            --border: rgba(0,0,0,0.08);
            --border2: rgba(0,0,0,0.14);
            --accent: #3451D1;
            --accent-hover: #2B44B8;
            --accent-light: rgba(52,81,209,0.08);
            --accent-light2: rgba(52,81,209,0.15);
            --text: #111827;
            --text2: #6B7280;
            --text3: #9CA3AF;
            --green: #16A34A;
            --green-bg: rgba(22,163,74,0.08);
            --amber: #D97706;
            --amber-bg: rgba(217,119,6,0.08);
            --red: #DC2626;
            --purple: #7C3AED;
            --purple-bg: rgba(124,58,237,0.08);
            --teal: #0891B2;
            --teal-bg: rgba(8,145,178,0.08);
            --sb-bg: #1A2B4A;
            --sb-text: rgba(255,255,255,0.88);
            --sb-text2: rgba(255,255,255,0.48);
            --sb-hover: rgba(255,255,255,0.06);
            --sb-active: rgba(255,255,255,0.12);
            --sb-border: rgba(255,255,255,0.08);
            --radius: 10px;
            --radius-lg: 14px;
            --shadow-sm: 0 1px 2px rgba(0,0,0,0.06);
            --shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
            --shadow-md: 0 4px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05);
          }
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          html, body { height: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif; background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }
          input, textarea, select, button { font-family: inherit; }
          textarea { resize: none; outline: none; }
          ::-webkit-scrollbar { width: 5px; height: 5px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 3px; }
          ::selection { background: rgba(52,81,209,0.15); }
          @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
          @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
          .fade-up { animation: fadeUp 0.2s ease-out; }
          .fade-in { animation: fadeIn 0.15s ease-out; }
        `}</style>
      </head>
      <body style={{ height: '100%' }}>
        {children}
      </body>
    </html>
  );
}
