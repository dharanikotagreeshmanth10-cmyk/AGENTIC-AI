// Auth pages use their own full-screen layout without Sidebar/Navbar
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
