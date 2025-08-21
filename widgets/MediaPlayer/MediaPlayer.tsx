import { pathToURI } from "@common/functions"
import AstalMpris from "gi://AstalMpris?version=0.1"
import Gtk from "gi://Gtk?version=4.0"
import Pango from "gi://Pango?version=1.0"
import { Accessor, createBinding, createState } from "gnim"

function lengthStr(length: number) {
  const min = Math.floor(length / 60)
  const sec = Math.floor(length % 60)
  const sec0 = sec < 10 ? "0" : ""
  return `${min}:${sec0}${sec}`
}

export default function MediaPlayer(player: AstalMpris.Player) {
  const [showPosition, setShowPosition] = createState(false)
  const [stop, setStop] = createState(false)

  const defaultCover = `${SRC}/assets/speaker.jpg`
  const coverArt = createBinding(player, "coverArt").as(c =>
    `background-image: url('${pathToURI(c || defaultCover)}')`)

  const playIcon = createBinding(player, "playbackStatus").as(s =>
    s === 0 ? "󰏤" : "󰐊")

  const position = createBinding(player, "position").as(p => player.length > 0
    ? p / player.length : 0)

  const metadata = createBinding(player, "metadata")

  function ArtistTitle() {
    return <box orientation={Gtk.Orientation.VERTICAL} hexpand>
      <label
        class="Title"
        ellipsize={Pango.EllipsizeMode.END}
        maxWidthChars={28}
        halign={Gtk.Align.START}
        valign={Gtk.Align.START}
        tooltipText={metadata(() => `${player.title}`)}
        label={metadata(() => `${player.title}`)} />
      <label
        class="Artist"
        vexpand
        halign={Gtk.Align.START}
        valign={Gtk.Align.START}
        label={metadata(() => {
          if (player.artist) return `${player.artist}`
          if (player.album) return `${player.album}`
          return ""
        })} />
    </box>
  }

  function Position() {
    return <revealer
      revealChild={showPosition}
      transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}>
      <box orientation={Gtk.Orientation.VERTICAL} class="position">
        <box>
          <label
            halign={Gtk.Align.START}
            visible={createBinding(player, "length").as(l => l > 0)}
            label={createBinding(player, "position").as(lengthStr)}
          />
          <label
            hexpand
            halign={Gtk.Align.START}
            visible={createBinding(player, "length").as(l => l > 0)}
            label={createBinding(player, "length").as(l => l > 0 ? ` - ${lengthStr(l)}` : " - 0:00")}
          />
          <button
            class="Timer"
            onClicked={() => setStop(!stop.get())}
            css={stop(stop => stop ? "color: #c34043;" : "color: #dcd7ba;")}
            label={"󱎫"}
          />
        </box>
        <slider
          visible={createBinding(player, "length").as(l => l > 0)}
          onChangeValue={({ value }) => {
            player.position = value * player.length
          }}
          value={position}
        />
      </box>
    </revealer>
  }

  function Actions() {
    return <box
      class="Actions"
      homogeneous
      orientation={Gtk.Orientation.VERTICAL}>
      <button
        label="󰒮"
        onClicked={() => player.previous()}
      />
      <button
        label={playIcon}
        onClicked={() => player.play_pause()}
      />
      <button
        label="󰒭"
        onClicked={() => player.next()}
      />
    </box>
  }


  return <box
    class="MediaPlayer"
    name={player.entry}
    $type="named"
    $={() => createBinding(player, "artUrl").subscribe(() => {
      if (stop.get()) {
        player.stop()
        setStop(false)
      }
    })}
  >
    <Gtk.EventControllerMotion
      $={(self) => {
        self.connect("enter", () => setShowPosition(true))
        self.connect("leave", () => setShowPosition(false))
      }}
    />
    <box
      class="Cover"
      hexpand
      widthRequest={300}
      css={coverArt}>
      <box
        class="Description"
        orientation={Gtk.Orientation.VERTICAL}>
        <ArtistTitle />
        <Position />
      </box>
    </box>
    <Actions />
  </box>
}
