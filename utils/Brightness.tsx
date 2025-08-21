import GObject, { register, getter, setter } from "gnim/gobject"
import { execAsync } from "ags/process"
import { monitorFile, readFile, readFileAsync } from "ags/file"

const screenDevice = await execAsync(["bash", "-c", `ls -w1 /sys/class/backlight | head -1` ])
const kbdDevice = await execAsync(["bash", "-c", `ls -w1 /sys/class/leds | head -1` ])

const screen = `/sys/class/backlight/${screenDevice}`
const kbd = `/sys/class/leds/${kbdDevice}`

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

  #kbdMax = Number(readFile(`${kbd}/max_brightness`))
  #kbd = Number(readFile(`${kbd}/brightness`))
  #screenMax = Number(readFile(`${screen}/max_brightness`))
  #screen = Number(readFile(`${screen}/brightness`)) / this.#screenMax

  @getter(Number)
  get kbd() {
    return this.#kbd
  }

  @setter(Number)
  set kbd(value) {
    if (value < 0 || value > this.#kbdMax) return

    execAsync(`brightnessctl -d ${kbd} s ${value} -q`).then(() => {
      this.#kbd = value
      this.notify("kbd")
    })
  }

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

    monitorFile(`${kbd}/brightness`, async (f) => {
      const v = await readFileAsync(f)
      this.#kbd = Number(v) / this.#kbdMax
      this.notify("kbd")
    })
  }
}
