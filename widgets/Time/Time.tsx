import Gtk from "gi://Gtk?version=4.0"
import { With } from "gnim"
import { currentTime } from "@common/vars"

function DigitStack(index: number) {
  return (
    <stack
      $={(self) => (<With value={currentTime}>
        {(time) => {
          self.visibleChildName = time?.[index] ?? "0"
          return null
        }}
      </With>)}
      transitionDuration={500}
      transitionType={Gtk.StackTransitionType.SLIDE_UP_DOWN}
      class="DigitStack"
    >
      {Array.from({ length: 10 }, (_, i) => (
        <label $type="named" name={i.toString()} label={i.toString()} />
      ))}
    </stack>
  )
}

export default function Time() {
  return (
    <box
      class="Time"
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.CENTER}
    >
      {DigitStack(0)}
      {DigitStack(1)}
      <label label=":" css="font-family: 'JetBrainsMono Nerd Font'" />
      {DigitStack(3)}
      {DigitStack(4)}
    </box>
  )
}
