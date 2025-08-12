import GLib from "gi://GLib"
import { execAsync } from "ags/process"
import Mpris from "gi://AstalMpris"
import { createState } from "ags"
import { createPoll } from "ags/time"

export const [ showBar, setShowBar ] = createState(true)
export const [ showLeftSidebar, setShowLeftSidebar ] = createState(false)
export const [ showRightSidebar, setShowRightSidebar ] = createState(false)
export const [ showCrosshair, setShowCrosshair ] = createState(false)
export const [ showLauncher, setShowLauncher ] = createState(false)
export const [ doNotDisturb, setDoNotDisturb ] = createState(false)
export const [ nightLightEnabled, setNightLightEnabled ] = createState(false)
export const [ notificationsLength, setNotificationsLength ] = createState(0)
export const [ sidebarPanel, setSidebarPanel ] = createState("main")
export const spotifyPlayer = Mpris.Player.new("spotify")

execAsync('pgrep -x hyprsunset')
  .then(() => setNightLightEnabled(true))
  .catch(() => setNightLightEnabled(false))

export const currentTime = createPoll("", 1000, () =>
  GLib.DateTime.new_now_local().format("%H:%M")!)

export const currentDay = createPoll("", 1000, () =>
  GLib.DateTime.new_now_local().format("^%A, %d de ^%B")!)

export const uptime = createPoll("", 5 * 60 * 1000, async () => {
  const output = await execAsync("uptime -p")
  return output
    .replace(/ minutes| minute/, "m")
    .replace(/ hours| hour/, "h")
    .replace(/ days| day/, "d")
    .replace(/ weeks| week/, "w")
})

export const memoryUsage = createPoll("", 5 * 1000, async () => {
  const output = await execAsync(["sh", "-c", `free --mega | awk 'NR==2{print $3 " MB"}'`])
  return output
})

// type WeatherData = {
//   timestamp: string
//   weather: any
// };
//
// export const weatherReport = createPoll({}, 20 * 60 * 1000, async () => {
//   try {
//     const result = await execAsync(`curl -s "wttr.in/Curitiba?format=j1"`)
//     const weather = JSON.parse(result)
//     const timestamp = currentTime.get()
//     return { timestamp, weather }
//   } catch (err) {
//     console.error("Error fetching weather:", err)
//     return null
//   }
// })
