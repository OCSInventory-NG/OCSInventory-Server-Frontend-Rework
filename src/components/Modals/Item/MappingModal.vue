<template>
	<div id="mapping-modal">
		<button 
			:title="$t('authentication.editmapping')"
			class="btn btn-ghost-warning"
			@click="loadData(id)"
		>
			<font-awesome-icon 
				:icon="['fas', 'gear']"
			/>
		</button>

		<b-modal 
			:id="idmodal"
			v-model="mappingmodal"
			:title="$t('authentication.editmapping')"
			hide-footer
			modal-class="custom-modal modal-blur"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('authentication.editmapping') }}
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
				v-if="createerror"
				:message="createerrormsg" 
				variant="danger"
			/>
			<b-form
				v-if="!loading"
				@submit="onSubmit"
			>
				<b-row
					v-for="(row, index) in rows"
					:key="index"
				>
					<b-col>
						<b-form-group
							:label="$t('user.'+index)" 
							:label-for="index"
						>
							<b-form-input
								:id="index"
								v-model="rows[index]"
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
							{{ $t('generic.save') }}
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
import axios from 'axios'

export default {
	name: 'MappingModal',
	props: {
		id: { type: Number, default: null }
	},
	data() {
		return {
			rows: {
				username: null,
				last_name: null,
				first_name: null,
				email: null
			},
			mapping: [],
			loading: true,
			errormsg: null,
			errored: false,
			loadingcreate: false,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,
			mappingmodal: false,
			idmodal: 'edit-mapping.'+this.id,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.mappingmodal = false
				this.createwithsuccess = false
				this.rows = {
					username: null,
					last_name: null,
					first_name: null,
					email: null
				}
				this.$emit('reloadDatatable')
			}, 500)
		}
	},
	methods: {
		loadData(id) {
			this.loading = true
			this.mappingmodal = true
			this.rows = {
				username: null,
				last_name: null,
				first_name: null,
				email: null
			}
			this.getMappingConfig(id)
		},
		async getMappingConfig(id) {
			await axios.get(this.$config.BACKEND_API_ROUTE+"auth_mapping/?auth_config="+id, { headers: this.header })
				.then(response => {
					this.mapping = response.data

					if(this.mapping.length) {
						this.mapping.forEach(map => {
							if(map.internal_field in this.rows) {
								this.rows[map.internal_field] = map.external_field
							}
						})
					}

					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true

			var jsonToUpdate = []
			var jsonToAdd = []
			var jsonToDelete = []

			if(this.mapping.length) {
				this.mapping.forEach(map => {
					if(map.internal_field in this.rows) {
						if(this.rows[map.internal_field] != "") {
							jsonToUpdate.push({
								id: map.id,
								auth_config: this.id,
								internal_field: map.internal_field,
								external_field: this.rows[map.internal_field]
							})
						} else {
							jsonToDelete.push({
								id: map.id
							})
						}
					} else {
						if(this.rows[map.internal_field] != "") {
							jsonToAdd.push({
								auth_config: this.id,
								internal_field: map.internal_field,
								external_field: this.rows[map.internal_field]
							})
						}
					}
				})
			} else {
				Object.keys(this.rows).forEach(row => {
					if(this.rows[row] != "") {
						jsonToAdd.push({
							auth_config: this.id,
							internal_field: row,
							external_field: this.rows[row]
						})
					}
				})
			}

			if(jsonToUpdate.length) {
				jsonToUpdate.forEach(data => {
					axios.patch(this.$config.BACKEND_API_ROUTE+"auth_mapping/"+data.id+"/", data, { headers: this.header })
						.then(() => {
							this.createwithsuccess = true
							this.createerrormsg = null
							this.createerror = false
						})
						.catch(e => {
							this.createerrormsg = (e.response?.data?.error) ? e.response.data.error : e.message
							this.createerror = true
							this.createwithsuccess = false
						})
						.finally(() => this.loadingcreate = false)
				})
			}

			if(jsonToAdd.length) {
				axios.post(this.$config.BACKEND_API_ROUTE+"auth_mapping/", jsonToAdd, { headers: this.header })
					.then(() => {
						this.createwithsuccess = true
						this.createerrormsg = null
						this.createerror = false
					})
					.catch(e => {
						this.createerrormsg = (e.response?.data?.error) ? e.response.data.error : e.message
						this.createerror = true
						this.createwithsuccess = false
					})
					.finally(() => this.loadingcreate = false)
			}

			if(jsonToDelete.length) {
				jsonToDelete.forEach(data => {
					axios.delete(this.$config.BACKEND_API_ROUTE+"auth_mapping/"+data.id+"/", { headers: this.header })
						.then(() => {
							this.createwithsuccess = true
							this.createerrormsg = null
							this.createerror = false
						})
						.catch(e => {
							this.createerrormsg = (e.response?.data?.error) ? e.response.data.error : e.message
							this.createerror = true
							this.createwithsuccess = false
						})
						.finally(() => this.loadingcreate = false)
				})
			}
		}
	}
}
</script>
