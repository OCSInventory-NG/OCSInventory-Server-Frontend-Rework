<template>
	<div id="edit-netgroup-modal">
		<button 
			:title="$t('editnetgroup')"
			class="btn btn-ghost-dark"
			@click="loadData(id)"
		>
			<font-awesome-icon 
				:icon="['fas', 'pencil']"
			/>
		</button>

		<b-modal 
			:id="idModal" 
			:title="$t('editnetgroup')"
			hide-footer
			modal-class="custom-modal modal-blur"
		>
			<template #modal-header="{ close }">
				<h5 class="modal-title">
					{{ $t('editnetgroup') }}
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
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('name')" 
							label-for="name"
						>
							<b-form-input
								id="name"
								v-model="row.name"
								required
							>
								{{ row.name }}
							</b-form-input>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('description')" 
							label-for="description"
						>
							<b-form-input
								id="description"
								v-model="row.description"
								required
							>
								{{ row.description }}
							</b-form-input>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('network')" 
							label-for="network"
						>
							<b-form-select
								id="network"
								v-model="netid" 
								:options="networks" 
								class="mb-3 form-select"
								multiple
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
							{{ $t('save') }}
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
	name: "EditNetworkGroupModal",
	props: {
		id: { type: Number, default: null }
	},
	data() {
		return {
			row: {
				name: null,
				description: null,
			},
			netid: [],
			networks: [],
			errorMsg: null,
			succesMsg: null,
			errored: false,
			successed: false,
			idModal: 'edit-netgroup'+this.id,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	methods: {
		loadData(id) {
			this.getNetgroup(id)
		},
		getNetgroup(id) {
			Axios.get(process.env.VUE_APP_API_ROUTE+"netgroups/"+id+"/", { headers: this.header })
				.then(response => {
					this.row = response.data
					this.errorMsg = null
					this.errored = false
					this.getNetworks(id)
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
				})
		},
		getNetworks(id) {
			Axios.get(process.env.VUE_APP_API_ROUTE+"networks/", { headers: this.header })
				.then(response => {
					response.data.forEach(network => {
						this.networks.push({
							value: network.id,
							text: network.netid
						})
					});
					this.errorMsg = null
					this.errored = false
					this.$bvModal.show('edit-netgroup'+id)
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
				})
		},
		updateNetworks() {
			this.netid.forEach(element => {
				var json = {
					group: this.row.id
				}

				Axios.put(process.env.VUE_APP_API_ROUTE+"networks/"+element+"/", json, { headers: this.header })
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
			});
		},
		onSubmit(event) {
			event.preventDefault()

			if(this.netid.length > 0) {
				this.updateNetworks()
			}

			Axios.put(process.env.VUE_APP_API_ROUTE+"netgroups/"+this.row.id+"/", this.row, { headers: this.header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errorMsg = null
					this.errored = false
					this.$bvModal.hide('edit-netgroup'+this.row.id)
					this.$emit('reloadDatatable')
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
					this.succesMsg = null
					this.successed = false
					this.$bvModal.hide('edit-netgroup'+this.row.id)
				})
		}
	}
}
</script>