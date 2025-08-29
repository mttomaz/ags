import Gdk from "gi://Gdk?version=4.0"
import Astal from "gi://Astal?version=4.0"
import app from "ags/gtk4/app"
import { Accessor } from "gnim"

export default function Crosshair(monitor: Gdk.Monitor) {
  return <window
    name="Crosshair"
    namespace="crosshair"
    gdkmonitor={monitor}
    layer={Astal.Layer.OVERLAY}
    application={app}
    exclusivity={Astal.Exclusivity.IGNORE}
    keymode={Astal.Keymode.NONE}
    canFocus={false}
  >
    <box class="Dot" />
  </window>
}
