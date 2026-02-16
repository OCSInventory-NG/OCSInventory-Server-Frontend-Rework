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
								@reloadDatatable="reloadDatatable"
							/>

							<Datatable
								id="groups-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:canedit="canedit"
								:candelete="candelete"
								:duplicateitem="duplicateitem"
								:isbusy="isbusy"
								editcomponent="GroupModal"
								title="groups"
								titlevalue="group"
								translationkey="group."
								@reloadDatatable="reloadDatatable"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
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

			isbusy: true,
			loading: true,
		}
	},
	async mounted() {
		const rawPermissions = localStorage.getItem('permissions')
		const permissions = rawPermissions ? rawPermissions.split(",") : []

		if (permissions.includes("auth_view_group")) {
			if (permissions.includes("auth_add_group")) {
				this.canadd = true
			}
			if (permissions.includes("auth_change_group")) {
				this.canedit = true
			}
			if (permissions.includes("auth_delete_group")) {
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
					(f) => !["is_protected"].includes(f)
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
					"filemanager"
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
				const data = await this.$api.generic.get("groups/")
				this.rowdata = Array.isArray(data) ? data : (data?.results || [])

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
					.map(([labelTrad, setTypes]) => `${labelTrad} : ${Array.from(setTypes).join(", ")}`)
					.sort((a, b) => a.localeCompare(b))

				row.permissions = lines.join("\n")
			}
		},

		async reloadDatatable() {
			await this.getGroups()
		}
	}
}
</script>