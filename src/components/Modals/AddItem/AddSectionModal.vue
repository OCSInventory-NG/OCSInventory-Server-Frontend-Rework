<template>
	<div 
		id="add-section-modal"
		class="container-xl"
	>
		<div class="page-header d-print-none text-white">
			<div class="row align-items-center">
				<div class="col">
					<div class="page-pretitle">
						<Breadcrumb />
					</div>
					<h2 class="page-title">
						{{ $t('template.edittemplate') }}
					</h2>
				</div>
				<div class="col-auto ms-auto">
					<b-button
						v-b-modal.add-section
						:title="$t('template.addsection')"
						variant="primary"
						class="d-none d-sm-inline-block"
					>
						<font-awesome-icon 
							:icon="['fas', 'plus']"
						/>
						{{ $t('template.addsection') }}
					</b-button>

					<b-modal 
						id="add-section" 
						:title="$t('template.addsection')"
						hide-footer
						modal-class="custom-modal modal-blur"
					>
						<template #modal-header="{ close }">
							<h5 class="modal-title">
								{{ $t('template.addsection') }}
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
										:label="$t('template.target')" 
										label-for="target"
									>
										<b-form-input
											id="target"
											v-model="row.target"
											required
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
			</div>
		</div>
	</div>
</template>

<script>
import Axios from 'axios'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'

export default {
	name: 'AddSectionModal',
	components: { Breadcrumb },
	props: {
		template: { type: Number, required: true },
	},
	data() {
		return {
			row: {
				id: null,
				name: null,
				retrival_method: 'FILE',
				retrival_output: null,
				target: null,
				fields: [],
				template: null,
				options: {
					"use_index": false,
					"remove_line": null,
					"override_line_used": null,
					"need_format": false,
					"submap": null,
					"is_list": false,
					"multiple": false,
					"separator": null
				}
			},
			rowdata: [],
			loading: true,
			errorMsg: null,
			succesMsg: null,
			errored: false,
			successed: false,
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
		this.row.template = this.template
	},
	methods: {
		// Submit template creation and call getTemplates to reload datatable datas
		onSubmit(event) {
			const header = {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
			event.preventDefault()
			
			Axios.post(process.env.VUE_APP_API_ROUTE+"sections/", this.row, { headers: header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errorMsg = null
					this.errored = false
					this.$bvModal.hide('add-section')
					this.$emit('reloadTemplate')
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
					this.succesMsg = null
					this.successed = false
					this.$bvModal.hide('add-section')
				})
		}
	}
}
</script>
