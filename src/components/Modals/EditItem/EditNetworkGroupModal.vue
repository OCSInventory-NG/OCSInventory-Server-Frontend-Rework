<template>
	<div id="edit-netgroup-modal">
		<button 
			:title="$t('network.editnetgroup')"
			class="btn btn-ghost-dark"
			@click="loadData(id)"
		>
			<font-awesome-icon 
				:icon="['fas', 'pencil']"
			/>
		</button>

		<b-modal 
			:id="idModal" 
			v-model="editnetgroup"
			:title="$t('network.editnetgroup')"
			hide-footer
			modal-class="custom-modal modal-blur"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('network.editnetgroup') }}
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
			<b-form
				v-if="!loading"
				@submit="onSubmit"
			>
				<Alert 
					v-if="createerror"
					:message="createerrormsg" 
					variant="danger"
				/>
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
							>
								{{ row.name }}
							</b-form-input>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('generic.description')" 
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
							:label="$t('title.network')" 
							label-for="network"
						>
							<v-select
								id="network"
								v-model="netid"
								:options="networks"
								:reduce="text => text.value"
								label="text"
								class="mb-3"
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
			errored: false,
			loading: true,
			loadingcreate: false,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,
			editnetgroup: false,
			idModal: 'edit-netgroup'+this.id,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.editnetgroup = false
				this.createwithsuccess = false
				this.$emit('reloadDatatable')
			}, 500)
		}
	},
	methods: {
		loadData(id) {
			this.loading = true
			this.editnetgroup = true
			this.getNetgroup(id)
		},
		getNetgroup(id) {
			Axios.get(import.meta.env.VITE_APP_API_ROUTE+"netgroups/"+id+"/", { headers: this.header })
				.then(response => {
					this.row = response.data
					this.errorMsg = null
					this.errored = false
					this.getNetworks()
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
				})
		},
		getNetworks() {
			Axios.get(import.meta.env.VITE_APP_API_ROUTE+"networks/", { headers: this.header })
				.then(response => {
					this.networks = []
					response.data.forEach(network => {
						this.networks.push({
							value: network.id,
							text: network.netid
						})
					});
					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		updateNetworks() {
			this.netid.forEach(element => {
				var json = {
					group: this.row.id
				}

				Axios.patch(import.meta.env.VITE_APP_API_ROUTE+"networks/"+element+"/", json, { headers: this.header })
					.then(() => {
						this.errorMsg = null
						this.errored = false
					})
					.catch(e => {
						this.errorMsg = e.message
						this.errored = true
					})
			});
		},
		onSubmit(event) {
			event.preventDefault()

			if(this.netid.length > 0) {
				this.updateNetworks()
			}

			Axios.patch(import.meta.env.VITE_APP_API_ROUTE+"netgroups/"+this.row.id+"/", this.row, { headers: this.header })
				.then(() => {
					this.createwithsuccess = true
					this.createerrormsg = null
					this.createerror = false
				})
				.catch(e => {
					this.createerrormsg = e.message
					this.createerror = true
					this.createwithsuccess = false
				})
				.finally(() => this.loadingcreate = false)
		}
	}
}
</script>