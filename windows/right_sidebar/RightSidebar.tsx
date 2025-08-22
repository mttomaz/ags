import Gtk from "gi://Gtk?version=4.0"
import Gdk from "gi://Gdk?version=4.0"
import { Astal } from "ags/gtk4"
import app from "ags/gtk4/app"
import { Accessor, createBinding, createComputed, createState, For, With } from "ags"
import { exec, execAsync } from "ags/process"
import AstalNetwork from "gi://AstalNetwork?version=0.1"
import AstalBluetooth from "gi://AstalBluetooth?version=0.1"
import AstalMpris from "gi://AstalMpris?version=0.1"
import { doNotDisturb, nightLightEnabled, setDoNotDisturb, setNightLightEnabled, uptime } from "@common/vars"
import { pathToURI } from "@common/functions"
import MediaPlayer from "@widgets/MediaPlayer/MediaPlayer"
import NotificationPanel from "./panels/notification"
import WifiPanel from "./panels/wifi"
import BluetoothPanel from "./panels/bluetooth"


function sidebarButton(icon: string | Accessor<string>,
  name: string | Accessor<string>,
  status: string | Accessor<string>,
  useLabel: Boolean
) {
  const iconWidget = useLabel
    ? (<label class="Icon" label={icon} />)
    : (<image class="Icon" pixelSize={28} iconName={icon} />)

  return (
    <box class="sidebarButton">
      {iconWidget}
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
  const [current, setCurrent] = createState(0)

  return (
    <box>
      <With value={players}>
        {(ps) => {
          setCurrent(0)
          return ps.length > 0 ? (
            <box>
              <Gtk.EventControllerScroll
                flags={Gtk.EventControllerScrollFlags.VERTICAL}
                $={(self) => {
                  self.connect("scroll", (_, __, dy) => {
                    const c = current.get()
                    const max = ps.length - 1
                    if (dy > 0) {
                      if (c < max) setCurrent(c + 1)
                    } else {
                      if (c > 0) setCurrent(c - 1)
                    }
                  })
                }}
              />
              <stack
                $={(self) => (
                  <With value={current}>
                    {(c) => {
                      if (c) {
                        self.visibleChildName = ps[c].entry
                      } else {
                        self.visibleChildName = ps[0].entry
                      }
                      return null
                    }}
                  </With>
                )}
                transitionType={Gtk.StackTransitionType.SLIDE_LEFT_RIGHT}
              >
                <For each={players}>
                  {(ps) => {
                    return MediaPlayer(ps)
                  }
                  }
                </For>
              </stack>
            </box>
          ) : (null)
        }}
      </With>
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
          const name = createComputed([wifiEnabled, createBinding(wifi, "ssid")],
            (enabled, ssid) => enabled ? ssid || "Wifi" : "Wifi"
          )
          const status = wifiEnabled.as((enabled) => enabled ? "on" : "off")
          return (
            <button
              class={wifiEnabled.as((enabled) => enabled ? "enabled" : "disabled")}
              onClicked={() => setCurrentPanel("wifi")}
            >
              {sidebarButton(icon, name, status, false)}
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
        const battery = createBinding(device, "batteryPercentage")
        const status = createComputed([enabled, battery], (e, p) =>
          e ? p > 0 ? `${Math.floor(p * 100)}%` : "on" : "off" )
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
          return sidebarButton(icon, name, status, false)
        }}
      </With>
    </button>
  </box>
}

function DoNotDisturbModule() {
  const icon = "󰍶"
  const name = "Do Not Disturb"

  return (
    <box>
      <With value={doNotDisturb}>
        {(dnd) => {
          const status = dnd ? "on" : "off"
          return (
            <box
              class="doNotDisturb"
              halign={Gtk.Align.CENTER}>
              <button
                class={dnd ? "enabled" : "disabled"}
                onClicked={() => setDoNotDisturb(!dnd)}>
                {sidebarButton(icon, name, status, true)}
              </button>
            </box>
          )
        }}
      </With>
    </box>
  )
}

function toggleNightLight() {
  if (nightLightEnabled.get()) {
    execAsync("pkill -x hyprsunset")
    setNightLightEnabled(false)
  } else {
    execAsync("hyprsunset -t 5000")
    setNightLightEnabled(true)
  }
}

function NightLightModule() {
  const name = "Night Light"
  return <box>
    <With value={nightLightEnabled}>
      {(enabled) => {
        const icon = enabled ? "󱩌" : "󰌶"
        const status = enabled ? "on" : "off"
        return (
          <box
            class="nightLight"
            halign={Gtk.Align.CENTER}>
            <button
              class={enabled ? "enabled" : "disabled"}
              onClicked={toggleNightLight}>
              {sidebarButton(icon, name, status, true)}
            </button>
          </box>
        )
      }}
    </With>
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

const [currentPanel, setCurrentPanel] = createState("notification")

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
    onHide={() => setCurrentPanel("notification")}
    layer={Astal.Layer.TOP}
    anchor={TOP | RIGHT}>
    <box
      orientation={Gtk.Orientation.VERTICAL}
      class="sidebar">
      <box>
        <UserModule />
      </box>
      <box orientation={Gtk.Orientation.VERTICAL}>
        <box>
          <WifiModule />
          <box widthRequest={8} hexpand />
          <BluetoothModule />
        </box>
        <box>
          <DoNotDisturbModule />
          <box widthRequest={8} hexpand />
          <NightLightModule />
        </box>
      </box>
      <SidebarPlayers />
      <PanelStack />
    </box>
  </window>
}
