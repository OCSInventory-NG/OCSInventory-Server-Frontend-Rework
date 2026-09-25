<template>
	<div
		id="virtualcol-modal"
		class="d-inline-block"
	>
		<button
			:title="$t('virtualcol.manage')"
			class="btn datatable-btn"
			:disabled="loading && virtualcolmodal"
			@click="loadData()"
		>
			<b-spinner
				v-if="loading && virtualcolmodal"
				small
			/>
			<font-awesome-icon
				v-else
				:icon="['fas', 'gear']"
				size="1x"
			/>
		</button>

		<b-modal
			id="virtualcolmodal"
			v-model="virtualcolmodal"
			:title="$t('virtualcol.manage')"
			size="lg"
			hide-footer
			modal-class="custom-modal"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('virtualcol.manage') }}
					<b-spinner
						v-if="loading || loadingcreate"
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

			<div class="virtualcol-form">
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
						<b-col md="7">
							<b-form-group
								class="mb-2"
								:label="$t('virtualcol.name')"
								label-for="virtualcol-name"
							>
								<b-form-input
									id="virtualcol-name"
									v-model="row.name"
									:placeholder="$t('virtualcol.nameplaceholder')"
									required
								/>
							</b-form-group>
						</b-col>
						<b-col md="5">
							<b-form-group
								class="mb-2"
								:label="$t('search.visibility')"
								label-for="virtualcol-visibility"
							>
								<v-select
									id="virtualcol-visibility"
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
								label-for="virtualcol-groups"
							>
								<v-select
									id="virtualcol-groups"
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
								label-for="virtualcol-allow-group"
							>
								<label class="form-check form-switch">
									<input
										id="virtualcol-allow-group"
										v-model="row.allow_group_modification"
										class="form-check-input"
										type="checkbox"
									>
								</label>
							</b-form-group>
						</b-col>
					</b-row>

					<p class="text-muted">
						{{ $t('virtualcol.help') }}
					</p>

					<!-- One line per template the column covers -->
					<b-row
						v-for="(entry, index) in mappingrows"
						:key="index"
					>
						<b-col>
							<b-form-group>
								<v-select
									:id="'vcol-template' + index"
									v-model="entry.template"
									:options="templateOptions(entry)"
									:reduce="text => text.value"
									:placeholder="$t('virtualcol.template')"
									label="text"
									class="mb-3 ocs-select"
									@update:model-value="onTemplateChange(entry)"
								/>
							</b-form-group>
						</b-col>
						<b-col>
							<b-form-group>
								<v-select
									:id="'vcol-section' + index"
									v-model="entry.section"
									:options="sectionOptions(entry)"
									:reduce="text => text.value"
									:disabled="!entry.template"
									:placeholder="$t('virtualcol.section')"
									label="text"
									class="mb-3 ocs-select"
									@update:model-value="entry.field = null"
								/>
							</b-form-group>
						</b-col>
						<b-col>
							<b-form-group>
								<v-select
									:id="'vcol-field' + index"
									v-model="entry.field"
									:options="fieldOptions(entry)"
									:reduce="text => text.value"
									:disabled="!entry.section"
									:placeholder="$t('virtualcol.field')"
									label="text"
									class="mb-3 ocs-select"
								/>
							</b-form-group>
						</b-col>
						<b-col cols="auto">
							<b-form-group>
								<b-button
									:id="'vcol-addrow' + index"
									variant="primary"
									class="vcol-row-btn"
									:title="$t('virtualcol.addrow')"
									:disabled="!remainingTemplates.length"
									@click="addRow(index)"
								>
									<font-awesome-icon :icon="['fas', 'plus']" />
								</b-button>
							</b-form-group>
						</b-col>
						<b-col
							v-show="mappingrows.length > 1"
							cols="auto"
						>
							<b-form-group>
								<b-button
									:id="'vcol-removerow' + index"
									variant="danger"
									class="vcol-row-btn"
									:title="$t('virtualcol.removerow')"
									@click="removeRow(index)"
								>
									<font-awesome-icon :icon="['fas', 'trash-can']" />
								</b-button>
							</b-form-group>
						</b-col>
					</b-row>

					<b-row class="multisearch-btns">
						<b-col align-self="start" />
						<b-col
							align-self="center"
							align="center"
						>
							<b-button
								type="submit"
								variant="success"
								:disabled="!mappedCount"
							>
								{{ editingid ? $t('generic.save') : $t('generic.add') }}
							</b-button>
							<b-button
								v-if="editingid"
								variant="outline-secondary"
								class="ms-2"
								@click="cancelEdit()"
							>
								{{ $t('generic.cancel') }}
							</b-button>
						</b-col>
						<b-col align-self="end" />
					</b-row>
				</b-form>

				<div v-if="!loading && existingcols.length">
					<hr>
					<Datatable
						id="virtualcol-datatable"
						:rowdata="existingcols"
						:rowheader="existingcolsheader"
						:usecheckbox="false"
						:canexport="false"
						:canshowhide="false"
						:canrefresh="false"
						:compactheader="true"
						:hascustomactions="true"
						title="virtual_cols"
						translationkey="virtualcol."
					>
						<template #cell(firstActions)="{ row: line }">
							<div>
								<button
									v-if="canEdit(line.item)"
									type="button"
									:title="$t('virtualcol.edit')"
									class="btn btn-ghost-dark"
									@click="editColumn(line.item)"
								>
									<font-awesome-icon :icon="['fas', 'pencil']" />
								</button>
								<button
									v-if="line.item.user === currentuserid"
									type="button"
									:title="$t('generic.delete')"
									class="btn btn-ghost-danger"
									@click="onDelete(line.item)"
								>
									<font-awesome-icon :icon="['fas', 'trash-can']" />
								</button>
							</div>
						</template>
					</Datatable>
				</div>

				<div
					v-if="loading"
					class="ocs-loader"
				>
					<Loader />
				</div>
			</div>
		</b-modal>
	</div>
</template>

<script>
export default {
	name: "VirtualColModal",

	props: {
		target: { type: String, default: "asset" },
	},

	emits: ["reloadDatatable"],

	data() {
		return {
			errormsg: null,
			errored: false,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,

			virtualcolmodal: false,
			editingid: null,

			row: {
				name: null,
				visibility: "public",
				groups: [],
				allow_group_modification: false,
			},

			templates: [],
			groups: [],
			currentuserid: null,
			currentusergroups: [],
			mappingrows: [{ template: null, section: null, field: null }],
			existingcols: [],
			existingcolsheader: ["name", "templates", "visibility"],

			loading: false,
			loadingcreate: false,
		}
	},

	computed: {
		visibilityopt() {
			return [
				{ value: "public", text: this.$t('search.public') },
				{ value: "private_personal", text: this.$t('search.private_personal') },
				{ value: "private_group", text: this.$t('search.private_group') },
			]
		},

		mappedCount() {
			return this.mappingrows.filter((entry) => entry.template && entry.field).length
		},

		// one field per template, so a template can only be mapped once
		usedTemplates() {
			return this.mappingrows.map((entry) => entry.template).filter(Boolean)
		},

		remainingTemplates() {
			return this.templates.filter((template) => !this.usedTemplates.includes(template.id))
		},
	},

	watch: {
		// setting it back to false fires this watcher again, reload only once
		createwithsuccess: function (value) {
			if (!value) return
			setTimeout(() => {
				this.createwithsuccess = false
				this.resetForm()
				this.$emit("reloadDatatable")
			}, 500)
		},
	},

	methods: {
		// the author always may, a group member only when allowed to
		canEdit(col) {
			if (col.user === this.currentuserid) {
				return true
			}
			return col.rawvisibility === "private_group"
				&& col.allow_group_modification
				&& (col.groups || []).some((id) => this.currentusergroups.includes(id))
		},

		visibilityLabel(value) {
			const option = this.visibilityopt.find((item) => item.value === value)
			return option ? option.text : value
		},

		_apiError(e) {
			return e?.response?.data?.error || e?.message || String(e)
		},

		resetForm() {
			this.row = {
				name: null,
				visibility: "public",
				groups: [],
				allow_group_modification: false,
			}
			this.mappingrows = [this.emptyRow()]
			this.editingid = null
		},

		cancelEdit() {
			this.resetForm()
		},

		// the mapping only stores the field, the section is found back from it
		editColumn(col) {
			this.editingid = col.id
			this.row = {
				name: col.name,
				visibility: col.rawvisibility || "public",
				groups: col.groups || [],
				allow_group_modification: col.allow_group_modification || false,
			}

			const rows = []
			Object.entries(col.mapping || {}).forEach(([templateid, fieldid]) => {
				const template = this.templates.find((item) => item.id === Number(templateid))
				const section = (template?.sections || []).find(
					(item) => (item.fields || []).some((field) => field.id === fieldid)
				)
				rows.push({
					template: template ? template.id : null,
					section: section ? section.id : null,
					field: section ? fieldid : null,
				})
			})

			this.mappingrows = rows.length ? rows : [this.emptyRow()]
		},

		emptyRow() {
			return { template: null, section: null, field: null }
		},

		addRow(index) {
			this.mappingrows.splice(index + 1, 0, this.emptyRow())
		},

		removeRow(index) {
			this.mappingrows.splice(index, 1)
			if (!this.mappingrows.length) {
				this.mappingrows = [this.emptyRow()]
			}
		},

		onTemplateChange(entry) {
			entry.section = null
			entry.field = null
		},

		async loadData() {
			this.virtualcolmodal = true
			this.loading = true

			// closing mid-edit must not leave anything behind
			this.resetForm()

			this.errormsg = null
			this.errored = false
			this.createerror = false
			this.createerrormsg = null
			this.createwithsuccess = false

			await Promise.all([this.getTemplates(), this.getExistingCols(), this.getAccount()])
			this.loading = false
		},

		// one request, the two selects then cascade without further calls
		async getTemplates() {
			try {
				const data = await this.$api.generic.get("templates/", {}, { expand: "sections" })
				this.templates = data
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			}
		},

		async getAccount() {
			try {
				const account = await this.$api.generic.get("myaccount/")
				this.currentuserid = account.id
				this.currentusergroups = account.groups || []
				const results = await Promise.all(
					(account.groups || []).map((id) => this.$api.generic.get(`groups/${id}/`))
				)
				this.groups = results
					.map((group) => ({ value: group.id, text: group.name }))
					.sort((a, b) => a.text.localeCompare(b.text))
			} catch (e) {
				this.groups = []
				this.currentuserid = null
				this.currentusergroups = []
			}
		},

		async getExistingCols() {
			try {
				const data = await this.$api.generic.get(
					"virtual_cols/", {}, { target: this.target }
				)
				this.existingcols = data.map((col) => ({
					...col,
					templates: Object.keys(col.mapping || {}).length,
					rawvisibility: col.visibility,
					// the table shows the label, editColumn reads it back
					visibility: this.visibilityLabel(col.visibility),
				}))
			} catch (e) {
				this.existingcols = []
			}
		},

		// a row keeps its own template, the ones already used are hidden
		templateOptions(entry) {
			return this.templates
				.filter((template) => template.id === entry.template
					|| !this.usedTemplates.includes(template.id))
				.map((template) => ({ value: template.id, text: template.name }))
		},

		sectionOptions(entry) {
			const template = this.templates.find((item) => item.id === entry.template)
			return (template?.sections || []).map((section) => ({
				value: section.id,
				text: section.name,
			}))
		},

		fieldOptions(entry) {
			const template = this.templates.find((item) => item.id === entry.template)
			const section = (template?.sections || []).find((item) => item.id === entry.section)
			return (section?.fields || []).map((field) => ({
				value: field.id,
				text: field.name,
			}))
		},

		async onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true
			this.createerror = false
			this.createerrormsg = null

			const mapping = {}
			this.mappingrows.forEach((entry) => {
				if (entry.template && entry.field) {
					mapping[entry.template] = entry.field
				}
			})

			const payload = {
				name: this.row.name,
				target: this.target,
				visibility: this.row.visibility,
				groups: this.row.visibility === "private_group" ? this.row.groups : [],
				allow_group_modification:
					this.row.visibility === "private_group"
					&& this.row.allow_group_modification,
				mapping: mapping,
			}

			try {
				if (this.editingid) {
					await this.$api.generic.patch(`virtual_cols/${this.editingid}/`, payload)
				} else {
					await this.$api.generic.post("virtual_cols/", payload)
				}

				await this.getExistingCols()
				this.createwithsuccess = true
			} catch (e) {
				this.createerrormsg = this._apiError(e)
				this.createerror = true
			} finally {
				this.loadingcreate = false
			}
		},

		async onDelete(col) {
			try {
				await this.$api.generic.delete(`virtual_cols/${col.id}/`)
				if (this.editingid === col.id) {
					this.resetForm()
				}
				await this.getExistingCols()
				this.$emit("reloadDatatable")
			} catch (e) {
				this.createerrormsg = this._apiError(e)
				this.createerror = true
			}
		},
	},
}
</script>
