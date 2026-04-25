import { getAllSettings } from "@/lib/settings";

export async function AnnouncementBanner() {
  const settings = await getAllSettings();
  if (settings["shop.announcementActive"] !== "true") return null;
  const text = settings["shop.announcementText"]?.trim();
  if (!text) return null;

  return (
    <div className="bg-ink text-paper">
      <div className="mx-auto max-w-[1600px] px-5 py-2.5 text-center text-[11px] uppercase tracking-[0.3em] md:px-10">
        {text}
      </div>
    </div>
  );
}
