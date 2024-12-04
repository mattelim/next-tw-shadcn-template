export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header></header>
      {children}
    </>
  );
}
