import { BhwBottomNav } from "@/components/bhw-bottom-nav"

export default function BhwLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="pb-20 md:pb-0">{children}</div>
      <BhwBottomNav />
    </>
  )
}
