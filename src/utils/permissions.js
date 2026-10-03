import { recordPermissionCheck } from "@/debug/debugStore"

// Every permission check of the frontend goes through here, so the debug mode
// can show which permissions a page checks to display its buttons
export function hasPermission(codename) {
	recordPermissionCheck(codename)
	const permissions = localStorage.getItem("permissions") || ""
	return permissions.split(",").includes(codename)
}
