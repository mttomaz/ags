import Gtk from "gi://Gtk?version=4.0"
import Gdk from "gi://Gdk?version=4.0"
import Graphene from "gi://Graphene?version=1.0"
import { Astal } from "ags/gtk4"
import { Accessor, With, createState } from "gnim"
import AstalApps from "gi://AstalApps?version=0.1"
import Fuse from "fuse.js"
import { setShowLauncher } from "@common/vars"
import emoji from './emoji.json'
import { copyEmoji, launchApp, webSearch } from "./helpers"
import { appList, emojiList, setAppList, setEmojiList } from "./vars"
import { AppMode, EmojiMode, WebSearchMode } from "./modes"


export default function Launcher(monitor: Gdk.Monitor, visible: Accessor<boolean>) {
  let contentbox: Gtk.Box
  let searchentry: Gtk.Entry
  let win: Astal.Window

  const apps = new AstalApps.Apps()
  const emojis = emoji.map(e => ({ emoji: e.char, name: e.name, category: e.category }))
  const emojiFuse = new Fuse(emojis, { keys: ['name', 'category'], threshold: 0.4 })
  const [mode, setMode] = createState("")


  function search(text: string) {
    if (text) {
      if (text.startsWith(":s ")) {
        setMode("websearch")

      } else if (text.startsWith(":e ")) {
        setMode("emoji")
        const query = text.replace(":e ", "")
        if (query) return setEmojiList(emojiFuse.search(query).slice(0, 8).map(r => r.item))
        return setEmojiList([])

      } else {
        setMode("apps")
        setAppList(apps.fuzzy_query(text).slice(0, 8))
      }
    } else {
      setMode("")
      setAppList([])
      setEmojiList([])
    }
  }


  function onActivate(text: string) {
    switch (mode.get()) {
      case "":
        return
      case "apps":
        return launchApp(appList.get()[0])
      case "emoji":
        return copyEmoji(emojiList.get()[0].emoji)
      case "websearch":
        return webSearch(text.replace(":s ", ""))
    }
  }

  // close on ESC
  // handle alt + number key
  function onKey(
    _e: Gtk.EventControllerKey,
    keyval: number,
    _: number,
    mod: number,
  ) {
    if (keyval === Gdk.KEY_Escape) {
      setShowLauncher(false)
      return
    }

    if (mod === Gdk.ModifierType.ALT_MASK) {
      for (const i of [1, 2, 3, 4, 5, 6, 7, 8, 9] as const) {
        if (keyval === Gdk[`KEY_${i}`]) {
          switch (mode.get()) {
            case "apps":
              return launchApp(appList.get()[i - 1])
            case "emoji":
              return copyEmoji(emojiList.get()[i - 1].emoji)
            default:
              return
          }
        }
      }
    }
  }

  // close on clickaway
  function onClick(_e: Gtk.GestureClick, _: number, x: number, y: number) {
    const [, rect] = contentbox.compute_bounds(win)
    const position = new Graphene.Point({ x, y })

    if (!rect.contains_point(position)) {
      setShowLauncher(false)
      return true
    }
  }

  return (
    <window
      $={(ref) => (win = ref)}
      class="Launcher"
      namespace="launcher"
      gdkmonitor={monitor}
      visible={visible}
      exclusivity={Astal.Exclusivity.IGNORE}
      keymode={Astal.Keymode.EXCLUSIVE}
      onNotifyVisible={({ visible }) => {
        if (visible) searchentry.grab_focus()
        else searchentry.set_text("")
        setMode("")
      }}
    >
      <Gtk.EventControllerKey onKeyPressed={onKey} />
      <Gtk.GestureClick onPressed={onClick} />
      <box
        $={(ref) => (contentbox = ref)}
        class="Content"
        valign={Gtk.Align.CENTER}
        halign={Gtk.Align.CENTER}
        orientation={Gtk.Orientation.VERTICAL}
      >
        <entry
          $={(ref) => (searchentry = ref)}
          onNotifyText={({ text }) => search(text)}
          onActivate={({ text }) => onActivate(text)}
          placeholderText="Start typing to search"
        />
        <With value={mode}>
          {(mode) => {
            switch (mode) {
              case "apps":
                return <AppMode />
              case "emoji":
                return <EmojiMode />
              case "websearch":
                return <WebSearchMode />
              default:
                return null
            }
          }}
        </With>
      </box>
    </window>
  )
}
