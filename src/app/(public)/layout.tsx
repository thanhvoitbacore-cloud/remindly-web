import FluidCursor from '@/components/FluidCursor';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <FluidCursor />
      {children}
    </>
  )
}
