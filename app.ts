import Gdk from "gi://Gdk?version=4.0"
import app from "ags/gtk4/app"
import requestHandler from "./requestHandler"
import { compileScss } from "@common/cssHotReload"
import * as vars from "@common/vars"
import Bar from "@windows/bar/Bar"
import LeftSidebar from "@windows/left_sidebar/LeftSidebar"
import RightSidebar from "@windows/right_sidebar/RightSidebar"
import OSD from "@windows/osd/OSD"
import NotificationPopups from "@windows/notification_popups/NotificationPopups"
import Crosshair from "@windows/crosshair/Crosshair"
import Launcher from "@windows/launcher/Launcher"

function getTargetMonitor(monitors: Array<Gdk.Monitor>) {
  const notebookModel = "0x9051"
  const pcModel = "24G2W1G4"

  const notebookMonitor = monitors.find(m => m.model === notebookModel)
  const pcMonitor = monitors.find(m => m.model === pcModel)

  return notebookMonitor || pcMonitor || monitors[0]
}

app.start({
  css: compileScss(),
  requestHandler: requestHandler,
  main() {
    const targetMonitor = getTargetMonitor(app.get_monitors())

    Bar(targetMonitor, vars.showBar)
    Launcher(targetMonitor, vars.showLauncher)
    LeftSidebar(targetMonitor, vars.showLeftSidebar)
    RightSidebar(targetMonitor, vars.showRightSidebar)
    OSD(targetMonitor)
    NotificationPopups(targetMonitor)
    Crosshair(targetMonitor, vars.showCrosshair)

    print(`\nAstal Windows applied on monitor: ${targetMonitor.model}`)
  },
})
