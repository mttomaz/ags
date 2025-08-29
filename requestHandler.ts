
export default function requestHandler(argv: string[], res: (response: any) => void) {
  const [cmd, arg, ..._] = argv

  return res(`res: ${cmd} ${arg}`)
}
