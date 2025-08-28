import GLib from "gi://GLib?version=2.0"

export function pathToURI(path: string): string {
  switch (true) {
    case (/^[/]/).test(path):
      return `file://${path}`

    case (/^[~]/).test(path):
    case (/^file:\/\/[~]/i).test(path):
      return `file://${GLib.get_home_dir()}/${path.replace(/^(file\:\/\/|[~]|file\:\/\[~])/i, "")}`
  }
  return path
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

  return "🌈"
}

export function getWeatherImage(desc: string): string {
  desc = desc.toLowerCase()

  if (desc.includes("sunny") || desc.includes("clear")) return "clear.png"
  if (desc.includes("partly")) return "partly_cloudy.png"
  if (desc.includes("cloudy") || desc.includes("overcast")) return "cloudy.png"
  if (desc.includes("light")) return "light_rain.png"
  if (desc.includes("rain") || desc.includes("drizzle")) return "rain.png"
  if (desc.includes("thunder")) return "storm.png"
  if (desc.includes("snow")) return "❄️"
  if (desc.includes("fog") || desc.includes("mist")) return "fog.png"

  return "other.png"
}


export function escapeMarkup(text: string): string {
  return text.replace(/&/g, "&amp")
}
