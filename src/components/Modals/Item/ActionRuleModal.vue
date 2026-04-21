<template>
	<div id="action-rule-modal">
		<div 
			v-if="!update"
			class="page-header d-print-none"
		>
			<div class="row">
				<div class="col-auto ms-auto">
					<b-button
						:title="$t('rule.addaction')"
						variant="primary"
						class="d-sm-inline-block btn-modal"
						@click="loadData()"
					>
						<font-awesome-icon 
							:icon="['fas', 'plus']"
						/>
						{{ $t('rule.addaction') }}
					</b-button>
				</div>
			</div>
		</div>
		<div v-else>
			<button 
				:title="$t('rule.editaction')"
				class="btn btn-ghost-dark"
				@click="loadData(id)"
			>
				<font-awesome-icon 
					:icon="['fas', 'pencil']"
				/>
			</button>
		</div>
		<b-modal 
			id="actionrulemodal" 
			v-model="rulemodal"
			:title="(!update) ? $t('rule.addaction') : $t('generic.change')"
			hide-footer
			modal-class="custom-modal"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ (!update) ? $t('rule.addaction') : $t('generic.change') }}
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
							:label="$t('rule.action')" 
							label-for="action"
						>
							<v-select
								id="action"
								v-model="row.action"
								:options="actionOptions"
								:reduce="text => text.value"
								:clearable="false"
								label="text"
								class="mb-3 ocs-select"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('rule.field')" 
							label-for="field"
						>
							<v-select
								id="field"
								v-model="row.field"
								:options="fieldOptions"
								:reduce="text => text.value"
								:clearable="false"
								label="text"
								class="mb-3 ocs-select"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('generic.value')" 
							label-for="value"
						>
							<v-select
								v-if="isValueSelect"
								:key="valueOptions.length"
								id="value"
								v-model="row.value"
								:options="valueOptions"
								:reduce="text => text.value"
								:multiple="false"
								:close-on-select="true"
								:clearable="false"
								label="text"
								class="mb-3 ocs-select"
								:loading="loadingValueOptions"
							/>
							<b-form-input
								v-else
								id="value"
								v-model="row.value"
								class="mb-3"
								required
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
	name: "ActionRuleModal",
	props: {
		update: { type: Boolean, default: false },
		id: { type: [Number, String], default: null }
	},
	data() {
		return {
			errormsg: null,
			errored: false,
			createerror: false,
			createerrormsg: null,

			createwithsuccess: false,

			row: {
				id: null,
				rule: null,
				priority: 1,
				description: null,
				action: null,
				field: null,
				value: null,
				content_type: null,
				object_id: null,
				object_slug: null,
			},
			rulemodal: false,
			actionOptions: [],
			fieldOptions: [],
			valueOptions: [],
			loadingValueOptions: false,
			
			loading: true,
			loadingcreate: false,
		}
	},
	computed: {
		isValueSelect() {
			const result = this.row.field === 'template';
			return result;
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.rulemodal = false
				this.createwithsuccess = false
				this.row = {
					id: null,
					rule: this.id ? Number(this.id) : null,
					priority: 1,
					description: null,
					action: null,
					field: null,
					value: null,
				}
				this.$emit("reloadDatatable")
			}, 500)
		},
		'row.field': {
			handler(newValue, oldValue) {
				this.handleFieldChange(newValue);
			},
		}
	},
	mounted() {
		if(!this.update) {
			this.row.rule = this.id ? Number(this.id) : null
			this.loading = false
		}
		this.loadOptions()
	},
	methods: {
		_apiError(e) {
			return e?.response?.data?.error || e?.message || String(e)
		},

		async loadOptions() {
			try {
				const options = await this.$api.generic.options("automation/action/")
				const postFields = options.actions.POST

				// Charger les options pour action depuis l'API
				if (postFields.action && postFields.action.choices) {
					this.actionOptions = postFields.action.choices.map(choice => ({
						value: choice.value,
						text: choice.display_name || choice.value
					}))
				} else {
					// Fallback si pas de choices
					this.actionOptions = [
						{ value: 'set', text: this.$t('rule.set') }
					]
				}

				// Charger les options pour field depuis l'API
				if (postFields.field && postFields.field.choices) {
					this.fieldOptions = postFields.field.choices.map(choice => ({
						value: choice.value,
						text: choice.display_name || choice.value
					}))
				} else {
					// Fallback si pas de choices
					this.fieldOptions = [
						{ value: 'template', text: this.$t('rule.template') }
					]
				}

			} catch (e) {
				console.error('Erreur lors du chargement des options depuis l\'API:', e)
				// Fallback en cas d'erreur
				this.actionOptions = [
					{ value: 'set', text: this.$t('rule.set') }
				]
				this.fieldOptions = [
					{ value: 'template', text: this.$t('rule.template') }
				]
			}
		},

		loadData(id) {
			this.rulemodal = true
			this.row = {
				id: null,
				rule: this.id,
				priority: 1,
				description: null,
				action: null,
				field: null,
				value: null,
			}
			this.valueOptions = []

			this.errormsg = null
			this.errored = false
			this.createerror = false
			this.createerrormsg = null
			this.createwithsuccess = false

			if (id) {
				this.loading = true
				this.getAction(id)
			}
		},

		async getAction(id) {
			try {
				const data = await this.$api.generic.get(`automation/action/${id}/`)
				this.row = data
				this.errormsg = null
				this.errored = false
				if (this.row.field === 'template') {
					await this.handleFieldChange(this.row.field)
				}
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		async calculatePriority(id) {
			try {
				const response = await this.$api.generic.get(`automation/action/?rule=${id}`)
				const actions = Array.isArray(response)
					? response
					: response.results ?? response

				const maxPriority = actions.length
					? Math.max(...actions.map((action) => Number(action.priority) || 0))
					: 0

				return maxPriority + 1
			} catch (e) {
				console.error("Erreur lors du calcul de la priority :", e)
				return 1
			}
		},

		async onSubmit(event) {
			event.preventDefault();
			this.loadingcreate = true;

			this.createwithsuccess = false;
			this.createerror = false;
			this.createerrormsg = null;

			try {
				const priority = this.update ? this.row.priority : await this.calculatePriority(this.id);

				if (!this.update) {
					const payload = {
						rule: this.id ? Number(this.id) : null,
						priority: priority,
						description: this.row.description,
						action: this.row.action,
						field: this.row.field,
						value: this.row.value,
					};

					await this.$api.generic.post("automation/action/", payload);
				} else {
					const payload = {
						priority: priority,
						description: this.row.description,
						action: this.row.action,
						field: this.row.field,
						value: this.row.value,
					};

					await this.$api.generic.patch(`automation/action/${this.row.id}/`, payload);
				}

				this.createwithsuccess = true;
			} catch (e) {
				this.createerrormsg = this._apiError(e);
				this.createerror = true;
				this.createwithsuccess = false;
			} finally {
				this.loadingcreate = false;
			}
		},

		async handleFieldChange() {
			this.valueOptions = [];
			if (this.row.field === 'template') {
				this.loadingValueOptions = true;
				try {
					const response = await this.$api.generic.get('templates/');
					const templates = Array.isArray(response)
						? response 
						: response.results ?? response;
					
					this.valueOptions = templates.map(template => {
						return {
							value: template.id,
							text: template.name || template.id
						};
					});
				} catch (e) {
					console.error('Erreur lors du chargement des templates:', e);
					this.valueOptions = [];
				} finally {
					this.loadingValueOptions = false;
				}
			}
		},
	},
}
</script>

<style scoped>
.ocs-select {
	margin-bottom: 1rem;
}
</style>