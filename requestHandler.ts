import { setShowBar, setShowCrosshair, setShowLeftSidebar, setShowRightSidebar, showBar, showCrosshair, showLeftSidebar, showRightSidebar } from "@common/vars"

export default function requestHandler(request: string, res: (response: any) => void) {
  const args = request.split(':')

  switch (args[0]) {
    case 'bar':
      switch (args[1]) {
        case 'toggle': return res(setShowBar(!showBar.get()))
        default: return res('Unknown command for bar.')
      }
    case 'leftsidebar':
      switch (args[1]) {
        case 'toggle': return res(setShowLeftSidebar(!showLeftSidebar.get()))
        default: return res('Unknown command for bar.')
      }
    case 'rightsidebar':
      switch (args[1]) {
        case 'toggle': return res(setShowRightSidebar(!showRightSidebar.get()))
        default: return res('Unknown command for bar.')
      }
    case 'crosshair':
      switch (args[1]) {
        case 'toggle': return res(setShowCrosshair(!showCrosshair.get()))
        default: return res('Unknown command for crosshair.')
      }
    default:
      return res('Unknown request.')
  }
}
