import Gtk from "gi://Gtk?version=4.0"
import Pango from "gi://Pango?version=1.0"
import { For } from "gnim"
import { emojiList } from "../vars"
import { copyEmoji } from "../helpers"


export function EmojiMode() {
  return (
    <box
      class="EmojiMode"
      orientation={Gtk.Orientation.VERTICAL}
      halign={Gtk.Align.CENTER}
    >
      <For each={emojiList}>
        {(item, index) => (
          <button
            class="Emoji"
            onClicked={() => copyEmoji(item.emoji)}
          >
            <box>
              <label class="Icon" label={item.emoji} />
              <label label={item.name} maxWidthChars={30} ellipsize={Pango.EllipsizeMode.END} />
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
