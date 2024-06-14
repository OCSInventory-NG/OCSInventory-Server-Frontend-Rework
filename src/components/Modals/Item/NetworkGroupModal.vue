<template>
	<div id="network-group-modal">
		<div 
			v-if="!update"
			class="page-header d-print-none"
		>
			<div class="row">
				<div class="col-auto ms-auto">
					<b-button
						:title="$t('network.addnetgroup')"
						variant="primary"
						class="d-sm-inline-block btn-modal"
						@click="netgroupmodal = !netgroupmodal"
					>
						<font-awesome-icon 
							:icon="['fas', 'plus']"
						/>
						{{ $t('network.addnetgroup') }}
					</b-button>
				</div>
			</div>
		</div>
		<div v-else>
			<button 
				:title="$t('network.editnetgroup')"
				class="btn btn-ghost-dark"
				@click="loadData(id)"
			>
				<font-awesome-icon 
					:icon="['fas', 'pencil']"
				/>
			</button>
		</div>
		<b-modal 
			id="netgroupmodal" 
			v-model="netgroupmodal"
			:title="(!update) ? $t('network.addnetgroup') : $t('network.editnetgroup')"
			hide-footer
			modal-class="custom-modal modal-blur"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ (!update) ? $t('network.addnetgroup') : $t('network.editnetgroup') }}
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
				v-if="createerror || errored"
				:message="(createerror) ? createerrormsg : errormsg" 
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
								required
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row v-if="update">
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
							{{ (!update) ? $t('generic.add') : $t('generic.save') }}
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
	name: "NetworkGroupModal",
	props: {
		update: { type: Boolean, default: false },
		id: { type: Number, default: null }
	},
	data() {
		return {
			row: {
				name: null,
				description: null
			},
			errormsg: null,
			errored: false,
			loading: true,
			loadingcreate: false,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,
			netgroupmodal: false,
			networks: [],
			netid: [],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.netgroupmodal = false
				this.createwithsuccess = false
				this.$emit("reloadDatatable")
			}, 500)
		}
	},
	mounted() {
		if(!this.update) {
			this.loading = false
		}
	},
	methods: {
		loadData(id) {
			this.loading = true
			this.netgroupmodal = true
			this.getNetgroup(id)
		},
		getNetgroup(id) {
			axios.get(this.$config.BACKEND_API_ROUTE+"netgroups/"+id+"/", { headers: this.header })
				.then(response => {
					this.row = response.data
					this.errormsg = null
					this.errored = false
					this.getNetworks()
				})
				.catch(e => {
					this.errormsg = e
					this.errored = true
				})
		},
		getNetworks() {
			axios.get(this.$config.BACKEND_API_ROUTE+"networks/", { headers: this.header })
				.then(response => {
					this.networks = []
					response.data.forEach(network => {
						this.networks.push({
							value: network.id,
							text: network.netid
						})
					});
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = e
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		updateNetworks() {
			this.netid.forEach(element => {
				var json = {
					group: this.row.id
				}

				axios.patch(this.$config.BACKEND_API_ROUTE+"networks/"+element+"/", json, { headers: this.header })
					.then(() => {
						this.errormsg = null
						this.errored = false
					})
					.catch(e => {
						this.errormsg = e.message
						this.errored = true
					})
			});
		},
		onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true

			if(!this.update) {
				axios.post(this.$config.BACKEND_API_ROUTE+"netgroups/", this.row, { headers: this.header })
					.then(() => {
						this.createwithsuccess = true
						this.createerror = false
						this.createerrormsg = null
					})
					.catch(e => {
						this.createwithsuccess = false
						this.createerror = true
						this.createerrormsg = e.message
					})
					.finally(() => this.loadingcreate = false)
			} else {
				if(this.netid.length > 0) {
					this.updateNetworks()
				}

				axios.patch(this.$config.BACKEND_API_ROUTE+"netgroups/"+this.row.id+"/", this.row, { headers: this.header })
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
}
</script>