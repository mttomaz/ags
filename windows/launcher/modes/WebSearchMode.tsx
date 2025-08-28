import Gtk from "gi://Gtk?version=4.0"

export function WebSearchMode() {
  return (
    <box
      class="WebSearchMode"
      orientation={Gtk.Orientation.VERTICAL}
      halign={Gtk.Align.CENTER}
    >
      <label class="Icon" label="󰖟" />
      <label class="Description" label='Press "Enter" to search the web.' />
    </box>
  )
}
