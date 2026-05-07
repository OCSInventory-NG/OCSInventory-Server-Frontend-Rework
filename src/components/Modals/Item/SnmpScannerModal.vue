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
			modal-class="custom-modal"
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
				<b-row v-if="snmpscannermodal">
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
export default {
	name: "SnmpScannerModal",
	props: {
		update: { type: Boolean, default: false },
		id: { type: String, default: null }
	},
	data() {
		return {
			errormsg: null,
			errored: false,
			createerror: false,
			createerrormsg: null,

			createwithsuccess: false,

			row: {
				identifier: null,
				ip: null,
				subnets: null,
				notes: null,
				configs: []
			},
			snmpscannermodal: false,
			configs: [],
			
			loading: true,
			loadingcreate: false,
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
		_apiError(e) {
			return e?.response?.data?.error || e?.message || String(e)
		},

		async loadData(id) {
			this.snmpscannermodal = true
			this.row = {
				identifier: null,
				ip: null,
				subnets: null,
				notes: null,
				configs: [],
			}

			this.errormsg = null
			this.errored = false
			this.createerror = false
			this.createerrormsg = null
			this.createwithsuccess = false

			if (id) {
				this.loading = true
				try {
					await this.getSnmpScanner(id)
				} finally {
					this.loading = false
				}
			}
		},

		async getSnmpScanner(id) {
			try {
				const data = await this.$api.generic.get(
					`snmp/scanner/${id}/`,
					{ expand: "configs" }
				)

				this.row = data

				const subnetsArr = Array.isArray(this.row.subnets) ? this.row.subnets : []
				this.row.subnets = subnetsArr.join(",")

				const configs = Array.isArray(this.row.configs) ? this.row.configs : []
				this.row.configs = configs.map((c) => c.id)

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
				throw e
			}
		},

		async getCommunities() {
			try {
				const data = await this.$api.generic.get("snmp/config/")

				this.configs = (data || []).map((config) => ({
					value: config.id,
					text: config.name,
				}))

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

			this.createerror = false
			this.createerrormsg = null
			this.createwithsuccess = false

			try {
				if (!/^[A-Za-z0-9_-]+$/.test(this.row.identifier)) {
					this.createerror = true
					this.createerrormsg = this.$t("network.identifier_format")
					return
				}

				const payload = { ...this.row }

				if (!Array.isArray(payload.subnets)) {
					if (payload.subnets != null && String(payload.subnets).trim() !== "") {
						payload.subnets = String(payload.subnets)
							.replace(/[^0-9./`,]+/g, "")
							.split(",")
							.map((s) => s.trim())
							.filter((s) => s !== "")
					} else {
						payload.subnets = []
					}
				}

				if (!this.update) {
					await this.$api.generic.post("snmp/scanner/", payload)
				} else {
					await this.$api.generic.patch(`snmp/scanner/${this.id}/`, payload)
				}

				this.createwithsuccess = true
				this.createerror = false
				this.createerrormsg = null
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