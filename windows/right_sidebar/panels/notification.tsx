import Gtk from "gi://Gtk?version=4.0"
import AstalNotifd from "gi://AstalNotifd?version=0.1"
import { createBinding, With } from "ags"
import Notification from "@widgets/Notification/Notification"
import { setNotificationsLength } from "@common/vars"


export default function NotificationPanel() {
  const notifd = AstalNotifd.get_default()

  return <box class="NotificationPanel" $type="named" name="notification">
    <With value={createBinding(notifd, "notifications")}>
      {(notifs: Array<AstalNotifd.Notification>) => {
        const nLength = notifs.length
        setNotificationsLength(nLength)
        return <box orientation={Gtk.Orientation.VERTICAL}
          heightRequest={400}
          widthRequest={300}
        >
          <box>
            <label class="Title" label="Notifications" />
            <button
              class="dismissAll"
              halign={Gtk.Align.END}
              hexpand
              label="Clear All"
              onClicked={() => notifs.forEach(n => n.dismiss())}
            />
          </box>
          {nLength > 0 ? (
            <scrolledwindow vexpand>
              <box orientation={Gtk.Orientation.VERTICAL}>
                {notifs.reverse().map(n => {
                  return Notification({
                    notification: n,
                  })
                })}
              </box>
            </scrolledwindow>
          ) : (
            <box
              class="noNotifications"
              vexpand
              hexpand
              orientation={Gtk.Orientation.VERTICAL}
              valign={Gtk.Align.CENTER}
            >
              <label label="󱏬" class="Icon" />
              <label label="no notifications :(" />
            </box>
          )}
        </box>
      }}
    </With>
  </box>
}
