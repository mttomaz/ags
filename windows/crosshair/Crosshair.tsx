import Gdk from "gi://Gdk?version=4.0"
import { Astal } from "ags/gtk4"
import app from "ags/gtk4/app"
import { Accessor } from "gnim"

export default function Crosshair(monitor: Gdk.Monitor, visible: Accessor<boolean>) {
  return <window
    class="Crosshair"
    namespace="crosshair"
    gdkmonitor={monitor}
    visible={visible}
    layer={Astal.Layer.OVERLAY}
    application={app}
    exclusivity={Astal.Exclusivity.IGNORE}
    keymode={Astal.Keymode.NONE}
    canFocus={false}
  >
    <box class="Dot" />
  </window>
}
