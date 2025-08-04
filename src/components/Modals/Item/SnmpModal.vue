<template>
	<div id="snmp-modal">
		<div 
			v-if="!update"
			class="page-header d-print-none"
		>
			<div class="row">
				<div class="col-auto ms-auto">
					<b-button
						:title="$t('network.addsnmpcommunity')"
						variant="primary"
						class="d-sm-inline-block btn-modal"
						@click="snmpmodal = !snmpmodal"
					>
						<font-awesome-icon 
							:icon="['fas', 'plus']"
						/>
						{{ $t('network.addsnmpcommunity') }}
					</b-button>
				</div>
			</div>
		</div>
		<div v-else>
			<button 
				:title="$t('network.editsnmpcommunity')"
				class="btn btn-ghost-dark"
				@click="loadData(id)"
			>
				<font-awesome-icon 
					:icon="['fas', 'pencil']"
				/>
			</button>
		</div>
		<b-modal 
			id="snmpmodal" 
			v-model="snmpmodal"
			:title="(!update) ? $t('network.addsnmpcommunity') : $t('network.editsnmpcommunity')"
			hide-footer
			modal-class="custom-modal modal-blur"
			scrollable
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ (!update) ? $t('network.addsnmpcommunity') : $t('network.editsnmpcommunity') }}
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
							:label="$t('network.name')" 
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
							:label="$t('network.version')" 
							label-for="version"
						>
							<b-form-select
								id="version"
								v-model="row.version" 
								:options="voptions" 
								class="mb-3 form-select"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('network.user')" 
							label-for="user"
						>
							<b-form-input
								id="user"
								v-model="row.user"
								autocomplete="off"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('network.auth_level')"
							label-for="auth_level"
						>
							<b-form-select
								id="level"
								v-model="row.auth_level" 
								:options="loptions" 
								class="mb-3 form-select"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('network.password')" 
							label-for="password"
						>
							<b-form-input
								id="password"
								v-model="row.password"
								type="password"
								autocomplete="off"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('network.auth_protocol')" 
							label-for="auth_protocol"
						>
							<b-form-select
								id="auth_protocol"
								v-model="row.auth_protocol" 
								:options="apoptions" 
								class="mb-3 form-select"
								autocomplete="off"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('network.priv_protocol')" 
							label-for="priv_protocol"
						>
							<b-form-select
								id="priv_protocol"
								v-model="row.priv_protocol" 
								:options="ppoptions" 
								class="mb-3 form-select"
								autocomplete="off"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('network.priv_password')" 
							label-for="priv_password"
						>
							<b-form-input
								id="priv_password"
								v-model="row.priv_password"
								type="password"
								autocomplete="off"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('network.retries')" 
							label-for="retries"
						>
							<b-form-input
								id="retries"
								v-model="row.retries"
								type="number"
								required
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('network.timeout')" 
							label-for="timeout"
						>
							<b-form-input
								id="timeout"
								v-model="row.timeout"
								type="number"
								required
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('network.subnets')" 
							label-for="subnets"
						>
							<b-form-textarea
								id="subnets"
								v-model="row.subnets"
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
	name: "SnmpModal",
	props: {
		update: { type: Boolean, default: false },
		id: { type: Number, default: null }
	},
	data() {
		return {
			row: {
				name: null,
				version: "2c",
				user: null,
				auth_level: null,
				password: null,
				auth_protocol: null,
				priv_protocol: null,
				retries: 1,
				timeout: 30,
				subnets: null
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
			snmpmodal: false,
			voptions: [
				{value: "1", text: "1"},
				{value: "2c", text: "2c"},
				{value: "3", text: "3"},
			],
			loptions: [
				{value: null, text: this.$t("generic.none")},
				{value: "noAuthNoPriv", text: "noAuthNoPriv"},
				{value: "authNoPriv", text: "authNoPriv"},
				{value: "authPriv", text: "authPriv"},
			],
			apoptions: [
				{value: null, text: this.$t("generic.none")},
				{value: "MD5", text: "MD5"},
				{value: "SHA-1", text: "SHA-1"},
			],
			ppoptions: [
				{value: null, text: this.$t("generic.none")},
				{value: "DES", text: "DES"},
				{value: "AES", text: "AES"},
			],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.snmpmodal = false
				this.createwithsuccess = false
				this.row = {
					name: null,
					version: "2c",
					user: null,
					level: null,
					password: null,
					auth_protocol: null,
					priv_protocol: null,
					retries: 1,
					timeout: 30,
					subnets: null
				}
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
			this.snmpmodal = true
			this.getSnmpConfig(id)
		},
		async getSnmpConfig(id) {
			await axios.get(this.$config.BACKEND_API_ROUTE+"snmp/config/"+id+"/", { headers: this.header })
				.then(response => {
					this.row = response.data
					this.row.subnets = this.row.subnets.join(",")
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true

			if(this.row.subnets != null && this.row.subnets.trim() != "") {
				this.row.subnets = this.row.subnets.replace(/[^0-9./`,]+/g, "").split(",")
			} else {
				this.row.subnets = []
			}

			if(!this.update) {
				axios.post(this.$config.BACKEND_API_ROUTE+"snmp/config/", this.row,
					{ headers: this.header })
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
				axios.patch(this.$config.BACKEND_API_ROUTE+"snmp/config/"+this.id+"/", this.row,
					{ headers: this.header })
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
			}
		}
	}
}
</script>