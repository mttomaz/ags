import Gtk from "gi://Gtk?version=4.0"
import Gdk from "gi://Gdk?version=4.0"
import { Astal } from "ags/gtk4"
import app from "ags/gtk4/app"
import { timeout } from "ags/time"
import { Accessor, createState } from "gnim"
import AstalWp from "gi://AstalWp?version=0.1"
import Brightness from "@utils/Brightness"


export default function OSD(monitor: Gdk.Monitor) {
  const brightness = Brightness.get_default()
  const wp = AstalWp.get_default()!
  const speaker = wp.get_default_speaker()

  const [visible, setVisible] = createState(false)
  const [icon, setIcon] = createState("")
  const [value, setValue] = createState(0)

  let count = 0
  function show(v: number, icon: string) {
    setVisible(true)
    setValue(v)
    setIcon(icon)
    count++
    timeout(2000, () => {
      count--
      if (count === 0) setVisible(false)
    })
  }

  return (
    <window
      gdkmonitor={monitor}
      class="OSD"
      namespace="osd"
      visible={visible}
      application={app}
      layer={Astal.Layer.OVERLAY}
      anchor={Astal.WindowAnchor.RIGHT}
    >
      <box
        $={() => {
          if (brightness) {
            brightness.connect("notify::screen", () =>
              show(brightness.screen, "display-brightness-symbolic"),
            )
          }

          if (speaker) {
            speaker.connect("notify::volume", () =>
              show(speaker.volume, speaker.volumeIcon),
            )
          }

          wp.connect("node-added", () => {
            wp.get_nodes()?.forEach((node) => {
              if (node.name === "Spotify") {
                node.connect("notify::volume", () =>
                  show(node.volume, "spotify")
                )
              }
            })
          })

        }}>
        <box orientation={Gtk.Orientation.VERTICAL} class="OSD">
          <image iconName={icon} />
          <levelbar
            valign={Gtk.Align.CENTER}
            heightRequest={100}
            widthRequest={8}
            orientation={Gtk.Orientation.VERTICAL}
            inverted
            value={value}
          />
          <label label={value(v => `${Math.floor(v * 100)}%`)} />
        </box>
      </box>
    </window>
  )
}
