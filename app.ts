import app from "ags/gtk4/app"
import Bar from "@windows/bar/Bar"
import Gdk from "gi://Gdk?version=4.0"
import requestHandler from "./requestHandler"
import { showBar, showCrosshair, showLeftSidebar, showRightSidebar } from "@common/vars"
import { compileScss } from "@common/cssHotReload"
import NotificationPopups from "@windows/notification_popups/NotificationPopups"
import Crosshair from "@windows/crosshair/Crosshair"
import LeftSidebar from "@windows/left_sidebar/LeftSidebar"
import OSD from "@windows/osd/OSD"
import RightSidebar from "@windows/right_sidebar/RightSidebar"

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
    Bar(targetMonitor, showBar)
    LeftSidebar(targetMonitor, showLeftSidebar)
    RightSidebar(targetMonitor, showRightSidebar)
    OSD(targetMonitor)
    NotificationPopups(targetMonitor)
    Crosshair(targetMonitor, showCrosshair)

    print(`\nAstal Windows applied on monitor: ${targetMonitor.model}`)
  },
})
