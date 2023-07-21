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
							<b-row v-if="key == 'use_index'">
								<b-col>
									<b-form-checkbox
										id="use_index"
										v-model="row.options.use_index"
										name="use_index"
										value="true"
										unchecked-value="false"
									>
										{{ $t('template.use_index') }}
									</b-form-checkbox>
								</b-col>
							</b-row>
							<b-row v-if="key == 'remove_line'">
								<b-col>
									<b-form-group
										:label="$t('template.remove_line')" 
										label-for="remove_line"
									>
										<b-form-input
											id="remove_line"
											v-model="row.options.remove_line"
										/>
									</b-form-group>
								</b-col>
							</b-row>
							<b-row v-if="key == 'override_line_used'">
								<b-col>
									<b-form-group
										:label="$t('template.override_line_used')" 
										label-for="override_line_used"
									>
										<b-form-input
											id="override_line_used"
											v-model="row.options.override_line_used"
											type="number"
										/>
									</b-form-group>
								</b-col>
							</b-row>
							<b-row v-if="key == 'need_format'">
								<b-col>
									<b-form-checkbox
										id="need_format"
										v-model="row.options.need_format"
										name="need_format"
										value="true"
										unchecked-value="false"
									>
										{{ $t('template.need_format') }}
									</b-form-checkbox>
								</b-col>
							</b-row>
							<b-row v-if="key == 'submap'">
								<b-col>
									<b-form-group
										:label="$t('template.submap')" 
										label-for="submap"
									>
										<b-form-input
											id="submap"
											v-model="row.options.submap"
										/>
									</b-form-group>
								</b-col>
							</b-row>
							<b-row v-if="key == 'is_list'">
								<b-col>
									<b-form-checkbox
										id="is_list"
										v-model="row.options.is_list"
										name="is_list"
										value="true"
										unchecked-value="false"
									>
										{{ $t('template.is_list') }}
									</b-form-checkbox>
								</b-col>
							</b-row>
							<b-row v-if="key == 'multiple'">
								<b-col>
									<b-form-checkbox
										id="multiple"
										v-model="row.options.multiple"
										name="multiple"
										:value="true"
										:unchecked-value="false"
									>
										{{ $t('template.multiple') }}
									</b-form-checkbox>
								</b-col>
							</b-row>
							<b-row v-if="key == 'separator'">
								<b-col>
									<b-form-group
										:label="$t('template.separator')" 
										label-for="separator"
									>
										<b-form-input
											id="separator"
											v-model="row.options.separator"
										/>
									</b-form-group>
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
				options: {
					"use_index": false,
					"remove_line": null,
					"override_line_used": null,
					"need_format": false,
					"submap": null,
					"is_list": false,
					"multiple": false,
					"separator": null
				},
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
				{ value: 'FILE', text: 'Read file' },
				{ value: 'BASH', text: 'Bash command' },
				{ value: 'PW', text: 'Powershell command' },
				{ value: 'CMD', text: 'Cmd command' }
			],
			outputoptions: [
				{ value: 'PTXT', text: 'Plain text' },
				{ value: 'JSON', text: 'JSON format' },
				{ value: 'TBLE', text: 'Table format' },
				{ value: 'REGX', text: 'Regex processing' },
				{ value: 'GREP', text: 'Grep command output' }
			],
			outputoptionoptions: {
				"TBLE": {
					"use_index": false,
					"remove_line": [],
					"override_line_used": null
				},
				"JSON": {
					"need_format": false,
					"submap": null,
					"is_list": false
				},
				"REGX": {
					"multiple": false,
					"separator": null
				}
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
