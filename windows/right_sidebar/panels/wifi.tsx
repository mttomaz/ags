import Gtk from "gi://Gtk?version=4.0"
import { execAsync } from "ags/process"
import { createBinding, createComputed, For } from "gnim"
import AstalNetwork from "gi://AstalNetwork?version=0.1"


export default function WifiPanel() {
  const network = AstalNetwork.get_default()
  const wifi = network.wifi
  const aap = createBinding(wifi, "activeAccessPoint")
  const aps = createComputed([createBinding(wifi, "accessPoints"), aap], (aps, aap) =>
    aps.sort((a, b) => b.strength - a.strength)
      .sort((_, b) => Number(aap === b)))

  function itemList(ap: AstalNetwork.AccessPoint) {
    if (ap.ssid === null) return <box />
    return <box class="Item">
      <image class="icon" pixelSize={25} iconName={createBinding(ap, "iconName")} />
      <box orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER}>
        <label label={ap.ssid} class="ssid" halign={Gtk.Align.START} />
        <label
          visible={aap((aap) => aap === ap)}
          halign={Gtk.Align.START}
          label="Connected"
          class="status" />
      </box>
      <box hexpand />
      <button
        label="󱘖"
        onClicked={() => execAsync(`nmcli device wifi connect ${ap.ssid}`)}
      />
    </box>
  }

  return <box
    name="wifi"
    orientation={Gtk.Orientation.VERTICAL}
    class="SidebarWifiPanel"
    $type="named"
    height_request={400}
  >
    <box>
      <label label="Wifi" class="Title" />
      <box hexpand />
      <switch
        active={createBinding(wifi, "enabled")}
        onNotifyActive={(self) => wifi.set_enabled(self.active)}
      />
    </box>
    <scrolledwindow
      vexpand
      class="ItemList"
    >
      <box orientation={Gtk.Orientation.VERTICAL}>
        <For each={aps}>
          {(ap) => itemList(ap)}
        </For>
      </box>
    </scrolledwindow>
  </box>
}
