import Gtk from "gi://Gtk?version=4.0"
import Gdk from "gi://Gdk?version=4.0"
import { Astal } from "ags/gtk4"
import app from "ags/gtk4/app"
import { Accessor, createBinding, createState, For, With } from "ags"
import { exec } from "ags/process"
import AstalNetwork from "gi://AstalNetwork?version=0.1"
import AstalBluetooth from "gi://AstalBluetooth?version=0.1"
import AstalMpris from "gi://AstalMpris?version=0.1"
import NotificationPanel from "./panels/notification"
import { uptime } from "@common/vars"
import { pathToURI } from "@common/functions"
import MediaPlayer from "@widgets/MediaPlayer/MediaPlayer"
import WifiPanel from "./panels/wifi"
import BluetoothPanel from "./panels/bluetooth"


function sidebarButton(icon: string | Accessor<string>, name: string | Accessor<string>, status: string | Accessor<string>) {
  return (
    <box class="sidebarButton">
      <image iconSize={Gtk.IconSize.LARGE} iconName={icon} />
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

function SidebarPlayers() {
  const mpris = AstalMpris.get_default()
  const players = createBinding(mpris, "players")

  return (
    <box orientation={Gtk.Orientation.VERTICAL}>
      <For each={players}>
        {(ps) => MediaPlayer(ps)}
      </For>
    </box>
  )
}


function WifiModule() {
  const network = AstalNetwork.get_default()
  const wifi = createBinding(network, "wifi")
  const wifiEnabled = createBinding(network.wifi, "enabled")

  return (
    <box class="Wifi" halign={Gtk.Align.CENTER}>
      <With value={wifi}>
        {(wifi) => {
          const icon = createBinding(wifi, "iconName")
          const name = createBinding(wifi, "ssid").as((ssid) => ssid || "Wifi")
          const status = wifiEnabled.as((enabled) => enabled ? "on" : "off")
          return (
            <button
              class={wifiEnabled.as((enabled) => enabled ? "enabled" : "disabled")}
              onClicked={() => setCurrentPanel("wifi")}
            >
              {sidebarButton(icon, name, status)}
            </button>
          )
        }}
      </With>
    </box>
  )
}

function BluetoothModule() {
  const bluetooth = AstalBluetooth.get_default()
  const connected = createBinding(bluetooth, "isConnected")
  const powered = createBinding(bluetooth, "isPowered")

  function getConnectedDevice(enabled: Accessor<Boolean>) {
    for (const device of bluetooth.get_devices()) {
      if (device.connected) {
        const icon = device.icon
        const name = device.name
        const status = createBinding(device, "batteryPercentage").as(p =>
          p > 0 ? `${Math.floor(p * 100)}%` : enabled((enabled) => enabled ? "on" : "off"))
        return { icon, name, status }
      }
    }
    const icon = "bluetooth-active-symbolic"
    const name = "Bluetooth"
    const status = enabled((enabled) => enabled ? "on" : "off")
    return { icon, name, status }
  }

  return <box class="Bluetooth" halign={Gtk.Align.CENTER}>
    <button
      class={powered((p) => p ? "enabled" : "disabled")}
      onClicked={() => setCurrentPanel("bluetooth")}
    >
      <With value={connected}>
        {() => {
          const { icon, name, status } = getConnectedDevice(powered)
          return sidebarButton(icon, name, status.as((s) => s.toString()))
        }}
      </With>
    </button>
  </box>
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

const [currentPanel,setCurrentPanel] = createState("notification")

function PanelStack() {

  return (
    <box class="PanelStack">
      <stack
        $={(self) => self.visibleChildName = currentPanel.get()}
        transitionDuration={350}
        visibleChildName={currentPanel}
        transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
      >
        <NotificationPanel />
        <WifiPanel />
        <BluetoothPanel />
      </stack>
    </box>
  )
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
    $={(self) => self.connect("hide", () => setCurrentPanel("notification"))}
    layer={Astal.Layer.TOP}
    anchor={TOP | RIGHT}>
    <box
      orientation={Gtk.Orientation.VERTICAL}
      class="sidebar">
      <box>
        <UserModule />
      </box>
      <box homogeneous>
        <box orientation={Gtk.Orientation.VERTICAL}>
          <WifiModule />
        </box>
        <box orientation={Gtk.Orientation.VERTICAL} css="margin-left: 4px">
          <BluetoothModule />
        </box>
      </box>
      <SidebarPlayers />
      <PanelStack />
    </box>
  </window>
}
