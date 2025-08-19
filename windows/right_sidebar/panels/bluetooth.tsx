import Gtk from "gi://Gtk?version=4.0";
import { createBinding, For } from "ags";
import { execAsync } from "ags/process";
import AstalBluetooth from "gi://AstalBluetooth?version=0.1";


export default function BluetoothPanel() {
  const bluetooth = AstalBluetooth.get_default()
  const bluetoothDevices = createBinding(bluetooth, "devices")
  const adapter = bluetooth.adapter

  function listItem(device: AstalBluetooth.Device) {
    const devConn = createBinding(device, "connected")
    if (device.name === null) return <box/>
    const visibleBinding = devConn(Boolean) || createBinding(device, "paired")(Boolean)
    const battery = createBinding(device, "batteryPercentage").as(p =>
      p > 0 ? ` (${Math.floor(p * 100)}%)` : "")
    return <box class="Item">
      <box>
        <image pixelSize={24} iconName={device.icon || "help-browser"} />
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
          label="󱘖"
          onClicked={() => {
            if (device.get_connected()) {
              device.disconnect_device((res) => console.log(res))
            } else {
              device.connect_device((res) => console.log(res))
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
        onNotifyActive={() => execAsync("rfkill toggle bluetooth")}
      />
    </box>
    <scrolledwindow
      vexpand
      class="ItemList"
    >
      <box orientation={Gtk.Orientation.VERTICAL}>
        <For each={bluetoothDevices}>
          {(dev) => listItem(dev)}
        </For>
      </box>
    </scrolledwindow>
  </box>
}
