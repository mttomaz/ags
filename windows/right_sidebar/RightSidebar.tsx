import { Astal } from "ags/gtk4"
import Gtk from "gi://Gtk?version=4.0"
import Gdk from "gi://Gdk?version=4.0"
import app from "ags/gtk4/app"
import { exec } from "ags/process"
import { uptime } from "@common/vars"
import { Accessor } from "ags"
import { pathToURI } from "@common/functions"
import NotificationList from "./panels/notification"


function sidebarButton(icon: string, name: string, status: string) {
  return (
    <box class="sidebarButton">
      <label class="Icon" label={icon} />
      <box
        class="Description"
        orientation={Gtk.Orientation.VERTICAL}
        valign={Gtk.Align.CENTER}>
        <label halign={Gtk.Align.START} label={name} />
        <label halign={Gtk.Align.START} label={status} />
      </box>
    </box>
  )
}


function UserModule() {
  const userName = exec("whoami")
  const userImg = `${SRC}/assets/profile.png`

  return <box
    class="UserModule">
    <box class="UserImg" css={`background-image: url('${pathToURI(userImg)}')`} />
    <box orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER}>
      <label class="Username" label={userName} halign={Gtk.Align.START} />
      <label class="Uptime" label={uptime} halign={Gtk.Align.START} />
    </box>
  </box>
}

export default function RightSidebar(monitor: Gdk.Monitor, visible: Accessor<boolean>) {
  const { TOP, RIGHT } = Astal.WindowAnchor

  return <window
    class="RightSidebar"
    namespace="rightsidebar"
    gdkmonitor={monitor}
    exclusivity={Astal.Exclusivity.EXCLUSIVE}
    application={app}
    visible={visible}
    layer={Astal.Layer.TOP}
    anchor={TOP | RIGHT}>
    <box
      orientation={Gtk.Orientation.VERTICAL}
      class="sidebar">
      <box>
        <UserModule />
      </box>
      <NotificationList />
    </box>
  </window>
}
