<template>
	<div id="rule-modal">
		<div 
			v-if="!update"
			class="page-header d-print-none"
		>
			<div class="row">
				<div class="col-auto ms-auto">
					<b-button
						:title="$t('rule.addrule')"
						variant="primary"
						class="d-sm-inline-block btn-modal"
						@click="loadData()"
					>
						<font-awesome-icon 
							:icon="['fas', 'plus']"
						/>
						{{ $t('rule.addrule') }}
					</b-button>
				</div>
			</div>
		</div>
		<div v-else>
			<button 
				:title="$t('rule.editrule')"
				class="btn btn-ghost-dark"
				@click="loadData(id)"
			>
				<font-awesome-icon 
					:icon="['fas', 'pencil']"
				/>
			</button>
		</div>
		<b-modal 
			id="rulemodal" 
			v-model="rulemodal"
			:title="(!update) ? $t('rule.addrule') : $t('rule.editrule')"
			hide-footer
			modal-class="custom-modal"
			
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ (!update) ? $t('rule.addrule') : $t('rule.editrule') }}
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
							:label="$t('rule.description')" 
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
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('rule.trigger')" 
							label-for="trigger"
						>
							<v-select
								id="trigger"
								v-model="row.trigger" 
								:options="options" 
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
							:label="$t('rule.enabled')" 
							label-for="enabled"
						>
							<label class="form-check form-switch">
								<input 
									v-model="row.enabled"
									class="form-check-input"
									type="checkbox"
								>
							</label>
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
	name: "RuleModal",
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
				description: null,
				trigger: 'inventory_received',
				enabled: false,
				logic: {},
				actions: []
			},
			rulemodal: false,
			options: [
				{ value: 'inventory_received', text: this.$t('rule.inventory_received') },
				{ value: 'user_login', text: this.$t('rule.user_login') },
				{ value: 'netdevice_received', text: this.$t('rule.netdevice_received') }
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
					description: null,
					trigger: 'inventory_received',
					enabled: false,
					logic: {},
					actions: []
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
			this.rulemodal = true
			this.row = {
				description: null,
				trigger: "inventory_received",
				enabled: false,
				logic: {},
				actions: [],
			}

			this.errormsg = null
			this.errored = false
			this.createerror = false
			this.createerrormsg = null
			this.createwithsuccess = false

			if (id) {
				this.loading = true
				this.getRules(id)
			}
		},

		async getRules(id) {
			try {
				const data = await this.$api.generic.get(`automation/rule/${id}/`)
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
					await this.$api.generic.post("automation/rule/", this.row)
				} else {
					const { logic: _logic, actions: _actions, ...payload } = this.row

					await this.$api.generic.patch(
						`automation/rule/${this.row.id}/`,
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