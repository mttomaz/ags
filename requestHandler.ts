import { setShowBar, setShowCrosshair, showBar, showCrosshair } from "@common/vars"

export default function requestHandler(request: string, res: (response: any) => void) {
  const args = request.split(':')

  switch (args[0]) {
    case 'bar':
      switch (args[1]) {
        case 'toggle': return res(setShowBar(!showBar.get()))
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
