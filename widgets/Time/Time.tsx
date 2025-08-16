import Gtk from "gi://Gtk?version=4.0"
import { currentTime } from "@common/vars"
import { With } from "ags"

function DigitStack(index: number) {
  return (
    <box>
      <With value={currentTime}>
        {(time) => (
          <stack
            transitionType={Gtk.StackTransitionType.SLIDE_DOWN}
            transitionDuration={500}
            visibleChildName={time?.[index] ?? "0"}
            class="DigitStack"
          >
            {Array.from({ length: 10 }, (_, i) => (
              <label name={i.toString()} label={i.toString()} />
            ))}
          </stack>
        )}
      </With>
    </box>
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
