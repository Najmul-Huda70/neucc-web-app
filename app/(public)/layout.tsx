import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="space-y-20 sm:space-y-28 pb-20 sm:pb-28">
        {children}
      </main>
      <Footer />
    </>
  );
}