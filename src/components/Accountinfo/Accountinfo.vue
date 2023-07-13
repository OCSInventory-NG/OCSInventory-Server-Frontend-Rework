<template>
	<div id="Accountinfo">
		<!-- Display success box message -->
		<section v-if="successed">
			<Alert 
				:message="$t('success_saved')" 
				variant="success"
			/>
		</section>
		
		<!-- Error box message -->
		<section v-if="errored">
			<Alert 
				:message="errorMsg" 
				variant="danger"
			/>
		</section>

		<!-- Accountinf form -->
		<section v-else>
			<div v-if="loading">
				<Loader />
			</div>

			<div v-else>
				<b-form
					@submit="onSubmit"
				>
					<b-row
						v-for="(value, key) in rowdata"
						:id="value.id"
						:key="key"
					>
						<b-col v-if="value.type=='TEXT'">
							<b-form-group
								:label="value.name" 
								:label-for="'field_'+value.id"
								class="form-label"
							>
								<b-form-input
									:id="'field_'+value.id"
									v-model="value.value"
								/>
							</b-form-group>
						</b-col>

						<b-col v-if="value.type=='TEXTAREA'">
							<b-form-group
								:label="value.name" 
								:label-for="'field_'+value.id"
								class="form-label"
							>
								<b-form-textarea
									:id="'field_'+value.id"
									v-model="value.value"
									rows="3"
									max-rows="6"
								/>
							</b-form-group>
						</b-col>

						<b-col v-if="value.type=='SELECT'">
							<b-form-group
								:label="value.name" 
								:label-for="'field_'+value.id"
								class="form-label"
							>
								<b-form-select
									:id="'field_'+value.id"
									v-model="value.value"
									:options="value.values"
									class="mb-3 form-select"
								/>
							</b-form-group>
						</b-col>

						<b-col v-if="value.type=='CHECKBOX'">
							<b-form-group
								:label="value.name" 
								:label-for="'field_'+value.id"
								class="form-label"
							>
								<b-form-checkbox-group
									:id="'field_'+value.id"
									v-model="value.value"
									:options="value.values"
								/>
							</b-form-group>
						</b-col>
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
								{{ $t('update') }}
							</b-button>
						</b-col>
						<b-col align-self="end" />
					</b-row>
				</b-form>
			</div>
		</section>
	</div>
</template>

<script>
import Axios from 'axios'
import Loader from '@/components/Loader/Loader';
import Alert from '@/components/Alert/Alert.vue';

export default {
	name: 'Accountinfo',
	components: { Loader, Alert },
	props: {
		type: { type: String, default: '' },
		id: { type: Number, default: null },
		canedit: { type: Boolean, default: false },
		slug: { type: String, default: 'base.base' }
	},
	data() {
		return {
			rowdata: [],
			loading: true,
			errorMsg: null,
			succesMsg: null,
			errored: false,
			successed: false,
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
			setTimeout(() => this.successed = false, 10000)
		}
	},
	mounted() {
		this.getAccountinfoConfig()
	},
	methods: {
		getAccountinfoConfig() {
			Axios.get(process.env.VUE_APP_API_ROUTE+"accountinfo/config?datatarget="+this.type, { headers: this.header })
				.then(response => {
					response.data.forEach(rowDetails => {
						this.rowdata.push({
							id: rowDetails.id,
							name: rowDetails.name,
							type: rowDetails.datatype,
							value: (rowDetails.datatype == "CHECKBOX") ? [] : null,
							values: this.getAccountinfoValue(rowDetails.accountinfo_values)
						})
					})
					this.errorMsg = null
					this.errored = false
					this.getAccountinfoData()
				})
				.catch(e => {
					this.errorMsg = e.message
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
		getAccountinfoData() {
			Axios.get(process.env.VUE_APP_API_ROUTE+"accountinfo/data?object_slug="
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

					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		onSubmit(event) {
			event.preventDefault()

			var json = {
				object_id: this.id,
				object_slug: this.slug,
				accountdata: {}
			}

			this.rowdata.forEach(rowDetails => {
				json.accountdata[rowDetails.id] = rowDetails.value
			})

			if(this.create) {
				Axios.post(process.env.VUE_APP_API_ROUTE+"accountinfo/data/", json, { headers: this.header })
					.then(() => {
						this.succesMsg = "success"
						this.successed = true
						this.errorMsg = null
						this.errored = false
					})
					.catch(e => {
						this.errorMsg = e.message
						this.errored = true
						this.succesMsg = null
						this.successed = false
					})
			} else {
				Axios.put(process.env.VUE_APP_API_ROUTE+"accountinfo/data/"+this.accountid+"/", json, { headers: this.header })
					.then(() => {
						this.succesMsg = "success"
						this.successed = true
						this.errorMsg = null
						this.errored = false
					})
					.catch(e => {
						this.errorMsg = e
						this.errored = true
						this.succesMsg = null
						this.successed = false
					})
			}
		}
	}
}
</script>