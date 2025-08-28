import { exec, execAsync } from "ags/process"
import AstalApps from "gi://AstalApps?version=0.1"
import { setShowLauncher } from "@common/vars"


export function launchApp(app?: AstalApps.Application) {
  if (app) {
    setShowLauncher(false)
    app.launch()
  }
}

export function webSearch(text: string) {
  if (text) {
    setShowLauncher(false)
    if (text.startsWith("http")) {
      exec(["xdg-open", text])
    } else {
      exec(["xdg-open", `https://duckduckgo.com/?q=${text}`])
    }
  }
}

export function copyEmoji(emoji: string) {
  if (emoji) {
    setShowLauncher(false)
    execAsync(`wl-copy "${emoji}"`)
  }
}
