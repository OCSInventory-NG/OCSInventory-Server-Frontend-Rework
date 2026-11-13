<template>
	<div
		id="Accountinfo"
		:class="{ 'detail-section accountinfo-section': !massprocessing }"
	>
		<div
			v-if="!massprocessing"
			class="detail-section-header"
		>
			<h2 class="detail-section-title">
				{{ $t('title.accountinfo') }}
			</h2>
			<button
				v-if="canedit && !loading && !editing && rowdata.length != 0"
				type="button"
				class="btn"
				@click="startEdit"
			>
				<font-awesome-icon :icon="['fas', 'pencil']" />
				{{ $t('accountinfo.edit') }}
			</button>
			<span
				v-if="editing"
				class="accountinfo-edit-badge"
			>
				{{ $t('accountinfo.edit_mode') }}
			</span>
		</div>

		<section v-if="errored || massprocerrored">
			<Alert 
				:message="(errored) ? errormsg : massprocerrormsg" 
				variant="danger"
			/>
		</section>

		<section v-else>
			<div 
				v-if="loading"
				class="ocs-loader"
			>
				<Loader />
			</div>

			<div v-else-if="massprocessing">
				<b-form
					v-if="rowdata.length != 0"
					@submit="onSubmit"
				>
					<b-row
						v-for="(value, key) in rowdata"
						:id="value.id"
						:key="key"
						align-v="start"
						class="col admin-row"
					>
						<b-col class="col-1" />
						<label 
							:for="'field_'+value.id"
							class="col-form-label col-lg-2 me-sm-2"
						>
							{{ value.name }}
						</label>
						<b-col
							v-if="value.type=='TEXT'"
							class="col"
						>
							<b-form-input
								:id="'field_'+value.id"
								v-model="value.value"
								:disabled="!canedit"
								class="mb-2 me-sm-2 mb-sm-0"
							/>
						</b-col>

						<b-col v-if="value.type=='TEXTAREA'">
							<b-form-textarea
								:id="'field_'+value.id"
								v-model="value.value"
								rows="3"
								max-rows="6"
							/>
						</b-col>

						<b-col v-if="value.type=='SELECT'">
							<v-select
								v-model="value.value"
								:options="value.values"
								:disabled="!canedit"
								label="text"
							/>
						</b-col>

						<b-col 
							v-if="value.type=='CHECKBOX'"
							class="admin-checkbox"
						>
							<b-form-checkbox-group
								:id="'field_'+value.id"
								v-model="value.value"
								:options="value.values"
								:disabled="!canedit"
							/>
						</b-col>
						<b-col class="col-1">
							<label class="form-check form-switch">
								<input 
									v-model="value.update"
									class="form-check-input"
									type="checkbox"
								>
							</label>
						</b-col>
						<b-col class="col-2" />
					</b-row>
					<b-row>
						<b-col align-self="start" />
						<b-col 
							align-self="center"
							align="center"
							cols="2"
						>
							<b-button 
								type="submit"
								variant="success"
								:disabled="!canedit"
							>
								{{ $t('generic.update') }}
							</b-button>
						</b-col>
						<b-col
							cols="1"
							align-self="center"
							class="admin-btn"
						>
							<b-spinner 
								v-if="loadingcreate"
								variant="success"
							/>
							<font-awesome-icon 
								v-if="massprocsuccessed"
								:icon="['fas', 'check']"
								color="green"
							/>
						</b-col>
						<b-col align-self="end" />
					</b-row>
				</b-form>
				<p v-else>
					{{ $t('generic.no_data') }}
				</p>
			</div>

			<div v-else>
				<div
					v-if="successed"
					role="status"
					class="alert alert-success"
				>
					<font-awesome-icon :icon="['fas', 'circle-check']" />
					{{ $t('accountinfo.saved') }}
				</div>

				<p
					v-if="rowdata.length == 0"
					class="text-secondary mb-0"
				>
					{{ $t('generic.no_data') }}
				</p>

				<dl
					v-else-if="!editing"
					class="datagrid accountinfo-grid"
				>
					<div
						v-for="field in rowdata"
						:key="field.id"
						class="datagrid-item"
						:class="{ 'accountinfo-item-wide': field.type == 'TEXTAREA' }"
					>
						<dt class="datagrid-title">
							{{ field.name }}
						</dt>
						<dd class="datagrid-content accountinfo-value">
							<span
								v-if="isEmpty(field.value)"
								class="accountinfo-empty"
							>
								{{ $t('accountinfo.not_set') }}
							</span>
							<span
								v-else-if="field.type == 'SELECT'"
								class="accountinfo-badge"
							>
								{{ selectLabel(field) }}
							</span>
							<template v-else-if="field.type == 'CHECKBOX'">
								<span
									v-for="label in checkboxLabels(field)"
									:key="label"
									class="accountinfo-badge"
								>
									<font-awesome-icon :icon="['fas', 'check']" />
									{{ label }}
								</span>
							</template>
							<span
								v-else
								class="accountinfo-text"
								:class="{ 'accountinfo-text-multiline': field.type == 'TEXTAREA' }"
							>
								{{ field.value }}
							</span>
						</dd>
					</div>
				</dl>

				<b-form
					v-else
					@submit="onSubmit"
				>
					<div class="datagrid accountinfo-grid">
						<div
							v-for="field in rowdata"
							:key="field.id"
							class="datagrid-item"
							:class="{
								'accountinfo-item-wide': field.type == 'TEXTAREA',
								'accountinfo-item-dirty': isDirty(field)
							}"
						>
							<label
								:for="'field_'+field.id"
								class="datagrid-title accountinfo-label"
							>
								{{ field.name }}
								<span
									v-if="isDirty(field)"
									class="accountinfo-dirty"
								>
									{{ $t('accountinfo.modified') }}
								</span>
							</label>

							<b-form-input
								v-if="field.type == 'TEXT'"
								:id="'field_'+field.id"
								v-model="field.value"
							/>

							<b-form-textarea
								v-if="field.type == 'TEXTAREA'"
								:id="'field_'+field.id"
								v-model="field.value"
								rows="3"
								max-rows="6"
							/>

							<v-select
								v-if="field.type == 'SELECT'"
								v-model="field.value"
								:input-id="'field_'+field.id"
								:options="field.values"
								label="text"
							/>

							<b-form-checkbox-group
								v-if="field.type == 'CHECKBOX'"
								:id="'field_'+field.id"
								v-model="field.value"
								:options="field.values"
								class="accountinfo-checks"
							/>
						</div>
					</div>

					<Alert
						v-if="saveerrormsg"
						:message="saveerrormsg"
						variant="danger"
						class="mt-3"
					/>

					<div class="accountinfo-footer">
						<b-button
							variant="outline-secondary"
							:disabled="loadingcreate"
							@click="cancelEdit"
						>
							{{ $t('generic.cancel') }}
						</b-button>
						<b-button
							type="submit"
							class="accountinfo-btn-primary"
							:disabled="!hasChanges || loadingcreate"
						>
							<b-spinner
								v-if="loadingcreate"
								small
							/>
							{{ $t('generic.save') }}
						</b-button>
					</div>
				</b-form>
			</div>
		</section>
	</div>
</template>

<script>
import { hasPermission } from "@/utils/permissions"

export default {
	name: 'Accountinfo',
	props: {
		type: { type: String, default: '' },
		id: { type: Number, default: null },
		slug: { type: String, default: 'inventory_base.inventorybase' },
		massprocessing: { type: Boolean, default: false },
		items: { type: Array, default: () => [] }
	},
	emits: ['reloadDatatable'],
	data() {
		return {
			errormsg: null,
			errored: false,
			massprocerrored: false,
			massprocerrormsg: [],

			massprocsuccessed: false,
			successed: false,
			saveerrormsg: null,

			canedit: false,
			editing: false,

			rowdata: [],
			original: {},
			create: true,
			accountid : null,

			loading: true,
			loadingcreate: false,
		}
	},
	computed: {
		hasChanges() {
			return this.rowdata.some((field) => this.isDirty(field))
		},
	},
	watch: {
		successed: function(value) {
			if (!value) return
			clearTimeout(this.successTimeout)
			this.successTimeout = setTimeout(() => {
				this.successed = false
			}, 3000)
		},
		massprocsuccessed: function() {
			setTimeout(() => {
				this.massprocsuccessed = false
				this.$emit('reloadDatatable')
			}, 500)
		}
	},
	async mounted() {
		this.canedit = hasPermission("accountinfo_add_accountinfovalue")

		await this.getAccountinfoConfig()
	},
	beforeUnmount() {
		clearTimeout(this.successTimeout)
	},
	methods: {
		isEmpty(value) {
			return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)
		},

		normalize(value) {
			if (this.isEmpty(value)) return 'null'
			if (Array.isArray(value)) return JSON.stringify([...value].sort())
			return JSON.stringify(value)
		},

		isDirty(field) {
			return this.normalize(field.value) !== this.original[field.id]
		},

		snapshot() {
			this.original = Object.fromEntries(
				this.rowdata.map((field) => [field.id, this.normalize(field.value)])
			)
		},

		selectLabel(field) {
			if (typeof field.value === 'object') return field.value.text
			const option = field.values.find((v) => v.value == field.value)
			return option ? option.text : field.value
		},

		checkboxLabels(field) {
			return field.values
				.filter((v) => field.value.some((s) => s == v.value))
				.map((v) => v.text)
		},

		startEdit() {
			this.successed = false
			this.saveerrormsg = null
			this.editing = true
		},

		cancelEdit() {
			for (const field of this.rowdata) {
				const value = JSON.parse(this.original[field.id])
				field.value = (value === null && field.type === 'CHECKBOX') ? [] : value
			}
			this.saveerrormsg = null
			this.editing = false
		},

		async getAccountinfoConfig() {
			try {
				const data = await this.$api.generic.get(
					"accountinfo/config/",
					{},
					{ expand: "accountinfo_values", datatarget: this.type }
				)

				const rows = Array.isArray(data) ? data : (data?.results || [])

				for (const r of rows) {
					this.rowdata.push({
						id: r.id,
						name: r.name,
						type: r.datatype,
						value: (r.datatype === "CHECKBOX") ? [] : null,
						values: this.getAccountinfoValue(r.accountinfo_values),
					})
				}

				this.errormsg = null
				this.errored = false

				if (!this.massprocessing) {
					await this.getAccountinfoData()
				} else {
					this.loading = false
				}
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			}
		},

		getAccountinfoValue(values) {
			return (values || []).map((v) => ({
				value: v.id,
				text: v.value,
			}))
		},

		async getAccountinfoData() {
			try {
				const data = await this.$api.generic.get(
					"accountinfo/data/",
					{},
					{ object_slug: this.slug, object_id: this.id }
				)

				const rows = Array.isArray(data) ? data : (data?.results || [])

				for (const rowDetails of rows) {
					for (const [idx, row] of Object.entries(this.rowdata)) {
						if (rowDetails?.accountdata?.[row.id] !== undefined) {
							this.rowdata[idx].value = rowDetails.accountdata[row.id]
						}
					}
					this.accountid = rowDetails.id
					this.create = false
				}

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			} finally {
				this.snapshot()
				this.loading = false
			}
		},

		async onPatch(id, json) {
			return this.$api.generic.patch(`accountinfo/data/${id}/`, json)
		},

		async onPost(json) {
			return this.$api.generic.post("accountinfo/data/", json)
		},

		async get(itemid) {
			try {
				const data = await this.$api.generic.get(
					"accountinfo/data/",
					{},
					{ object_id: itemid, object_slug: this.slug }
				)

				const rows = Array.isArray(data) ? data : (data?.results || [])
				return rows[0] || null
			} catch (e) {
				this.massprocerrormsg.push({
					itemid,
					message: (e.response?.data?.error) ? e.response.data.error : e.message,
				})
				return undefined
			}
		},

		buildAccountdataPayload({ onlyUpdated = false } = {}) {
			return this.rowdata.reduce((acc, row) => {
				if (!onlyUpdated || row.update) {
					acc[row.id] = row.value
				}
				return acc
			}, {})
		},

		async onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true

			const json = {
				object_id: null,
				object_slug: this.slug,
				accountdata: {},
			}

			if (this.massprocessing) {
				this.massprocerrored = false
				this.massprocerrormsg = []
				this.massprocsuccessed = false

				for (const item of this.items) {
					json.object_id = item.id
					json.accountdata = this.buildAccountdataPayload({ onlyUpdated: true })

					const accountdata_item = await this.get(item.id)
					if (accountdata_item === undefined) continue

					try {
						if (accountdata_item) {
							for (const key of Object.keys(json.accountdata)) {
								accountdata_item.accountdata[key] = json.accountdata[key]
							}

							json.accountdata = accountdata_item.accountdata

							await this.onPatch(accountdata_item.id, json)
						} else {
							await this.onPost(json)
						}
					} catch (e) {
						this.massprocerrormsg.push({
							itemid: item.id,
							message: (e.response?.data?.error) ? e.response.data.error : e.message,
						})
					}
				}

				if (this.massprocerrormsg.length > 0) {
					this.massprocerrormsg = this.massprocerrormsg
						.map((e) => `Item ${e.itemid} : ${e.message}`)
						.join('\n')
					this.massprocerrored = true
				}

				if (!this.massprocerrored) {
					this.massprocsuccessed = true
				}

				this.loadingcreate = false
				return
			}

			json.object_id = this.id
			json.accountdata = this.buildAccountdataPayload()
			this.saveerrormsg = null

			try {
				if (this.create) {
					await this.onPost(json)
					this.rowdata = []
					await this.getAccountinfoConfig()
				} else {
					await this.onPatch(this.accountid, json)
					this.snapshot()
				}
				this.editing = false
				this.successed = true
			} catch (e) {
				this.saveerrormsg = (e.response?.data?.error) ? e.response.data.error : e.message
			} finally {
				this.loadingcreate = false
			}
		},
	}
}
</script>