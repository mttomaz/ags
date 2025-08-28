import { createState } from "gnim"
import AstalApps from "gi://AstalApps?version=0.1"

export const [appList, setAppList] = createState(new Array<AstalApps.Application>())
export const [emojiList, setEmojiList] = createState(new Array)
