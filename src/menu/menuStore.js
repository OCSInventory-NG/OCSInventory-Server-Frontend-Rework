import { reactive } from "vue"
import { baseMenu } from "./baseMenu"

export const menuStore = reactive({
  items: [...baseMenu],
})

export function addMenuItem(item) {
  menuStore.items.push(item)
}