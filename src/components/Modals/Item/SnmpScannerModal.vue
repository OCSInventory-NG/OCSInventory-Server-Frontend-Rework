<template>
	<div id="snmp-scanner-modal">
		<div 
			v-if="!update"
			class="page-header d-print-none"
		>
			<div class="row">
				<div class="col-auto ms-auto">
					<b-button
						:title="$t('network.addsnmpscanner')"
						variant="primary"
						class="d-sm-inline-block btn-modal"
						@click="loadData()"
					>
						<font-awesome-icon 
							:icon="['fas', 'plus']"
						/>
						{{ $t('network.addsnmpscanner') }}
					</b-button>
				</div>
			</div>
		</div>
		<div v-else>
			<button 
				:title="$t('network.editsnmpscanner')"
				class="btn btn-ghost-dark"
				@click="loadData(id)"
			>
				<font-awesome-icon 
					:icon="['fas', 'pencil']"
				/>
			</button>
		</div>
		<b-modal 
			v-model="snmpscannermodal"
			:title="(!update) ? $t('network.addsnmpscanner') : $t('network.editsnmpscanner')"
			hide-footer
			modal-class="custom-modal modal-blur"
			scrollable
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ (!update) ? $t('network.addsnmpscanner') : $t('network.editsnmpscanner') }}
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
							:label="$t('network.identifier')" 
							label-for="identifier"
						>
							<b-form-input
								id="identifier"
								v-model="row.identifier"
								required
								:disabled="(!update) ? false : true"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('network.ip')" 
							label-for="ip"
						>
							<b-form-input
								id="ip"
								v-model="row.ip"
								required
								:disabled="(!update) ? false : true"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('network.subnets')" 
							label-for="subnetstoscan"
						>
							<b-form-textarea
								id="subnetstoscan"
								v-model="row.subnets"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('network.notes')" 
							label-for="notes"
						>
							<b-form-input
								id="notes"
								v-model="row.notes"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('network.snmpcommunity')" 
							label-for="configs"
						>
							<v-select
								id="configs"
								v-model="row.configs"
								:options="configs"
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
	name: "SnmpScannerModal",
	props: {
		update: { type: Boolean, default: false },
		id: { type: String, default: null }
	},
	data() {
		return {
			row: {
				identifier: null,
				ip: null,
				subnets: null,
				notes: null,
				configs: []
			},
			errormsg: null,
			errored: false,
			successmsg: null,
			successed: false,
			loading: true,
			loadingcreate: false,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,
			snmpscannermodal: false,
			configs: [],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.snmpscannermodal = false
				this.createwithsuccess = false
				this.row = {
					identifier: null,
					ip: null,
					subnets: null,
					notes: null,
					configs: []
				}
				this.$emit("reloadDatatable")
			}, 500)
		}
	},
	async mounted() {
		await this.getCommunities()
	},
	methods: {
		async loadData(id) {
			this.snmpscannermodal = true
			this.row = {
				identifier: null,
				ip: null,
				subnets: null,
				notes: null,
				configs: []
			}

			if (id) {
				this.loading = true
				
				await this.getSnmpScanner(id)
			}
		},
		async getSnmpScanner(id) {
			this.row = []
			await axios.get(this.$config.BACKEND_API_ROUTE+"snmp/scanner/"+id+"/?expand=configs",
				{ headers: this.header })
				.then(response => {
					this.row = response.data
					this.row.subnets = this.row.subnets.join(",")
					var configs = this.row.configs
					this.row.configs = []
					for (const config of configs) {
						this.row.configs.push(config.id)
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
		async getCommunities() {
			await axios.get(this.$config.BACKEND_API_ROUTE+"snmp/config/", { headers: this.header })
				.then(response => {
					this.configs = []
					for (const config of response.data) {
						this.configs.push({
							value: config.id,
							text: config.name
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
			this.createerror = false
			this.createerrormsg = null
			this.loadingcreate = true

			if(!Array.isArray(this.row.subnets)) {
				if(
					this.row.subnets != null
					&& this.row.subnets.trim() != ""
				) {
					this.row.subnets = this.row.subnets.replace(/[^0-9./`,]+/g, "").split(",")
				} else {
					this.row.subnets = []
				}
			}

			if(!this.update) {
				axios.post(this.$config.BACKEND_API_ROUTE+"snmp/scanner/", this.row,
					{ headers: this.header })
					.then(() => {
						this.createwithsuccess = true
						this.createerror = false
						this.createerrormsg = null
					})
					.catch(e => {
						this.createwithsuccess = false
						this.createerror = true
						this.createerrormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					})
					.finally(() => this.loadingcreate = false)
			} else {
				axios.patch(this.$config.BACKEND_API_ROUTE+"snmp/scanner/"+this.id+"/", this.row,
					{ headers: this.header })
					.then(() => {
						this.createwithsuccess = true
						this.createerror = false
						this.createerrormsg = null
					})
					.catch(e => {
						this.createwithsuccess = false
						this.createerror = true
						this.createerrormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					})
					.finally(() => this.loadingcreate = false)
			}
		}
	}
}
</script>