import { monitorFile, readFile, readFileAsync } from "ags/file"
import { execAsync } from "ags/process"
import GObject, { register, getter, setter } from "gnim/gobject"

const screenDevice = await execAsync(["bash", "-c", `ls -w1 /sys/class/backlight | head -1` ])
const screen = `/sys/class/backlight/${screenDevice}`

let instance: Brightness

@register({ GTypeName: "Brightness" })
export default class Brightness extends GObject.Object {
  declare $signals: GObject.Object.SignalSignatures & {
    "notify::screen": () => void
    "notify::kbd": () => void
  }
  static get_default() {
    if (!instance) instance = new Brightness()
    return instance
  }

  #screenMax = Number(screenDevice ? readFile(`${screen}/max_brightness`) : "0")
  #screen = Number(screenDevice ? readFile(`${screen}/brightness`) : "0") / this.#screenMax

  @getter(Number)
  get screen() {
    return this.#screen
  }

  @setter(Number)
  set screen(percent) {
    if (percent < 0) percent = 0

    if (percent > 1) percent = 1

    execAsync(`brightnessctl set ${Math.floor(percent * 100)}% -q`).then(() => {
      this.#screen = percent
      this.notify("screen")
    })
  }

  constructor() {
    super()

    monitorFile(`${screen}/brightness`, async (f) => {
      const v = await readFileAsync(f)
      this.#screen = Number(v) / this.#screenMax
      this.notify("screen")
    })
  }
}
