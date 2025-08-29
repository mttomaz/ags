import * as vars from "@common/vars"

export default function requestHandler(argv: string[], res: (response: any) => void) {
  const [cmd, arg, ..._] = argv

  switch (cmd) {
    case "toggle":
      switch (arg) {
        case "bar":
          vars.setShowBar(!vars.showBar.get())
          return res('bar: ok')
        case "launcher":
          vars.setShowLauncher(!vars.showLauncher.get())
          return res('launcher: ok')
        case "leftsidebar":
          vars.setShowLeftSidebar(!vars.showLeftSidebar.get())
          return res('leftsidebar: ok')
        case "rightsidebar":
          vars.setShowRightSidebar(!vars.showRightSidebar.get())
          return res('rightsidebar: ok')
        case "crosshair":
          vars.setShowCrosshair(!vars.showCrosshair.get())
          return res('crosshair: ok')
        default:
          return res(`Unknown window "${arg}"`)
      }
    default:
      return res(`Unknown request "${cmd}"`)
  }
}
