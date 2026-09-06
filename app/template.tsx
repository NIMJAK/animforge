import NotificationsBell from "@/components/animforge/notifications-bell";

export default function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}

      <div className="fixed bottom-6 right-6 z-[100]">
        <NotificationsBell />
      </div>
    </>
  );
}
