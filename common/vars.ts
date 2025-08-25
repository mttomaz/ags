import GLib from "gi://GLib?version=2.0"
import { execAsync } from "ags/process"
import { createPoll } from "ags/time"
import { createState } from "gnim"

export const [showBar, setShowBar] = createState(true)
export const [showCrosshair, setShowCrosshair] = createState(false)
export const [showLauncher, setShowLauncher] = createState(false)
export const [showLeftSidebar, setShowLeftSidebar] = createState(false)
export const [showRightSidebar, setShowRightSidebar] = createState(false)
export const [notificationsLength, setNotificationsLength] = createState(0)
export const [doNotDisturb, setDoNotDisturb] = createState(false)

const night = await execAsync('pgrep -x hyprsunset')
  .then(() => true).catch(() => false)
export const [nightLightEnabled, setNightLightEnabled] = createState(night)


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

export const memoryUsage = createPoll("", 5 * 1000, async () =>
  await execAsync(["sh", "-c", `free --mega | awk 'NR==2{print $3 " MB"}'`])
)

type WeatherData = {
  timestamp: string
  weather: any
};

var startReport: WeatherData = {
  timestamp: "",
  weather: null
}

export const weatherReport = createPoll(startReport, 20 * 60 * 1000, async () => {
  try {
    const result = await execAsync(`curl -s "wttr.in/Curitiba?format=j1"`)
    const weather = JSON.parse(result)
    const timestamp = currentTime.get()
    return { timestamp, weather }
  } catch (err) {
    console.error("Error fetching weather:", err)
    return null
  }
})
