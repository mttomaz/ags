import Gtk from "gi://Gtk?version=4.0"
import { For } from "gnim"
import { appList } from "../vars"
import { launchApp } from "../helpers"


export function AppMode() {
  return (
    <box orientation={Gtk.Orientation.VERTICAL}>
      <For each={appList}>
        {(app, index) => (
          <button class="App" onClicked={() => launchApp(app)}>
            <box>
              <image class="Icon" iconName={app.iconName} pixelSize={24} />
              <label class="Name" label={app.name} maxWidthChars={40} wrap />
              <label
                hexpand
                halign={Gtk.Align.END}
                label={index((i) => `alt + ${i + 1}`)}
              />
            </box>
          </button>
        )}
      </For>
    </box>
  )
}
