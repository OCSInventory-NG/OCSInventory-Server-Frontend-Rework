<template>
	<div 
		id="groups"
		class="container-xl"
	>
		<div>
			<PageHeader 
				page-title="groups"
			/>

			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<div v-if="errored">
							<Alert 
								:message="errormsg"
								:cols="true"
								variant="danger"
							/>
						</div>

						<div 
							v-if="loading"
							class="ocs-loader"
						>
							<Loader />
						</div>

						<div v-else>
							<GroupModal
								v-if="canadd"
								:permissionsprop="permissions"
								:permissionslabelprop="permissionslabel"
								:allassetsidprop="allassetsid"
								@reload-datatable="reloadDatatable"
							/>

							<Datatable
								id="groups-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:canedit="canedit"
								:candelete="candelete"
								:duplicateitem="duplicateitem"
								:isbusy="isbusy"
								is-sticky
								editcomponent="GroupModal"
								title="groups"
								titlevalue="group"
								translationkey="group."
								@reload-datatable="reloadDatatable"
							>
								<template #cell(asset_groups)="{ row }">
									<template v-if="row.item.__asset_groups?.mode === 'list'">
										<div
											v-for="assetGroup in row.item.__asset_groups.groups"
											:key="assetGroup.id"
										>
											<router-link
												:to="'/inventory/assetgroups/' + assetGroup.id"
												class="ocs-link"
											>
												{{ assetGroup.name }}
											</router-link>
										</div>
									</template>
									<span
										v-else
										class="text-secondary"
									>
										{{ row.item.__asset_groups?.text }}
									</span>
								</template>

								<template #cell(permissions)="{ row }">
									<dl class="permissions-list">
										<template
											v-for="line in row.item.__permissions"
											:key="line.label"
										>
											<dt>{{ line.label }}</dt>
											<dd>{{ line.rights }}</dd>
										</template>
									</dl>
								</template>
							</Datatable>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { hasPermission } from "@/utils/permissions"

export default {
	name: "Group",
	data() {
		return {
			errored: false,
			errormsg: null,

			canadd: false,
			canedit: false,
			candelete: false,

			duplicateitem: false,
			rowdata: [],
			rowheader: [],
			permissions: [],
			permissionslabel: [],
			allassetsid: null,

			isbusy: true,
			loading: true,
		}
	},
	async mounted() {
		if (hasPermission("auth_view_group")) {
			if (hasPermission("auth_add_group")) {
				this.canadd = true
				this.duplicateitem = true
			}
			if (hasPermission("auth_change_group")) {
				this.canedit = true
			}
			if (hasPermission("auth_delete_group")) {
				this.candelete = true
			}
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
			this.isbusy = false
			return
		}

		// Data init
		await this.loadInitial()
	},
	methods: {
		async loadInitial() {
			this.loading = true
			this.isbusy = true
			try {
				// Get header
				const header = await this.$api.generic.options("groups/")
				this.rowheader = Object.keys(header.actions.POST).filter(
					(f) => f !== "is_protected"
				)

				// Get permissions
				await this.getPermissions()

				this.errored = false
				this.errormsg = null
			} catch (e) {
				this.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.errored = true
			} finally {
				this.loading = false
				this.isbusy = false
			}
		},

		async getPermissions() {
			this.isbusy = true
			try {
				const data = await this.$api.generic.get("permissions/")
				const perms = Array.isArray(data) ? data : (data?.results || [])

				const prefixes = ["add_", "change_", "delete_", "view_"]

				const djangoCoreApps = [
					"admin",
					"contenttype",
					"session",
					"token",
					"logentry",
					"proxy",
					"filemanager",
					"groupprotection",
					"groupassetscope"
				]

				this.permissions = {}
				this.permissionslabel = []

				const labelMap = new Map()

				for (const p of perms) {
					const codename = p?.codename || ""
					if (!codename) continue

					const appLabel =
						p?.content_type?.app_label ||
						p?.content_type?.app ||
						p?.app_label ||
						p?.codename ||
						null

					if (appLabel && djangoCoreApps.some(core => appLabel.includes(core))) {
						continue
					}

					if (codename === "view_all_assets") {
						this.allassetsid = p.id
						continue
					}

					for (const prefix of prefixes) {
						if (!codename.startsWith(prefix)) continue

						const permissionKey = codename.slice(prefix.length)
						const labelId = `${permissionKey}_${p.content_type}`

						const entry = {
							id: p.id,
							code: `permission_${p.id}`,
							name: codename,
							key: permissionKey,
							type: prefix.replace("_", ""),
						}

						if (!this.permissions[labelId]) this.permissions[labelId] = []
						this.permissions[labelId].push(entry)

						if (!labelMap.has(labelId)) {
							const trad = this.$te("permission." + permissionKey)
								? this.$t("permission." + permissionKey)
								: permissionKey

							labelMap.set(labelId, trad)
						}
					}
				}

				this.permissionslabel = Array.from(labelMap.entries())
					.map(([id, trad]) => ({ id, trad }))
					.sort((a, b) => (a.trad || "").localeCompare(b.trad || ""))

				await this.getGroups()
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			} finally {
				this.isbusy = false
			}
		},

		async getGroups() {
			this.isbusy = true

			try {
				const data = await this.$api.generic.get("groups/", {}, { expand: "asset_groups" })
				this.rowdata = Array.isArray(data) ? data : (data?.results || [])

				// Must run before permissionsTreatment, which replaces the permission ids
				this.assetGroupsTreatment()
				this.permissionsTreatment()

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			} finally {
				this.isbusy = false
			}
		},

		assetGroupsTreatment() {
			for (const row of this.rowdata || []) {
				let scope
				if (this.allassetsid && (row.permissions || []).includes(this.allassetsid)) {
					scope = { mode: "all", text: this.$t("group.scope_all_assets") }
				} else if (row.asset_groups == null) {
					scope = { mode: "unrestricted", text: this.$t("group.scope_unrestricted") }
				} else if (!row.asset_groups.length) {
					scope = { mode: "empty", text: this.$t("group.scope_empty") }
				} else {
					scope = { mode: "list", groups: row.asset_groups }
					scope.text = row.asset_groups.map((g) => g.name).join("\n")
				}

				// Structured scope for the display, plain text kept for the datatable search
				row.__asset_groups = scope
				row.asset_groups = scope.text
			}
		},

		permissionsTreatment() {
			const permById = new Map()

			for (const label of this.permissionslabel) {
				const list = this.permissions?.[label.id] || []
				for (const p of list) {
					permById.set(p.id, {
						labelTrad: label.trad,
						typeTrad: this.$te("generic." + p.type) ? this.$t("generic." + p.type) : p.type,
					})
				}
			}

			for (const row of this.rowdata || []) {
				const grouped = new Map()

				for (const permId of row.permissions || []) {
					const info = permById.get(permId)
					if (!info) continue

					if (!grouped.has(info.labelTrad)) grouped.set(info.labelTrad, new Set())
					grouped.get(info.labelTrad).add(info.typeTrad)
				}

				const lines = Array.from(grouped.entries())
					.map(([label, setTypes]) => ({ label, rights: Array.from(setTypes).join(", ") }))
					.sort((a, b) => a.label.localeCompare(b.label))

				// Structured lines for the aligned display, plain text kept for the datatable search
				row.__permissions = lines
				row.permissions = lines.map((l) => `${l.label} : ${l.rights}`).join("\n")
			}
		},

		async reloadDatatable() {
			await this.getGroups()
		}
	}
}
</script>