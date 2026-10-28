<template>
	<div id="columnlayout-modal">
		<!-- the actions hang on the picker, they act on the layout it shows -->
		<div class="select-btn-group">
			<v-select
				id="columnlayout-select"
				v-model="activeid"
				:options="layoutoptions"
				:reduce="text => text.value"
				:clearable="false"
				label="text"
				@option:selected="onSelect()"
			/>

			<!-- Save the displayed columns into the active layout -->
			<button
				v-if="cansave"
				:title="$t('columnlayout.save')"
				class="btn datatable-btn toolbar-btn"
				:disabled="!isdirty || loadingsave"
				@click="saveColumns()"
			>
				<b-spinner
					v-if="loadingsave"
					small
				/>
				<font-awesome-icon
					v-else
					:icon="['far', 'floppy-disk']"
				/>
			</button>

			<button
				v-if="cansaveas"
				:title="$t('columnlayout.saveas')"
				class="btn datatable-btn toolbar-btn"
				@click="openForm(false)"
			>
				<font-awesome-icon :icon="['fas', 'file-circle-plus']" />
			</button>

			<button
				v-if="canmodify"
				:title="$t('columnlayout.edit')"
				class="btn datatable-btn toolbar-btn"
				@click="openForm(true)"
			>
				<font-awesome-icon :icon="['fas', 'pencil']" />
			</button>

			<button
				v-if="candelete"
				:title="$t('columnlayout.delete')"
				class="btn datatable-btn toolbar-btn text-danger"
				@click="openDelete()"
			>
				<font-awesome-icon :icon="['fas', 'trash-can']" />
			</button>
		</div>

		<!-- Create / edit form -->
		<b-modal
			id="columnlayoutmodal"
			v-model="formmodal"
			hide-footer
			modal-class="custom-modal"
			size="lg"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ editingid ? $t('columnlayout.editlayout') : $t('columnlayout.savelayout') }}
					<b-spinner
						v-if="loadingform"
						variant="success"
					/>
					<font-awesome-icon
						v-if="formsuccess"
						:icon="['fas', 'check']"
						color="green"
					/>
					<font-awesome-icon
						v-if="formerror"
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

			<div class="ocs-modal-form">
				<Alert
					v-if="formerror"
					:message="formerrormsg"
					variant="danger"
				/>

				<b-form @submit="onSubmit">
					<b-row>
						<b-col md="7">
							<b-form-group
								class="mb-2"
								:label="$t('columnlayout.name')"
								label-for="columnlayout-name"
							>
								<b-form-input
									id="columnlayout-name"
									v-model="row.name"
									:placeholder="$t('columnlayout.nameplaceholder')"
									required
								/>
							</b-form-group>
						</b-col>
						<b-col md="5">
							<b-form-group
								class="mb-2"
								:label="$t('search.visibility')"
								label-for="columnlayout-visibility"
							>
								<v-select
									id="columnlayout-visibility"
									v-model="row.visibility"
									:options="visibilityopt"
									:reduce="text => text.value"
									:clearable="false"
									label="text"
									class="ocs-select"
								/>
							</b-form-group>
						</b-col>
					</b-row>

					<b-row v-if="row.visibility == 'private_group'">
						<b-col md="7">
							<b-form-group
								class="mb-2"
								:label="$t('search.groups')"
								label-for="select-btn-groups"
							>
								<v-select
									id="select-btn-groups"
									v-model="row.groups"
									:options="groups"
									:reduce="text => text.value"
									label="text"
									class="ocs-select"
									multiple
								/>
							</b-form-group>
						</b-col>
						<b-col md="5">
							<b-form-group
								class="mb-2"
								:label="$t('search.allow_group_modification')"
								label-for="columnlayout-allow-group"
							>
								<label class="form-check form-switch">
									<input
										id="columnlayout-allow-group"
										v-model="row.allow_group_modification"
										class="form-check-input"
										type="checkbox"
									>
								</label>
							</b-form-group>
						</b-col>
					</b-row>

					<!-- an edit only renames or shares, the columns go through the save button -->
					<div
						v-if="!editingid"
						class="columnlayout-columns"
					>
						<p class="text-muted mb-1">
							{{ $t('columnlayout.columnshelp', { count: visiblecolumns.length }) }}
						</p>
						<span
							v-for="column in visiblecolumns"
							:key="column.key"
							class="badge columnlayout-chip"
						>
							{{ column.label }}
						</span>
					</div>

					<div class="text-center mt-3">
						<b-button
							type="submit"
							variant="success"
							:disabled="loadingform || (!editingid && !visiblecolumns.length)"
						>
							{{ editingid ? $t('generic.save') : $t('generic.add') }}
						</b-button>
						<b-button
							variant="outline-secondary"
							class="ms-2"
							@click="formmodal = false"
						>
							{{ $t('generic.cancel') }}
						</b-button>
					</div>
				</b-form>
			</div>
		</b-modal>

		<!-- Delete confirmation -->
		<b-modal
			id="columnlayoutdeletemodal"
			v-model="deletemodal"
			:title="$t('columnlayout.delete')"
			hide-footer
			size="sm"
		>
			<Alert
				v-if="deleteerror"
				:message="deleteerrormsg"
				variant="danger"
			/>
			<div class="text-center">
				<font-awesome-icon
					:icon="['fas', 'triangle-exclamation']"
					size="5x"
					color="#d63939"
				/>
				<p><b>{{ $t('message.deletevalid') }}</b></p>
				<p>{{ $t('message.delete_msg') }} {{ activelayout?.name }} ?</p>
				<button
					class="btn btn-danger"
					:disabled="loadingdelete"
					@click="onDelete()"
				>
					{{ $t('generic.delete_msg2') }}
				</button>
			</div>
		</b-modal>
	</div>
</template>

<script>
import { hasPermission } from "@/utils/permissions"

// layout ids start at 1, vue-select would take null for an empty selection
const NO_LAYOUT = 0

export default {
	name: "ColumnLayoutModal",

	props: {
		target: { type: String, default: "asset" },
		// every column of the table, with its label and whether it is shown
		columns: { type: Array, default: () => [] },
	},

	emits: ["applyLayout"],

	data() {
		return {
			layouts: [],
			activeid: NO_LAYOUT,

			currentuserid: null,
			currentusername: null,
			currentusergroups: [],
			groups: [],

			formmodal: false,
			editingid: null,
			row: {
				name: null,
				visibility: "private_personal",
				groups: [],
				allow_group_modification: false,
			},
			loadingform: false,
			formsuccess: false,
			formerror: false,
			formerrormsg: null,

			loadingsave: false,

			deletemodal: false,
			loadingdelete: false,
			deleteerror: false,
			deleteerrormsg: null,
		}
	},

	computed: {
		storagekey() {
			return "columnlayout_" + this.target
		},

		// two authors may share a name, the author is only shown when they are mixed
		layoutoptions() {
			const mixed = new Set(this.layouts.map((layout) => layout.user)).size > 1
			return [
				{ value: NO_LAYOUT, text: this.$t("columnlayout.none") },
				...this.layouts.map((layout) => ({
					value: layout.id,
					text: (mixed && layout.author) ? `${layout.name} (${layout.author})` : layout.name,
				})),
			]
		},

		activelayout() {
			return this.layouts.find((layout) => layout.id === this.activeid) || null
		},

		visiblecolumns() {
			return this.columns.filter((column) => column.visible)
		},

		// a column this user cannot see, a virtual column shared with others for
		// instance, was not removed from the view
		isdirty() {
			if (!this.activelayout) return false
			const available = this.columns.map((column) => column.key)
			const saved = (this.activelayout.columns || []).filter((key) => available.includes(key))
			const shown = this.visiblecolumns.map((column) => column.key)
			return saved.length !== shown.length || saved.some((key, index) => key !== shown[index])
		},

		visibilityopt() {
			return [
				{ value: "private_personal", text: this.$t("search.private_personal") },
				{ value: "public", text: this.$t("search.public") },
				{ value: "private_group", text: this.$t("search.private_group") },
			]
		},

		// permissions are stored as "<app label>_<codename>" at login
		cansave() {
			return !!this.activelayout
				&& hasPermission("virtualcolumn_change_columnlayout")
				&& this.canEdit(this.activelayout)
		},
		cansaveas() {
			return hasPermission("virtualcolumn_add_columnlayout")
		},
		canmodify() {
			return this.cansave
		},
		candelete() {
			return !!this.activelayout
				&& hasPermission("virtualcolumn_delete_columnlayout")
				&& this.activelayout.user === this.currentuserid
		},
	},

	watch: {
		// setting it back to false fires this watcher again, close only once
		formsuccess: function (value) {
			if (!value) return
			setTimeout(() => {
				this.formsuccess = false
				this.formmodal = false
			}, 500)
		},
	},

	async mounted() {
		await Promise.all([this.getLayouts(), this.getAccount()])

		// the choice is remembered per browser, the layout itself lives on the server
		const stored = Number(localStorage.getItem(this.storagekey))
		if (stored && this.layouts.some((layout) => layout.id === stored)) {
			this.activeid = stored
			this.onSelect()
		}
	},

	methods: {
		// the author always may, a group member only when allowed to
		canEdit(layout) {
			if (layout.user === this.currentuserid) {
				return true
			}
			return layout.visibility === "private_group"
				&& layout.allow_group_modification
				&& (layout.groups || []).some((id) => this.currentusergroups.includes(id))
		},

		// a creation answers {error}, an update the DRF field errors, a refusal {detail}
		_apiError(e) {
			const data = e?.response?.data
			if (data?.error) return data.error
			if (data?.detail) return data.detail
			if (data && typeof data === "object") {
				const messages = Object.values(data).flat().filter((item) => typeof item === "string")
				if (messages.length) return messages.join(" ")
			}
			return e?.message || String(e)
		},

		userName(user) {
			return (user.first_name && user.first_name !== "")
				? `${user.last_name} ${user.first_name}`
				: user.username
		},

		// the list expands the author, a creation or an update answers with its id
		normalizeLayout(layout, author = null) {
			if (layout.user && typeof layout.user === "object") {
				return { ...layout, user: layout.user.id, author: this.userName(layout.user) }
			}
			return { ...layout, author }
		},

		async getLayouts() {
			try {
				const data = await this.$api.generic.get(
					"column_layouts/", {}, { target: this.target, ordering: "name", expand: "user" }
				)
				this.layouts = data.map((layout) => this.normalizeLayout(layout))
			} catch (e) {
				this.layouts = []
			}
		},

		async getAccount() {
			try {
				const account = await this.$api.generic.get("myaccount/")
				this.currentuserid = account.id
				this.currentusername = this.userName(account)
				this.currentusergroups = account.groups || []
			} catch (e) {
				this.currentuserid = null
				this.currentusername = null
				this.currentusergroups = []
			}
		},

		// only the form needs the group names
		async getGroups() {
			try {
				const results = await Promise.all(
					this.currentusergroups.map((id) => this.$api.generic.get(`groups/${id}/`))
				)
				this.groups = results
					.map((group) => ({ value: group.id, text: group.name }))
					.sort((a, b) => a.text.localeCompare(b.text))
			} catch (e) {
				this.groups = []
			}
		},

		onSelect() {
			if (this.activelayout) {
				localStorage.setItem(this.storagekey, this.activelayout.id)
				this.$emit("applyLayout", this.activelayout.columns || [])
			} else {
				localStorage.removeItem(this.storagekey)
				this.$emit("applyLayout", null)
			}
		},

		// keep the columns this user cannot see, they belong to someone else's view
		columnsToSave(layout) {
			const available = this.columns.map((column) => column.key)
			const kept = (layout?.columns || []).filter((key) => !available.includes(key))
			return [...this.visiblecolumns.map((column) => column.key), ...kept]
		},

		async saveColumns() {
			this.loadingsave = true
			try {
				const updated = await this.$api.generic.patch(
					`column_layouts/${this.activelayout.id}/`,
					{ columns: this.columnsToSave(this.activelayout) }
				)
				this.replaceLayout(this.normalizeLayout(updated, this.activelayout.author))
			} catch (e) {
				// reuse the form to report it, the toolbar has no room for an alert
				this.editingid = this.activelayout.id
				this.fillForm(this.activelayout)
				this.formerrormsg = this._apiError(e)
				this.formerror = true
				this.formmodal = true
			} finally {
				this.loadingsave = false
			}
		},

		replaceLayout(layout) {
			const index = this.layouts.findIndex((item) => item.id === layout.id)
			if (index === -1) {
				this.layouts.push(layout)
			} else {
				this.layouts.splice(index, 1, layout)
			}
			this.layouts.sort((a, b) => a.name.localeCompare(b.name))
		},

		fillForm(layout) {
			this.row = {
				name: layout?.name || null,
				visibility: layout?.visibility || "private_personal",
				groups: layout?.groups || [],
				allow_group_modification: layout?.allow_group_modification || false,
			}
		},

		async openForm(edit) {
			this.editingid = edit ? this.activelayout.id : null
			this.fillForm(edit ? this.activelayout : null)
			this.formerror = false
			this.formerrormsg = null
			this.formsuccess = false
			this.formmodal = true

			this.loadingform = true
			await this.getGroups()
			this.loadingform = false
		},

		async onSubmit(event) {
			event.preventDefault()
			this.loadingform = true
			this.formerror = false
			this.formerrormsg = null

			const payload = {
				name: this.row.name,
				visibility: this.row.visibility,
				groups: this.row.visibility === "private_group" ? this.row.groups : [],
				allow_group_modification:
					this.row.visibility === "private_group"
					&& this.row.allow_group_modification,
			}

			try {
				if (this.editingid) {
					const updated = await this.$api.generic.patch(
						`column_layouts/${this.editingid}/`, payload
					)
					this.replaceLayout(this.normalizeLayout(updated, this.activelayout.author))
				} else {
					const created = await this.$api.generic.post("column_layouts/", {
						...payload,
						target: this.target,
						columns: this.columnsToSave(null),
					})
					this.replaceLayout(this.normalizeLayout(created, this.currentusername))
					this.activeid = created.id
					this.onSelect()
				}
				this.formsuccess = true
			} catch (e) {
				this.formerrormsg = this._apiError(e)
				this.formerror = true
			} finally {
				this.loadingform = false
			}
		},

		openDelete() {
			this.deleteerror = false
			this.deleteerrormsg = null
			this.deletemodal = true
		},

		// back to the user's own show/hide choices
		async onDelete() {
			this.loadingdelete = true
			try {
				await this.$api.generic.delete(`column_layouts/${this.activelayout.id}/`)
				this.layouts = this.layouts.filter((layout) => layout.id !== this.activeid)
				this.activeid = NO_LAYOUT
				this.onSelect()
				this.deletemodal = false
			} catch (e) {
				this.deleteerrormsg = this._apiError(e)
				this.deleteerror = true
			} finally {
				this.loadingdelete = false
			}
		},
	},
}
</script>
