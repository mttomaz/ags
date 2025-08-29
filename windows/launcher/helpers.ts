import { execAsync } from "ags/process"
import AstalApps from "gi://AstalApps?version=0.1"
import { win } from "./Launcher"


export function launchApp(app?: AstalApps.Application) {
  if (app) {
    win.hide()
    app.launch()
  }
}

export function webSearch(text: string) {
  if (text) {
    win.hide()
    if (text.startsWith("http")) {
      execAsync(["xdg-open", text])
    } else {
      execAsync(["xdg-open", `https://duckduckgo.com/?q=${text}`])
    }
  }
}

export function copyEmoji(emoji: string) {
  if (emoji) {
    win.hide()
    execAsync(`wl-copy "${emoji}"`)
  }
}
