<template>
	<div id="compliance-rule-modal">
		<div
			v-if="!update"
			class="page-header d-print-none"
		>
			<div class="row">
				<div class="col-auto ms-auto">
					<b-button
						:title="$t('compliance.addrule')"
						variant="primary"
						class="d-sm-inline-block btn-modal"
						@click="loadData()"
					>
						<font-awesome-icon
							:icon="['fas', 'plus']"
						/>
						{{ $t('compliance.addrule') }}
					</b-button>
				</div>
			</div>
		</div>
		<div v-else>
			<button
				:title="$t('compliance.editrule')"
				class="btn btn-ghost-dark"
				@click="loadData(id)"
			>
				<font-awesome-icon
					:icon="['fas', 'pencil']"
				/>
			</button>
		</div>
		<b-modal
			id="compliancerulemodal"
			v-model="rulemodal"
			:title="(!update) ? $t('compliance.addrule') : $t('compliance.editrule')"
			hide-footer
			modal-class="custom-modal"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ (!update) ? $t('compliance.addrule') : $t('compliance.editrule') }}
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
							:label="$t('compliance.name')"
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
							:label="$t('compliance.description')"
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
							:label="$t('compliance.type')"
							label-for="type"
						>
							<v-select
								id="type"
								v-model="row.type"
								:options="typeOptions"
								:reduce="text => text.value"
								:clearable="false"
								label="text"
								class="mb-3"
							/>
						</b-form-group>
					</b-col>
					<b-col>
						<b-form-group
							:label="$t('compliance.severity')"
							label-for="severity"
						>
							<v-select
								id="severity"
								v-model="row.severity"
								:options="severityOptions"
								:reduce="text => text.value"
								:clearable="false"
								label="text"
								class="mb-3"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('compliance.enabled')"
							label-for="enabled"
						>
							<div class="form-check form-switch mb-4">
								<input
									v-model="row.enabled"
									class="form-check-input"
									type="checkbox"
								>
							</div>
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
	name: "ComplianceRuleModal",
	props: {
		update: { type: Boolean, default: false },
		id: { type: Number, default: null }
	},
	emits: ["reloadDatatable"],
	data() {
		return {
			errormsg: null,
			errored: false,
			createerror: false,
			createerrormsg: null,

			createwithsuccess: false,

			row: {
				name: null,
				description: null,
				type: 'software',
				severity: 'medium',
				enabled: true,
				logic: {},
			},
			rulemodal: false,
			typeOptions: [],
			severityOptions: [
				{ value: 'critical', text: this.$t('compliance.severity_critical') },
				{ value: 'high',     text: this.$t('compliance.severity_high') },
				{ value: 'medium',   text: this.$t('compliance.severity_medium') },
				{ value: 'low',      text: this.$t('compliance.severity_low') },
			],

			loading: true,
			loadingcreate: false,
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.rulemodal = false
				this.createwithsuccess = false
				this.row = {
					name: null,
					description: null,
					type: 'software',
					severity: 'medium',
					enabled: true,
					logic: {},
				}
				this.$emit("reloadDatatable")
			}, 500)
		}
	},
	mounted() {
		this.loadTypes()
		if(!this.update) {
			this.loading = false
		}
	},
	methods: {
		_apiError(e) {
			return e?.response?.data?.error || e?.message || String(e)
		},

		async loadTypes() {
			try {
				const data = await this.$api.generic.get("compliance/types/")
				const types = Array.isArray(data) ? data : (data?.results || [])
				this.typeOptions = types.map(t => ({
					value: t.name,
					text: this.$te('compliance.type_' + t.name)
						? this.$t('compliance.type_' + t.name)
						: t.name,
				}))
			} catch (e) {
				this.typeOptions = []
			}
		},

		async loadData(id) {
			this.rulemodal = true
			this.loading = true
			this.row = {
				name: null,
				description: null,
				type: 'software',
				severity: 'medium',
				enabled: true,
				logic: {},
			}
			this.errormsg = null
			this.errored = false
			this.createerror = false
			this.createerrormsg = null
			this.createwithsuccess = false

			if (id) {
				await this.getRules(id)
			} else {
				this.loading = false
			}
		},

		async getRules(id) {
			try {
				const data = await this.$api.generic.get(`compliance/rules/${id}/`)
				this.row = data
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
				if (!this.update) {
					await this.$api.generic.post("compliance/rules/", this.row)
				} else {
					const { logic: _logic, ...payload } = this.row
					await this.$api.generic.patch(
						`compliance/rules/${this.row.id}/`,
						payload
					)
				}
				this.createwithsuccess = true
			} catch (e) {
				this.createerrormsg = this._apiError(e)
				this.createerror = true
				this.createwithsuccess = false
			} finally {
				this.loadingcreate = false
			}
		},
	}
}
</script>
