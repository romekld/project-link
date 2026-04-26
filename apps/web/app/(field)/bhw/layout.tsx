import { BhwBottomNav } from "@/components/bhw-bottom-nav";

export default function BhwLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="pb-24 md:pb-0 pt-3 px-3">{children}</div>
      <BhwBottomNav />
    </>
  );
}
