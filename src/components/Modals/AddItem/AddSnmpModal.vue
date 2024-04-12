<template>
	<div
		id="add-snmp-modal"
		class="container-xl"
	>
		<div>
			<div class="page-header d-print-none text-white">
				<div class="row align-items-center">
					<div class="col">
						<div class="page-pretitle">
							<Breadcrumb />
						</div>
						<h2 class="page-title">
							{{ $t('title.'+pageTitle) }}
						</h2>
					</div>
					<div class="col-auto ms-auto">
						<!-- Button to add netgroup -->
						<b-button
							v-if="canadd"
							:title="$t('network.addsnmp')"
							variant="primary"
							class="d-none d-sm-inline-block"
							@click="addsnmp = !addsnmp"
						>
							<font-awesome-icon 
								:icon="['fas', 'plus']"
							/>
							{{ $t('network.addsnmp') }}
						</b-button>
					</div>
				</div>
			</div>
			<!-- Display datatable -->
			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<!-- Display error box message -->
						<section v-if="errored">
							<Alert 
								:message="errorMsg" 
								variant="danger"
							/>
						</section>
						<section v-if="successed">
							<Alert 
								:message="succesMsg" 
								variant="success"
							/>
						</section>
						<div 
							v-if="loading"
							class="ocs-loader"
						>
							<Loader />
						</div>
						<div v-else>
							<div>
								<b-list-group flush>
									<b-list-group-item 
										class="d-flex justify-content-between align-items-center"
									>
										<div>
											<h4 class="mb-1">
												{{ $t("title.snmp") }}
											</h4>
											<p class="mb-1">
												{{ $t("network.enablesnmp") }}
											</p>
										</div>
										<div>
											<label class="form-check form-switch">
												<input 
													v-model="configs.value[0].value"
													class="form-check-input"
													type="checkbox"
													:disabled="!canedit"
													@change="enableSnmp()"
												>
											</label>
										</div>
									</b-list-group-item>
								</b-list-group>
							</div>
							<hr>
							<Datatable
								id="snmpconfig-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:canedit="canedit"
								:candelete="candelete"
								editcomponent="EditSnmpModal"
								title="snmp"
								translationkey="network."
								@reloadDatatable="reloadDatatable"
							/>
							<!-- Modal to add netgroup -->
							<b-modal 
								v-if="canadd"
								id="add-snmp" 
								v-model="addsnmp"
								:title="$t('network.addsnmp')"
								hide-footer
								modal-class="custom-modal modal-blur"
								scrollable
							>
								<template #header="{ close }">
									<h5 class="modal-title">
										{{ $t('network.addsnmp') }}
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
												/>
											</b-form-group>
										</b-col>
									</b-row>
									<b-row>
										<b-col>
											<b-form-group
												:label="$t('network.level')" 
												label-for="level"
											>
												<b-form-select
													id="level"
													v-model="row.level" 
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
												{{ $t('generic.add') }}
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
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import Axios from 'axios'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb.vue'

export default {
	name: "AddSnmpModal",
	components: { Breadcrumb },
	props: {
		canadd: { type: Boolean, default: false },
		canedit: { type: Boolean, default: false },
		candelete: { type: Boolean, default: false },
		canview: { type: Boolean, default: false },
		pageTitle: { type: String, default: "" }
	},
	data() {
		return {
			row: {
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
			},
			rowdata: [],
			rowheader: [
				"name", "version", "user", "level", "password", "auth_protocol",
				"priv_protocol", "priv_password", "retries", "timeout", "subnets"
			],
			configs: [],
			errorMsg: null,
			errored: false,
			succesMsg: null,
			successed: false,
			loading: true,
			loadingcreate: false,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,
			addsnmp: false,
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
				this.addsnmp = false
				this.createwithsuccess = false
				this.reloadDatatable()
			}, 500)
		},
		successed: function() {
			setTimeout(() => {
				this.successed = false
				this.succesMsg = null
			}, 4000)
		}
	},
	mounted() {
		this.getSnmpConfig()
	},
	methods: {
		getSnmpConfig() {
			this.rowdata = []
			this.configs = []
			this.loading = true
			
			Axios.get(import.meta.env.VITE_APP_API_ROUTE+"config/snmp", { headers: this.header })
				.then(response => {
					this.configs = response.data
					var tmpconfig = response.data
					Object.keys(tmpconfig.value).forEach(key => {
						if(key > 0) {
							tmpconfig.value[key].forEach(config => {
								config.subnets = config.subnets.join('\n')
								this.rowdata.push(config)
							})
						}
					})
					this.loading = false
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
		},
		reloadDatatable() {
			this.getSnmpConfig()
		},
		enableSnmp() {
			Axios.patch(import.meta.env.VITE_APP_API_ROUTE+"config/snmp/", this.configs,
				{ headers: this.header })
				.then(() => {
					this.succesMsg = this.$t("message.success_saved")
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
		},
		onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true

			if(this.row.subnets != null && this.row.subnets.trim() != "") {
				this.row.subnets = this.row.subnets.replace(/[^0-9\.\/`,]+/g, "").split(",")
			} else {
				this.row.subnets = []
			}
			
			Object.keys(this.configs.value).forEach(key => {
				if(key > 0) {
					this.configs.value[key].forEach(config => {
						config.subnets = config.subnets.split('\n')
					})
				}
			})

			this.configs.value.push([this.row])

			Axios.patch(import.meta.env.VITE_APP_API_ROUTE+"config/snmp/", this.configs,
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
</script>