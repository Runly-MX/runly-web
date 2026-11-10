import type { ImageMetadata } from "astro";

const shots = import.meta.glob<ImageMetadata>("../../assets/home-v2/slots/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default",
});

export function getHomeShot(slotId: string, theme?: "light") {
  const prefix = slotId.toLowerCase() + (theme ? `-${theme}.` : ".");
  return Object.entries(shots).find(([path]) => path.split("/").pop()?.toLowerCase().startsWith(prefix))?.[1];
}
