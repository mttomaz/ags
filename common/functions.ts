import { Gdk, Gtk } from "ags/gtk4"
import GLib from "gi://GLib?version=2.0";

export function isIcon(icon?: string | null) {
  const iconTheme = Gtk.IconTheme.get_for_display(Gdk.Display.get_default()!)
  return icon && iconTheme.has_icon(icon)
}

export function pathToURI(path: string): string {
    switch(true) {
        case (/^[/]/).test(path):
            return `file://${path}`;

        case (/^[~]/).test(path):
        case (/^file:\/\/[~]/i).test(path):
            return `file://${GLib.get_home_dir()}/${path.replace(/^(file\:\/\/|[~]|file\:\/\[~])/i, "")}`;
    }
    return path;
}

export function getWeatherEmoji(desc: string): string {
  desc = desc.toLowerCase()

  if (desc.includes("sunny") || desc.includes("clear")) return "☀️"
  if (desc.includes("partly")) return "⛅"
  if (desc.includes("cloudy") || desc.includes("overcast")) return "☁️"
  if (desc.includes("rain") || desc.includes("drizzle")) return "🌧️"
  if (desc.includes("thunder")) return "⛈️"
  if (desc.includes("snow")) return "❄️"
  if (desc.includes("fog") || desc.includes("mist")) return "🌫️"

  return "🌈" // fallback
}

export function getWeatherImage(desc: string): string {
  desc = desc.toLowerCase()

  if (desc.includes("sunny") || desc.includes("clear")) return "clear.png"
  if (desc.includes("partly")) return "partly_cloudy.png"
  if (desc.includes("cloudy") || desc.includes("overcast")) return "cloudy.png"
  if (desc.includes("light")) return "light_rain.png" // inclui tbm o light drizzle
  if (desc.includes("rain") || desc.includes("drizzle")) return "rain.png"
  if (desc.includes("thunder")) return "storm.png"
  // if (desc.includes("snow")) return "❄️"
  if (desc.includes("fog") || desc.includes("mist")) return "fog.png"

  return "other.png"
}

export function getWifiIcon(icon: string): string {
  if (icon.includes("offline")) return "󰤮"
  if (icon.includes("no-route")) return "󰤭"
  if (icon.includes("connected")) return "󰤫"
  if (icon.includes("signal-none")) return "󰤯"
  if (icon.includes("signal-weak")) return "󰤟"
  if (icon.includes("signal-ok")) return "󰤢"
  if (icon.includes("signal-good")) return "󰤥"
  if (icon.includes("encrypted")) return "󰤪"
  return "󰤨"
}

export function escapeMarkup(text: string): string {
  return text.replace(/&/g, "&amp;");
}
