<template>
	<div id="network-modal">
		<button 
			:title="$t('network.editnetwork')"
			class="btn btn-ghost-dark"
			@click="loadData(id)"
		>
			<font-awesome-icon 
				:icon="['fas', 'pencil']"
			/>
		</button>

		<b-modal 
			:id="idmodal"
			v-model="networkmodal"
			:title="$t('network.editnetwork')"
			hide-footer
			modal-class="custom-modal modal-blur"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ row.netid }} - {{ row.mask }}
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
							/>
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
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('title.netgroup')" 
							label-for="netgroup"
						>
							<v-select
								id="netgroup"
								v-model="row.group" 
								:options="netgroup" 
								:reduce="text => text.value"
								:clearable="false"
								label="text"
								class="mb-3"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-form-input
						id="netid"
						v-model="row.netid"
						hidden
					/>
					<b-form-input
						id="mask"
						v-model="row.mask"
						hidden
					/>
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
	name: 'NetworkModal',
	props: {
		id: { type: Number, default: null }
	},
	data() {
		return {
			row: {
				name: null,
				description: null,
				netid: null,
				mask: null,
				group: null
			},
			netgroup: [],
			errormsg: null,
			errored: false,
			loading: true,
			loadingcreate: false,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,
			networkmodal: false,
			idmodal: 'edit-network'+this.id,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.networkmodal = false
				this.createwithsuccess = false
				this.row = {
					name: null,
					description: null,
					netid: null,
					mask: null,
					group: null
				}
				this.$emit('reloadDatatable')
			}, 500)
		}
	},
	methods: {
		loadData(id) {
			this.loading = true
			this.networkmodal = true
			this.row = {
				name: null,
				description: null,
				netid: null,
				mask: null,
				group: null
			}
			this.netgroup = []
			this.getNetworks(id)
		},
		async getNetworks(id) {
			await axios.get(this.$config.BACKEND_API_ROUTE+"networks/"+id+"/", { headers: this.header })
				.then(response => {
					this.row = response.data
					this.errormsg = null
					this.errored = false
					this.getNetGroup()
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
		},
		async getNetGroup() {
			await axios.get(this.$config.BACKEND_API_ROUTE+"netgroups/", { headers: this.header })
				.then(response => {
					this.netgroup.push({
						value: null,
						text: this.$t("network.unknown_network")
					})
					response.data.forEach(element => {
						this.netgroup.push({
							value: element.id,
							text: element.name
						})
					});
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
			
			axios.patch(this.$config.BACKEND_API_ROUTE+"networks/"+this.row.id+"/", this.row, { headers: this.header })
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
		},
	}
}
</script>
