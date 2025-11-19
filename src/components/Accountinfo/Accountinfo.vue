<template>
	<div id="Accountinfo">		
		<!-- Error box message -->
		<section v-if="errored || massprocerrored">
			<Alert 
				:message="(errored) ? errormsg : massprocerrormsg" 
				variant="danger"
			/>
		</section>

		<!-- Accountinf form -->
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
import axios from 'axios'

export default {
	name: 'Accountinfo',
	props: {
		type: { type: String, default: '' },
		id: { type: Number, default: null },
		canedit: { type: Boolean, default: false },
		slug: { type: String, default: 'inventory_base.inventorybase' },
		massprocessing: { type: Boolean, default: false },
		items: { type: Array, default: () => [] }
	},
	data() {
		return {
			rowdata: [],
			loading: true,
			errormsg: null,
			errored: false,
			massprocerrored: false,
			massprocerrormsg: [],
			massprocsuccessed: false,
			successed: false,
			loadingcreate: false,
			create: true,
			accountid : null,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
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
		await this.getAccountinfoConfig()
	},
	methods: {
		async getAccountinfoConfig() {
			await axios.get(this.$config.BACKEND_API_ROUTE+"accountinfo/config/?expand=accountinfo_values&datatarget="+this.type,
				{ headers: this.header })
				.then(response => {
					for (const rowDetails of response.data) {
						this.rowdata.push({
							id: rowDetails.id,
							name: rowDetails.name,
							type: rowDetails.datatype,
							value: (rowDetails.datatype == "CHECKBOX") ? [] : null,
							values: this.getAccountinfoValue(rowDetails.accountinfo_values)
						})
					}
					this.errormsg = null
					this.errored = false
					if (!this.massprocessing) {
						this.getAccountinfoData()
					} else {
						this.loading = false
					}
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
		},
		getAccountinfoValue(values) {
			var array = []
			values.forEach(value => {
				array.push({
					value: value.id,
					text: value.value
				})
			})

			return array
		},
		async getAccountinfoData() {
			await axios.get(this.$config.BACKEND_API_ROUTE+"accountinfo/data/?object_slug="
			+this.slug+"&object_id="+this.id, { headers: this.header })
				.then(response => {
					response.data.forEach(rowDetails => {
						for (const [key, value] of Object.entries(this.rowdata)) {
							if(rowDetails.accountdata[value.id]) {
								this.rowdata[key].value = rowDetails.accountdata[value.id]
							}
							this.accountid = rowDetails.id
							this.create = false
						}
					})

					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		async onPatch(id, json) {
			await axios.patch(
				this.$config.BACKEND_API_ROUTE+"accountinfo/data/"+id+"/",
				json, 
				{ headers: this.header }
			)
		},
		async onPost(json) {
			await axios.post(
				this.$config.BACKEND_API_ROUTE+"accountinfo/data/", json,
				{ headers: this.header }
			)
		},
		async get(itemid) {
			try {
				const parameter = "object_id="+itemid+"&object_sulg="+this.slug
				const response = await axios.get(
					this.$config.BACKEND_API_ROUTE+"accountinfo/data/?"+parameter,
					{ headers: this.header }
				)

				for (const accountdata of response.data) {
					return accountdata
				}
			} catch (e) {
				this.massprocerrormsg.push({
					itemid: itemid,
					message: (e.response?.data?.error) ? e.response.data.error : e.message
				})
			}
		},
		async onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true

			const json = {
				object_id: null,
				object_slug: this.slug,
				accountdata: {}
			}

			if (this.massprocessing) {
				this.massprocerrored = false
				this.massprocerrormsg = []
				this.massprocsuccessed = false

				var patch = false
				for (const item of this.items) {
					if (item.accountinfo) {
						patch = true
					}

					json.object_id = item.id
					json.accountdata = this.rowdata.reduce((acc, row) => {
						if (row.update) acc[row.id] = row.value
						return acc
					}, {})

					if (patch) {
						var accountdata_item = await this.get(item.id)
						Object.keys(json.accountdata).forEach(key => {
							if (accountdata_item.accountdata[key] !== json.accountdata[key]) {
								accountdata_item.accountdata[key] = json.accountdata[key]
							}
						})
						json.accountdata = accountdata_item.accountdata
						try {
							await this.onPatch(accountdata_item.id, json)
						} catch(e) {
							this.massprocerrormsg.push({
								itemid: item.id,
								message: (e.response?.data?.error) ? e.response.data.error : e.message
							})
						}
					} else {
						try {
							await this.onPost(json)
						} catch(e) {
							this.massprocerrormsg.push({
								itemid: item.id,
								message: (e.response?.data?.error) ? e.response.data.error : e.message
							})
						}
					}
				}

				if (this.massprocerrormsg.length > 0) {
					this.massprocerrormsg = this.massprocerrormsg
						.map(e => `Item ${e.itemid} : ${e.message}`)
						.join('\n')
					this.massprocerrored = true
				}

				if (!this.massprocerrored) {
					this.massprocsuccessed = true
				}

				this.loadingcreate = false
			} else {
				json.object_id = this.id
				json.accountdata = this.rowdata.reduce((acc, row) => {
					acc[row.id] = row.value
					return acc
				}, {})

				if (this.create) {
					try {
						await this.onPost(json)
						this.successed = true
						this.rowdata = []
						this.getAccountinfoConfig()
					} catch(e) {
						this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
						this.errored = true
					} finally {
						this.loadingcreate = false
					}
				} else {
					try {
						await this.onPatch(this.accountid, json)
						this.successed = true
					} catch(e) {
						this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
						this.errored = true
					} finally {
						this.loadingcreate = false
					}
				}
			}
		}
	}
}
</script>