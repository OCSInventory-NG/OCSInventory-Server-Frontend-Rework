<template>
	<div id="group-modal">
		<div 
			v-if="!update"
			class="page-header d-print-none"
		>
			<div class="row">
				<div class="col-auto ms-auto">
					<b-button
						:title="$t('group.addgroup')"
						variant="primary"
						class="d-sm-inline-block btn-modal"
						@click="loadData()"
					>
						<font-awesome-icon 
							:icon="['fas', 'plus']"
						/>
						{{ $t('group.addgroup') }}
					</b-button>
				</div>
			</div>
		</div>
		<div v-else>
			<button 
				:title="$t('group.editgroup')"
				class="btn btn-ghost-dark"
				@click="loadData(id)"
			>
				<font-awesome-icon 
					:icon="['fas', 'pencil']"
				/>
			</button>
		</div>
		<b-modal 
			id="groupmodal" 
			v-model="groupmodal"
			:title="(!update) ? $t('group.addgroup') : $t('group.editgroup')"
			hide-footer
			modal-class="custom-modal"
			size="xl"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ (!update) ? $t('group.addgroup') : $t('group.editgroup') }}
					<b-spinner 
						v-if="loadingcreate"
						variant="success"
					/>
					<font-awesome-icon 
						v-if="createwithsuccess"
						:icon="['fas', 'check']"
						color="green"
					/>
					<font-awesome-icon 
						v-if="createerror"
						:icon="['fas', 'xmark']"
						color="red"
					/>
				</h5>
				<b-button 
					size="sm" 
					variant="outline-danger" 
					@click="close()"
				>
					<font-awesome-icon 
						:icon="['fas', 'xmark']"
						size="1x"
					/>
				</b-button>
			</template>
			<Alert 
				v-if="createerror || errored"
				:message="(createerror) ? createerrormsg : errormsg" 
				variant="danger"
			/>
			<b-form
				v-if="!loading"
				@submit="onSubmit"
			>
				<b-row>
					<b-col>
						<h4>{{ $t('group.group_informations') }}</h4>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('user.name')" 
							label-for="name"
						>
							<b-form-input
								id="name"
								v-model="row.name"
								required
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<h4>{{ $t('group.permissions') }}</h4>
					</b-col>
				</b-row>
				<b-row>
					<Matrix
						:key="matrixKey"
						:id="id"
						v-model="row.permissions"
						:rowtab="permissions"
						:rowlabel="permissionslabel"
						:rowpermissions="row.permissions"
						@permissions="row.permissions = $event"
					/>
				</b-row>
				<b-row>
					<b-col align-self="start" />
					<b-col 
						align-self="center"
						align="center"
					>
						<b-button 
							type="submit"
							variant="success"
						>
							{{ (!update) ? $t('generic.add') : $t('generic.save') }}
						</b-button>
					</b-col>
					<b-col align-self="end" />
				</b-row>
			</b-form>
			<div 
				v-if="loading"
				class="ocs-loader"
			>
				<Loader />
			</div>
		</b-modal>
	</div>
</template>

<script>
export default {
	name: "GroupModal",
	props: {
		permissionsprop: { type: [Array, Object], default: () => [] },
		permissionslabelprop: { type: [Array, Object], default: () => [] },
		update: { type: Boolean, default: false },
		id: { type: Number, default: null }
	},
	data() {
		return {
			errormsg: null,
			errored: false,
			createerror: false,
			createerrormsg: null,

			createwithsuccess: false,

			row: {
				name: null,
				permissions: []
			},
			groupmodal: false,
			matrixKey: 0,
			permissions: [],
			permissionslabel: [],
			
			loading: true,
			loadingcreate: false,
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.groupmodal = false
				this.createwithsuccess = false
				this.row = {
					name: null,
					permissions: []
				}
				this.$emit("reloadDatatable")
			}, 500)
		}
	},
	mounted() {
		if(!this.update) {
			this.permissions = this.permissionsprop
			this.permissionslabel = this.permissionslabelprop
			this.loading = false
		}
	},
	methods: {
		_apiError(e) {
			return e?.response?.data?.error || e?.message || String(e)
		},

		loadData(id) {
			this.groupmodal = true

			this.matrixKey += 1

			this.row = this.row || {}
			this.row.name = null

			if (!Array.isArray(this.row.permissions)) {
				this.row.permissions = []
			} else {
				this.row.permissions.splice(0, this.row.permissions.length)
			}

			this.errormsg = null
			this.errored = false
			this.createerror = false
			this.createerrormsg = null
			this.createwithsuccess = false

			if (id) {
				this.loading = true
				this.getPermissions(id)
			}
		},

		async getPermissions(id) {
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
					"groupprotection"
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

				await this.getGroup(id)
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
				this.loading = false
			}
		},

		async getGroup(id) {
			try {
				const data = await this.$api.generic.get(`groups/${id}/`)
				this.row = data
				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		async onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true
			this.createwithsuccess = false
			this.createerror = false
			this.createerrormsg = null

			try {
				if (!this.update) {
					await this.$api.generic.post("groups/", this.row)
				} else {
					await this.$api.generic.patch(`groups/${this.row.id}/`, this.row)
				}

				this.createwithsuccess = true
			} catch (e) {
				this.createwithsuccess = false
				this.createerror = true
				this.createerrormsg = this._apiError(e)
			} finally {
				this.loadingcreate = false
			}
		},
	}
}
</script>