<template>
	<div id="add-field-modal">
		<b-button 
			v-b-modal="idModal"
			:title="$t('template.addfield')"
			variant="success"
			class="add-button"
		>
			<font-awesome-icon 
				:icon="['fas', 'plus']"
			/>
		</b-button>

		<b-modal 
			:id="idModal" 
			:title="$t('template.addfield')"
			hide-footer
			modal-class="custom-modal modal-blur"
		>
			<template #modal-header="{ close }">
				<h5 class="modal-title">
					{{ $t('template.addfield') }}
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
							:label="$t('template.retrival_value')" 
							label-for="retrival_value"
						>
							<b-form-input
								id="retrival_value"
								v-model="row.retrival_value"
								required
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-checkbox
							id="override_target"
							v-model="row.override_target"
							name="override_target"
							value="true"
							unchecked-value="false"
						>
							{{ $t('template.override_target') }}
						</b-form-checkbox>
					</b-col>
				</b-row>
				<div v-if="row.override_target == 'true'">
					<b-row>
						<b-col>
							<b-form-group
								:label="$t('template.retrival_method')" 
								label-for="retrival_method"
							>
								<b-form-select
									id="retrival_method"
									v-model="row.retrival_method" 
									:options="methodoptions" 
									class="mb-3 form-select"
								/>
							</b-form-group>
						</b-col>
					</b-row>
					<b-row>
						<b-col>
							<b-form-group
								:label="$t('template.new_target')" 
								label-for="new_target"
							>
								<b-form-input
									id="new_target"
									v-model="row.new_target"
								/>
							</b-form-group>
						</b-col>
					</b-row>
					<b-row>
						<b-col>
							<b-form-group
								:label="$t('template.retrival_output')" 
								label-for="retrival_output"
							>
								<b-form-select
									id="retrival_output"
									v-model="row.retrival_output" 
									:options="outputoptions" 
									class="mb-3 form-select"
								/>
							</b-form-group>
						</b-col>
					</b-row>
					<div v-if="outputoptionoptions[row.retrival_output]">
						<b-row>
							<b-col>
								<h4>{{ $t('template.retrieval_output_options') }}</h4>
							</b-col>
						</b-row>
						<div
							v-for="(value, key) in outputoptionoptions[row.retrival_output]"
							:key="key"
						>
							<b-row v-if="value.type == 'text'">
								<b-col>
									<b-form-group
										:label="$t('template.'+value.id)" 
										:label-for="value.id"
									>
										<b-form-input
											:id="value.id"
											v-model="row.options[value.id]"
										/>
									</b-form-group>
								</b-col>
							</b-row>
							<b-row v-if="value.type == 'number'">
								<b-col>
									<b-form-group
										:label="$t('template.'+value.id)" 
										:label-for="value.id"
									>
										<b-form-input
											:id="value.id"
											v-model="row.options[value.id]"
											type="number"
										/>
									</b-form-group>
								</b-col>
							</b-row>
							<b-row v-if="value.type == 'checkbox'">
								<b-col>
									<b-form-checkbox
										:id="value.id"
										v-model="row.options[value.id]"
										:name="value.id"
										value="true"
										:unchecked-value="value.default"
									>
										{{ $t('template.'+value.id) }}
									</b-form-checkbox>
								</b-col>
							</b-row>
						</div>
					</div>
				</div>	
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
		</b-modal>
	</div>
</template>

<script>
import Axios from 'axios'
import i18n from '@/i18n'

export default {
	name: 'AddFieldModal',
	props: {
		section: { type: Number, required: true }
	},
	data() {
		return {
			row: {
				id: null,
				name: null,
				retrival_value: null,
				override_target: false,
				new_target: null,
				retrival_method: null,
				retrival_output: null,
				options: {},
				section: null
			},
			rowdata: [],
			errorMsg: null,
			succesMsg: null,
			errored: false,
			successed: false,
			idModal: 'add-field'+this.section,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			},
			methodoptions: [
				{ value: 'FILE', text: i18n.t('template.FILE') },
				{ value: 'BASH', text: i18n.t('template.BASH') },
				{ value: 'PW', text: i18n.t('template.PW') },
				{ value: 'CMD', text: i18n.t('template.CMD') }
			],
			outputoptions: [
				{ value: 'PTXT', text: i18n.t('template.PTXT') },
				{ value: 'JSON', text: i18n.t('template.JSON') },
				{ value: 'TBLE', text: i18n.t('template.TBLE') },
				{ value: 'REGX', text: i18n.t('template.REGX') },
				{ value: 'GREP', text: i18n.t('template.GREP') }
			],
			outputoptionoptions: {
				"TBLE": [
					{ id: "use_index", type: "checkbox", default: false },
					{ id: "remove_line", type: "text", default: null },
					{ id: "override_line_used", type: "number", default: null }
				],
				"JSON": [
					{ id: "need_format", type: "checkbox", default: false },
					{ id: "submap", type: "text", default: null },
					{ id: "is_list", type: "checkbox", default: false }
				],
				"REGX": [
					{ id: "multiple", type: "checkbox", default: false },
					{ id: "separator", type: "text", default: null },
				]
			}
		}
	},
	created() {
		this.row.section = this.section
	},
	methods: {
		// Submit template creation and call getTemplates to reload datatable datas
		onSubmit(event) {
			event.preventDefault()
			
			Axios.post(process.env.VUE_APP_API_ROUTE+"fields/", this.row, { headers: this.header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errorMsg = null
					this.errored = false
					this.$bvModal.hide(this.idModal)
					this.$emit('reloadTemplate')
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
					this.succesMsg = null
					this.successed = false
					this.$bvModal.hide(this.idModal)
				})
		}
	}
}
</script>
