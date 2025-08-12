import { Astal } from "ags/gtk4"
import Gtk from "gi://Gtk?version=4.0"
import Gdk from "gi://Gdk?version=4.0"
import app from "ags/gtk4/app"
import AstalBattery from "gi://AstalBattery"
import AstalBluetooth from "gi://AstalBluetooth"
// import AstalHyprland from "gi://AstalHyprland"
import AstalMpris from "gi://AstalMpris"
// import AstalNetwork from "gi://AstalNetwork"
import AstalTray from "gi://AstalTray"
// import Time from "@widgets/Time/Time"
// import { getWeatherEmoji } from "@common/functions"
import { currentTime, memoryUsage, notificationsLength, setShowLeftSidebar, setShowRightSidebar, showLeftSidebar, showRightSidebar } from "@common/vars"
import { Accessor, createBinding, For, With } from "ags"

function TrayModule() {
  const tray = AstalTray.get_default()
  const items = createBinding(tray, "items")

  const init = (btn: Gtk.MenuButton, item: AstalTray.TrayItem) => {
    btn.menuModel = item.menuModel
    btn.insert_action_group("dbusmenu", item.actionGroup)
    item.connect("notify::action-group", () => {
      btn.insert_action_group("dbusmenu", item.actionGroup)
    })
  }

  return (
    <box>
      <For each={items}>
        {(item) => (
          <menubutton $={(self) => init(self, item)}>
            <image gicon={createBinding(item, "gicon")} />
          </menubutton>
        )}
      </For>
    </box>
  )
}

// function NetworkModule() {
//   const network = Network.get_default()
//   const networkTypes = { "1": "wired", "2": "wifi" }
//
//   return <With value={createBinding(network, "primary")}>
//     {(p: number) => {
//       const dev = network[networkTypes[p]]
//       if (dev) {
//         return <icon
//           class="Network"
//           icon={createBinding(dev, "iconName")} />
//       }
//       return <box />
//     }}
//   </With>
// }

function BluetoothModule() {
  const bluetooth = AstalBluetooth.get_default()

  return <revealer
    transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
    revealChild={createBinding(bluetooth, "is_connected")}>
    <label class="Bluetooth" label="󰂱" />
  </revealer>
}

function BatteryModule() {
  const bat = AstalBattery.get_default()

  return <box class="Battery"
    visible={createBinding(bat, "isPresent")}>
    <label label={createBinding(bat, "percentage").as(p => `${Math.floor(p * 100)}%`)} />
    <image iconName={createBinding(bat, "batteryIconName")} />
  </box>
}

function getTitle(player: AstalMpris.Player): string {
  return player.artist
    ? `${player.artist}: ${player.title}`
    : player.album
      ? `${player.album}: ${player.title}`
      : `${player.title}`
}

function MediaModule() {
  const mpris = AstalMpris.get_default()

  return <With value={createBinding(mpris, "players")}>
    {(ps: Array<AstalMpris.Player>) => ps[0] ? (
      <button class="Media"
        onClicked={() => ps[0].play_pause()}>
        <label
          class={createBinding(ps[0], "playbackStatus").as(s => s > 0 ? "paused" : "playing")}
          maxWidthChars={80}
          label={createBinding(ps[0], "metadata").as(() => getTitle(ps[0]))} />
      </button>
    ) : (<box />)
    }
  </With>
}

// function Workspaces() {
//   const hypr = Hyprland.get_default()
//
//   return <box class="Workspaces">
//     <With value={createBinding(hypr, "workspaces")}>
//       {(wss) => wss
//       .filter(ws => !(ws.id >= -99 && ws.id <= -2)) // filter out special workspaces
//       .sort((a, b) => a.id - b.id)
//       .map(ws => (
//         <button
//           class={createBinding(hypr, "focusedWorkspace").as(fw =>
//             ws === fw ? "focused" : "")}
//           onClicked={() => ws.focus()}>
//           {ws.id}
//         </button>
//       ))
//       }
//     </With>
//   </box>
// }

// function Weather() {
//   const visible = Variable<boolean>(false)
//   return <revealer
//     transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
//     revealChild={visible()}>
//     {bind(weatherReport).as((data) => {
//       if (data) {
//         const condition = data.weather.current_condition[0]
//         const temp = condition.temp_C
//         const emoji = getWeatherEmoji(condition.weatherDesc[0].value)
//         visible.set(true)
//         return <label className="Weather" label={`${temp}°C ${emoji}`} />
//       }
//       return <box />
//     })}
//   </revealer>
// }

// function NotificationBell() {
//   return <revealer
//     transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
//     revealChild={notificationsLength.as(l => l > 1)}>
//     <label class="NotificationBell" label="󱅫" />
//   </revealer>
// }

function Memory() {
  return <With value={memoryUsage}>
    {(memoryUsage) =>
      <label
        class="Memory"
        label={memoryUsage}
      />
    }
  </With>
}

function Time() {
  return <With value={currentTime}>
    {(time) => <label label={time} />}
  </With>
}

export default function Bar(monitor: Gdk.Monitor, visible: Accessor<boolean>) {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

  return (
    <window
      class="Bar"
      namespace="bar"
      gdkmonitor={monitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      application={app}
      visible={visible}
      layer={Astal.Layer.TOP}
      anchor={TOP | LEFT | RIGHT}
    >
      <centerbox>
        <box
          hexpand
          $type="start"
          halign={Gtk.Align.START}
          css="margin-left: 4px">
          <button
            class="TimeAndWeather"
            onClicked={() => setShowLeftSidebar(!showLeftSidebar.get())}
          >
            <box>
              <Time />
              {/* <Weather /> */}
            </box>
          </button>
          {/* <Workspaces /> */}
        </box>
        <box
          hexpand
          halign={Gtk.Align.CENTER}
          $type="center">
          <MediaModule />
        </box>
        <box
          hexpand
          $type="end"
          halign={Gtk.Align.END}
          css="margin-right: 4px">
          <TrayModule />
          <button
            class="TimeAndWeather"
            onClicked={() => setShowRightSidebar(!showRightSidebar.get())}
          >
            <box>
              <BatteryModule />
              {/* <NetworkModule /> */}
              <BluetoothModule />
              {/* <NotificationBell /> */}
              <Memory />
            </box>
          </button>
        </box>
      </centerbox>
    </window>
  )
}
