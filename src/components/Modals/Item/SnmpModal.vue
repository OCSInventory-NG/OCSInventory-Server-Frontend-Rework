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
						@click="loadData()"
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
			modal-class="custom-modal"
			
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
export default {
	name: "SnmpModal",
	props: {
		update: { type: Boolean, default: false },
		id: { type: Number, default: null }
	},
	data() {
		return {
			errormsg: null,
			errored: false,
			createerror: false,
			createerrormsg: null,

			createwithsuccess: false,

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
			
			loading: true,
			loadingcreate: false,
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
		_apiError(e) {
			return e?.response?.data?.error || e?.message || String(e)
		},

		loadData(id) {
			this.snmpmodal = true
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
				subnets: null,
			}

			this.errormsg = null
			this.errored = false
			this.createerror = false
			this.createerrormsg = null
			this.createwithsuccess = false

			if (id) {
				this.loading = true
				this.getSnmpConfig(id)
			}
		},

		async getSnmpConfig(id) {
			try {
				const data = await this.$api.generic.get(`snmp/config/${id}/`)
				this.row = data

				const subnetsArr = Array.isArray(this.row.subnets) ? this.row.subnets : []
				this.row.subnets = subnetsArr.join(",")

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		async onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true

			this.createwithsuccess = false
			this.createerror = false
			this.createerrormsg = null

			try {
				const payload = { ...this.row }

				if (payload.subnets != null && String(payload.subnets).trim() !== "") {
					payload.subnets = String(payload.subnets)
						.replace(/[^0-9./`,]+/g, "")
						.split(",")
						.map((s) => s.trim())
						.filter((s) => s !== "")
				} else {
					payload.subnets = []
				}

				if (!this.update) {
					await this.$api.generic.post("snmp/config/", payload)
				} else {
					await this.$api.generic.patch(`snmp/config/${this.id}/`, payload)
				}

				this.createwithsuccess = true
			} catch (e) {
				this.createwithsuccess = false
				this.createerror = true
				this.createerrormsg = this._apiError(e)
			} finally {
				this.loadingcreate = false
			}
		},
	}
}
</script>