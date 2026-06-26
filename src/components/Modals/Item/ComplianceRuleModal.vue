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
							:label="$t('compliance.target_groups')"
							label-for="groups"
						>
							<v-select
								id="groups"
								v-model="selectedGroups"
								:options="groups"
								:reduce="g => g.value"
								label="text"
								multiple
								class="mb-3"
							/>
						</b-form-group>
					</b-col>
					<b-col>
						<b-form-group
							:label="$t('compliance.target_tags')"
							label-for="tags"
						>
							<v-select
								id="tags"
								v-model="selectedTags"
								:options="tagOptions"
								taggable
								multiple
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
			groups: [],
			tagOptions: [],
			selectedGroups: [],
			selectedTags: [],
			rulemodal: false,
			typeOptions: [
				{ value: 'software', text: this.$t('compliance.type_software') },
				{ value: 'security', text: this.$t('compliance.type_security') },
			],
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
				this.selectedGroups = []
				this.selectedTags = []
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
			this.selectedGroups = []
			this.selectedTags = []

			this.errormsg = null
			this.errored = false
			this.createerror = false
			this.createerrormsg = null
			this.createwithsuccess = false

			await Promise.all([this.loadGroups(), this.loadTags()])

			if (id) {
				await this.getRules(id)
			} else {
				this.loading = false
			}
		},

		async loadGroups() {
			try {
				const data = await this.$api.generic.get('asset/groups/')
				this.groups = (Array.isArray(data) ? data : (data?.results || [])).map(g => ({ value: g.id, text: g.name }))
			} catch (e) {
				this.groups = []
			}
		},

		async loadTags() {
			try {
				const configData = await this.$api.generic.get('accountinfo/config/')
				const configs = Array.isArray(configData) ? configData : (configData?.results || [])
				const tagConfig = configs.find(c => c.name === 'TAG' && c.datatarget === 'ASSET')
				if (!tagConfig) return

				const dataResponse = await this.$api.generic.get(
					'accountinfo/data/', {}, { object_slug: 'inventory_base.inventorybase' }
				)
				const dataEntries = Array.isArray(dataResponse) ? dataResponse : (dataResponse?.results || [])

				this.tagOptions = [...new Set(
					dataEntries
						.map(d => (d.accountdata || {})[String(tagConfig.id)])
						.filter(v => v && v.trim())
				)]
			} catch (e) {
				this.tagOptions = []
			}
		},

		async getRules(id) {
			try {
				const data = await this.$api.generic.get(`compliance/rules/${id}/`)
				this.row = data
				const targetsData = await this.$api.generic.get('compliance/targets/', {}, { rule: id })
				const targets = Array.isArray(targetsData) ? targetsData : (targetsData?.results || [])
				this.selectedGroups = targets.filter(t => t.target_type === 'group').map(t => parseInt(t.target_value))
				this.selectedTags = targets.filter(t => t.target_type === 'tag').map(t => t.target_value)
				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		async syncTargets(ruleId) {
			const existing = await this.$api.generic.get('compliance/targets/', {}, { rule: ruleId })
			const existingTargets = Array.isArray(existing) ? existing : (existing?.results || [])
			for (const t of existingTargets) {
				await this.$api.generic.delete(`compliance/targets/${t.id}/`)
			}
			for (const groupId of this.selectedGroups) {
				await this.$api.generic.post('compliance/targets/', {
					rule: ruleId,
					target_type: 'group',
					target_value: String(groupId),
				})
			}
			for (const tagValue of this.selectedTags) {
				await this.$api.generic.post('compliance/targets/', {
					rule: ruleId,
					target_type: 'tag',
					target_value: tagValue,
				})
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
					const saved = await this.$api.generic.post("compliance/rules/", this.row)
					await this.syncTargets(saved.id)
				} else {
					const { logic: _logic, ...payload } = this.row

					await this.$api.generic.patch(
						`compliance/rules/${this.row.id}/`,
						payload
					)
					await this.syncTargets(this.row.id)
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
