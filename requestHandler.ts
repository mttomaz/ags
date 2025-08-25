import * as vars from "@common/vars"

export default function requestHandler(request: string, res: (response: any) => void) {
  const args = request.split(':')

  switch (args[0]) {
    case 'bar':
      switch (args[1]) {
        case 'toggle':
          vars.setShowBar(!vars.showBar.get())
          return res('bar: ok')
        default: return res('Unknown command for bar.')
      }
    case 'leftsidebar':
      switch (args[1]) {
        case 'toggle':
          vars.setShowLeftSidebar(!vars.showLeftSidebar.get())
          return res('leftsidebar: ok')
        default: return res('Unknown command for leftsidebar.')
      }
    case 'rightsidebar':
      switch (args[1]) {
        case 'toggle':
          vars.setShowRightSidebar(!vars.showRightSidebar.get())
          return res('rightsidebar: ok')
        default: return res('Unknown command for rightsidebar.')
      }
    case 'crosshair':
      switch (args[1]) {
        case 'toggle':
          vars.setShowCrosshair(!vars.showCrosshair.get())
          return res('crosshair: ok')
        default: return res('Unknown command for crosshair.')
      }
    default:
      return res('Unknown request.')
  }
}
