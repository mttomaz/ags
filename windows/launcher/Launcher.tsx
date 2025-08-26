import Gtk from "gi://Gtk?version=4.0"
import Gdk from "gi://Gdk?version=4.0"
import Graphene from "gi://Graphene?version=1.0"
import { Astal } from "ags/gtk4"
import { Accessor, For, With, createState } from "gnim"
import AstalApps from "gi://AstalApps?version=0.1"
import { setShowLauncher } from "@common/vars"
import { exec } from "ags/process"
import Fuse from "fuse.js"
import { pathToURI } from "@common/functions"
import Pango from "gi://Pango?version=1.0"


export default function Launcher(monitor: Gdk.Monitor, visible: Accessor<boolean>) {
  let contentbox: Gtk.Box
  let searchentry: Gtk.Entry
  let win: Astal.Window

  const apps = new AstalApps.Apps()
  const [appList, setAppList] = createState(new Array<AstalApps.Application>())
  const wallpaperList = JSON.parse(exec(`${SRC}/windows/launcher/scripts/wallpapers.sh`) || "{}")
  const [selectedWallpapers, setSelectedWallpapers] = createState(new Array)
  const [mode, setMode] = createState("")

  function search(text: string) {
    if (text) {
      if (text.startsWith(":s ")) {
        setMode("websearch")

      } else if (text.startsWith(":w ")) {
        setMode("wallpaper")
        const query = text.replace(":w ", "")
        if (query) {
          const fuse = new Fuse(wallpaperList, { keys: ["name"], threshold: 0.3 })
          const results = fuse.search(query).slice(0, 4).map(r => r.item)
          setSelectedWallpapers(results)
        } else {
          setSelectedWallpapers(wallpaperList.slice()
            .sort(() => Math.random() - 0.5).slice(0, 4))
        }
      } else {
        setMode("apps")
        setAppList(apps.fuzzy_query(text).slice(0, 8))
      }
    } else {
      setAppList([])
      setSelectedWallpapers([])
    }
  }

  function launchApp(app?: AstalApps.Application) {
    if (app) {
      setShowLauncher(false)
      app.launch()
    }
  }

  function webSearch(text: string) {
    if (text) {
      setShowLauncher(false)
      if (text.startsWith("http")) {
        exec(["xdg-open", text])
      } else {
        exec(["xdg-open", `https://duckduckgo.com/?q=${text}`])
      }
    }
  }

  function setWallpaper(path: string) {
    if (path) {
      setShowLauncher(false)
      exec([`${SRC}/windows/launcher/scripts/set-wallpaper.sh`, path])
    }
  }

  function AppMode() {
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

  function WebSearchMode() {
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

  function WallpaperMode() {
    return (
      <box
        class="WallpaperMode"
        orientation={Gtk.Orientation.VERTICAL}
        halign={Gtk.Align.CENTER}
      >
        <For each={selectedWallpapers}>
          {(wall, index) => (
            <button
              class="Wallpaper"
              onClicked={() => setWallpaper(wall.path)}
            >
              <box>
                <box
                  class="Image"
                  css={`background-image: url('${pathToURI(wall.path)}')`}
                />
                <label label={wall.name} maxWidthChars={40} ellipsize={Pango.EllipsizeMode.END} />
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

  function onActivate(text: string) {
    const cMode = mode.get()
    if (text === "") return
    if (cMode === "apps") {
      return launchApp(appList.get()[0])
    } else if (cMode === "websearch") {
      return webSearch(text.replace(":s ", ""))
    } else if (cMode === "wallpaper") {
      return setWallpaper(selectedWallpapers.get()[0].path)
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
            case "wallpaper":
              return setWallpaper(selectedWallpapers.get()[i - 1].path)
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
              case "websearch":
                return <WebSearchMode />
              case "wallpaper":
                return <WallpaperMode />
              default:
                return null
            }
          }}
        </With>
      </box>
    </window>
  )
}
