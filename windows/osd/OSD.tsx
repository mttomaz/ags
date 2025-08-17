import { timeout } from "ags/time"
import AstalWp from "gi://AstalWp"
import Brightness from "@utils/Brightness"
import { spotifyPlayer } from "@common/vars"
import { Astal } from "ags/gtk4"
import Gtk from "gi://Gtk?version=4.0"
import Gdk from "gi://Gdk?version=4.0"
import app from "ags/gtk4/app"
import { Accessor, createState, onCleanup } from "ags"
import GObject from "gi://GObject?version=2.0"

function hook<O extends GObject.Object, S extends keyof O["$signals"]>(
  object: O,
  signal: S,
  callback: O["$signals"][S],
) {
  const cb = callback as (...args: unknown[]) => unknown
  const id = object.connect(signal as string, (_, ...args: unknown[]) => cb(...args))
  onCleanup(() => object.disconnect(id))
}

export default function OSD(monitor: Gdk.Monitor) {
  const brightness = Brightness.get_default()
  const speaker = AstalWp.get_default()!.get_default_speaker()

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
          hook(brightness, "notify::screen", () =>
            show(brightness.screen, "display-brightness-symbolic"),
          )

          if (speaker) {
            hook(speaker, "notify::volume", () =>
              show(speaker.volume, speaker.volumeIcon),
            )
          }

          hook(spotifyPlayer, "notify::volume", () =>
            show(spotifyPlayer.volume, "spotify")
          )
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
