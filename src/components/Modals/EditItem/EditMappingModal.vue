<template>
	<div id="edit-mapping-modal">
		<button 
			v-b-modal="idmodal"
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
			:title="$t('authentication.editmapping')"
			hide-footer
			modal-class="custom-modal modal-blur"
		>
			<template #modal-header="{ close }">
				<h5 class="modal-title">
					{{ $t('authentication.editmapping') }}
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
			<b-form
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
								:value="index"
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
		</b-modal>
	</div>
</template>

<script>
import Axios from 'axios'

export default {
	name: 'EditMappingModal',
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
			errorMsg: null,
			succesMsg: null,
			errored: false,
			successed: false,
			idmodal: 'edit-mapping.'+this.id,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	methods: {
		loadData(id) {
			this.getMappingConfig(id)
		},
		getMappingConfig(id) {
			Axios.get(import.meta.env.VITE_APP_API_ROUTE+"auth_mapping?auth_config="+id, { headers: this.header })
				.then(response => {
					this.mapping = response.data

					if(this.mapping.length) {
						this.mapping.forEach(map => {
							if(map.internal_field in this.rows) {
								this.rows[map.internal_field] = map.external_field
							}
						})
					}

					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		// Submit edit mapping config and call refresh datatable to reload
		onSubmit(event) {
			event.preventDefault()

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
					Axios.patch(import.meta.env.VITE_APP_API_ROUTE+"auth_mapping/"+data.id+"/", data, { headers: this.header })
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
				})
			}

			if(jsonToAdd.length) {
				Axios.post(import.meta.env.VITE_APP_API_ROUTE+"auth_mapping/", jsonToAdd, { headers: this.header })
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
			}

			if(jsonToDelete.length) {
				jsonToDelete.forEach(data => {
					Axios.delete(import.meta.env.VITE_APP_API_ROUTE+"auth_mapping/"+data.id+"/", { headers: this.header })
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
				})
			}

			this.$bvModal.hide('edit-mapping.'+this.id)
			this.$emit('reloadDatatable')
		}
	}
}
</script>
