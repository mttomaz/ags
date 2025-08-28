import Gtk from "gi://Gtk?version=4.0"
import { execAsync } from "ags/process"
import { createBinding, createComputed, For } from "gnim"
import AstalBluetooth from "gi://AstalBluetooth?version=0.1"


export default function BluetoothPanel() {
  const bluetooth = AstalBluetooth.get_default()
  const devices = createBinding(bluetooth, "devices")
  const connected = createBinding(bluetooth, "isConnected")
  const sortedDevices = createComputed([devices, connected],
    (devs, _) => devs.sort((_, b) => Number(b.paired))
      .sort((_, b) => Number(b.connected))
  )

  const adapter = bluetooth.adapter

  function listItem(device: AstalBluetooth.Device) {
    const devConn = createBinding(device, "connected")
    if (device.name === null) return <box />
    const visibleBinding = createComputed([devConn, createBinding(device, "paired")],
      (conn, paired) => conn || paired)
    const battery = createComputed([devConn, createBinding(device, "batteryPercentage")],
      (c, p) => c && p > 0 ? ` (${Math.floor(p * 100)}%)` : "")

    return <box class="Item">
      <box>
        <image class="icon" pixelSize={25} iconName={device.icon || "help-browser"} />
        <box orientation={Gtk.Orientation.VERTICAL}>
          <box halign={Gtk.Align.START}>
            <label label={device.name} class="Name" />
            <label label={battery} class="Battery" />
          </box>
          <label
            visible={visibleBinding}
            class="Status"
            halign={Gtk.Align.START}
            label={devConn(conn => conn ? "Connected" : "Paired")}
          />
        </box>
      </box>
      <box hexpand />
      <box class="Actions">
        <button
          label=""
          visible={createBinding(device, "paired").as((p) => !p)}
          onClicked={() => device.pair()}
        />
        <button
          label="󱘖"
          onClicked={() => {
            if (device.get_connected()) {
              device.disconnect_device()
            } else {
              device.connect_device()
            }
          }}
        />
      </box>
    </box>
  }

  return <box
    name="bluetooth"
    class="SidebarBluetoothPanel"
    $type="named"
    orientation={Gtk.Orientation.VERTICAL}
    heightRequest={400}
  >
    <box>
      <label label="Bluetooth" class="Title" />
      <box hexpand />
      <button
        class="Discover"
        css={createBinding(adapter, "discovering").as(disc =>
          disc ? "color: #7e9cd8;"
            : "color: #c8c093;"
        )}
        label="󰓦"
        tooltipText={createBinding(adapter, "discovering").as(disc => disc ? "Discovering" : "Discover")}
        onClicked={() => {
          if (adapter.get_discovering()) {
            adapter.stop_discovery()
          } else {
            adapter.start_discovery()
          }
        }}
      >
      </button>
      <switch
        active={createBinding(bluetooth, "isPowered")}
        onActivate={() => execAsync("rfkill toggle bluetooth")}
      />
    </box>
    <scrolledwindow
      vexpand
      class="ItemList"
    >
      <box orientation={Gtk.Orientation.VERTICAL}>
        <For each={sortedDevices}>
          {(dev) => listItem(dev)}
        </For>
      </box>
    </scrolledwindow>
  </box>
}
