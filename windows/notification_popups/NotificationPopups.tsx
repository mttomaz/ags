import app from "ags/gtk4/app"
import { Astal, Gtk } from "ags/gtk4"
import AstalNotifd from "gi://AstalNotifd"
import Notification from "@widgets/Notification/Notification"
import { For, createState, onCleanup } from "ags"
import Gdk from "gi://Gdk?version=4.0"
import { setNotificationsLength } from "@common/vars"

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

  return (
    <window
      $={(self) => onCleanup(() => self.destroy())}
      class="NotificationPopups"
      gdkmonitor={monitor}
      application={app}
      visible={notifications((ns) => {
        setNotificationsLength(ns.length)
        return ns.length > 0
      })}
      anchor={Astal.WindowAnchor.TOP | Astal.WindowAnchor.RIGHT}
    >
      <box orientation={Gtk.Orientation.VERTICAL}>
        <For each={notifications}>
          {(notification) => <Notification notification={notification} />}
        </For>
      </box>
    </window>
  )
}
