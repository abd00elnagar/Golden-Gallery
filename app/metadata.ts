import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aldhabi Store",
    short_name: "Aldahbi",
    description: "Your one-stop shop for luxury jewelry.",
    start_url: "/",
    display: "standalone",
    background_color: "#fff",
    theme_color: "#FFD700",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
