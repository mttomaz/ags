import Gdk from "gi://Gdk?version=4.0"
import Gtk from "gi://Gtk?version=4.0"
import { Astal } from "ags/gtk4"
import app from "ags/gtk4/app"
import { For, createComputed, createState, onCleanup } from "ags"
import AstalNotifd from "gi://AstalNotifd?version=0.1"
import Notification from "@widgets/Notification/Notification"
import { doNotDisturb } from "@common/vars"

export const [notifications, setNotifications] = createState(
  new Array<AstalNotifd.Notification>(),
)

export default function NotificationPopups(monitor: Gdk.Monitor) {

  const notifd = AstalNotifd.get_default()

  const notifiedHandler = notifd.connect("notified", (_, id, replaced) => {
    const notification = notifd.get_notification(id)

    if (replaced && notifications.get().some((n) => n.id === id)) {
      setNotifications((ns) => ns.map((n) => (n.id === id ? notification : n)))
    } else {
      setNotifications((ns) => [notification, ...ns])
    }
  })

  const resolvedHandler = notifd.connect("resolved", (_, id) => {
    setNotifications((ns) => ns.filter((n) => n.id !== id))
  })

  onCleanup(() => {
    notifd.disconnect(notifiedHandler)
    notifd.disconnect(resolvedHandler)
  })

  const visible = createComputed([notifications, doNotDisturb], (ns, dnd) => ns.length > 0 && !dnd)

  return (
    <window
      $={(self) => onCleanup(() => self.destroy())}
      class="NotificationPopups"
      gdkmonitor={monitor}
      application={app}
      layer={Astal.Layer.OVERLAY}
      visible={visible}
      anchor={Astal.WindowAnchor.BOTTOM | Astal.WindowAnchor.RIGHT}
    >
      <box orientation={Gtk.Orientation.VERTICAL}>
        <For each={notifications}>
          {(notification) => <Notification notification={notification} />}
        </For>
      </box>
    </window>
  )
}
