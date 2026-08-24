<template>
	<div id="Accountinfo">		
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

			<div v-else>
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
						<b-col
							v-if="massprocessing"
							class="col-1"
						>
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
								v-if="successed || massprocsuccessed"
								:icon="['fas', 'check']"
								color="green"
							/>
							<font-awesome-icon 
								v-if="errored"
								:icon="['fas', 'xmark']"
								color="red"
							/>
						</b-col>
						<b-col align-self="end" />
					</b-row>
				</b-form>
				<p v-else>
					{{ $t('generic.no_data') }}
				</p>
			</div>
		</section>
	</div>
</template>

<script>
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

			canedit: false,

			rowdata: [],
			create: true,
			accountid : null,
			
			loading: true,
			loadingcreate: false,
		}
	},
	watch: {
		successed: function() {
			setTimeout(() => {
				this.successed = false
			}, 500)
		},
		massprocsuccessed: function() {
			setTimeout(() => {
				this.massprocsuccessed = false
				this.$emit('reloadDatatable')
			}, 500)
		}
	},
	async mounted() {
		const rawPermissions = localStorage.getItem('permissions')
		const permissions = rawPermissions ? rawPermissions.split(",") : []

		this.canedit = permissions.includes("accountinfo_add_accountinfovalue")

		await this.getAccountinfoConfig()
	},
	methods: {
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

			if (this.create) {
				try {
					await this.onPost(json)
					this.successed = true
					this.rowdata = []
					await this.getAccountinfoConfig()
				} catch (e) {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				} finally {
					this.loadingcreate = false
				}
			} else {
				try {
					await this.onPatch(this.accountid, json)
					this.successed = true
				} catch (e) {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				} finally {
					this.loadingcreate = false
				}
			}
		},
	}
}
</script>