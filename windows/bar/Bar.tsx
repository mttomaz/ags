import Gtk from "gi://Gtk?version=4.0"
import Gdk from "gi://Gdk?version=4.0"
import { Astal } from "ags/gtk4"
import app from "ags/gtk4/app"
import { Accessor, createBinding, createState, For, With } from "ags"
import AstalBattery from "gi://AstalBattery?version=0.1"
import AstalBluetooth from "gi://AstalBluetooth?version=0.1"
import AstalHyprland from "gi://AstalHyprland?version=0.1"
import AstalMpris from "gi://AstalMpris?version=0.1"
import AstalNetwork from "gi://AstalNetwork?version=0.1"
import AstalTray from "gi://AstalTray?version=0.1"
import Time from "@widgets/Time/Time"
import { getWeatherEmoji } from "@common/functions"
import { weatherReport, notificationsLength, memoryUsage, setShowLeftSidebar, showLeftSidebar, setShowRightSidebar, showRightSidebar } from "@common/vars"

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
    <box class="Tray">
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

function NetworkModule() {
  const network = AstalNetwork.get_default()
  const primary = createBinding(network, "primary")

  return (
    <box
      class="Network"
      visible={primary((p) => p !== AstalNetwork.Primary.UNKNOWN)}
    >
      <With value={primary}>
        {(primary) =>
          primary === AstalNetwork.Primary.WIFI ? (
            <image
              class="Icon"
              tooltipText={createBinding(network.wifi, "ssid")}
              iconName={createBinding(network.wifi, "iconName")}
            />
          ) : (
            primary === AstalNetwork.Primary.WIRED && (
              <image
                class="Icon"
                iconName={createBinding(network.wired, "iconName")}
              />
            )
          )
        }
      </With>
    </box>
  )
}

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

function Workspaces() {
  const hypr = AstalHyprland.get_default()
  const workspaces = createBinding(hypr, "workspaces")

  const sorted = (arr: Array<AstalHyprland.Workspace>) => {
    return arr.filter(ws => !(ws.id >= -99 && ws.id <= -2)).sort((a, b) => a.id - b.id)
  }

  return <box class="Workspaces">
    <For each={workspaces(sorted)}>
      {(ws: AstalHyprland.Workspace) => (
        <button
          class={createBinding(hypr, "focusedWorkspace").as(fw => ws === fw ? "focused" : "")}
          onClicked={() => ws.focus()}
        >
          {ws.id}
        </button>
      )}
    </For>
  </box>
}

function Weather() {
  const [visible, setVisible] = createState(true)
  return (
    <revealer
      transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
      revealChild={visible}
    >
      <With value={weatherReport}>
        {(value) => {
          if (value?.weather) {
            const condition = value.weather.current_condition[0]
            const temp = condition.temp_C
            const emoji = getWeatherEmoji(condition.weatherDesc[0].value)
            setVisible(true)
            return <label class="Weather" label={`${temp}°C ${emoji}`} />
          }
          return <box />
        }}
      </With>
    </revealer>
  )
}

function NotificationBell() {
  return <revealer
    transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
    revealChild={notificationsLength.as((l) => l > 1)}>
    <label class="NotificationBell" label="󱅫" />
  </revealer>
}

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
              <Weather />
            </box>
          </button>
          <Workspaces />
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
              <NetworkModule />
              <BluetoothModule />
              <NotificationBell />
              <Memory />
            </box>
          </button>
        </box>
      </centerbox>
    </window>
  )
}
