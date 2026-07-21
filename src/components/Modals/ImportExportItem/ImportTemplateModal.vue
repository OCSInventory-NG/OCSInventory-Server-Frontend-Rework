<template>
	<div id="import-template-modal">
		<b-button 
			:title="$t('template.import_template')"
			variant="bg-light"
			class="form-control btn datatable-btn datatable-btn-maxsize"
			@click="loadData()"
		>
			<font-awesome-icon 
				:icon="['fas', 'download']"
			/>
		</b-button>

		<b-modal 
			id="import-template" 
			v-model="importtemplate"
			:title="$t('template.import_template')"
			hide-footer
			size="md"
			modal-class="custom-modal"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('template.import_template') }}
					<b-spinner 
						v-if="loadingimport"
						variant="success"
					/>
					<font-awesome-icon 
						v-if="importwithsuccess"
						:icon="['fas', 'check']"
						color="green"
					/>
					<font-awesome-icon 
						v-if="errored"
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
				@submit="onSubmit"
			>
				<Alert 
					v-if="errored"
					:message="errormsg" 
					variant="danger"
				/>
				<b-tabs
					v-model="activetab"
					fill
					class="mb-3"
				>
					<b-tab :title="$t('template.import_mode_complete')" />
					<b-tab :title="$t('template.import_mode_partial')" />
				</b-tabs>
				<b-row
					v-if="mode === 'partial'"
					class="mb-2"
				>
					<b-col>
						<b-form-group
							:label="$t('template.import_target_template')"
							label-for="target-template"
						>
							<b-spinner
								v-if="loadingtemplates"
								small
								variant="success"
							/>
							<v-select
								v-else
								id="target-template"
								v-model="selectedtemplate"
								:options="templates"
								:reduce="text => text.value"
								:placeholder="$t('template.import_select_target_template')"
								label="text"
							>
								<template #search="{attributes, events}">
									<input
										class="vs__search"
										v-bind="attributes"
										v-on="events"
									>
								</template>
							</v-select>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-file
							ref="fileInput"
							:placeholder="$t('template.select_template_file')"
							accept=".json"
							@change="processFile($event)"
						/>
					</b-col>
				</b-row>
				<b-row
					v-if="mode === 'partial' && jsonToSend"
					class="mt-3"
				>
					<b-col>
						<Alert
							v-if="!filesections.length"
							:message="$t('template.import_no_section_in_file')"
							variant="warning"
						/>
						<b-form-group
							v-else
							:label="$t('template.import_select_sections')"
						>
							<b-form-checkbox
								v-for="(section, index) in filesections"
								:key="index"
								v-model="selectedsections"
								:value="index"
							>
								{{ section.name || `#${index + 1}` }}
							</b-form-checkbox>
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
							:disabled="!canSubmit"
						>
							{{ $t('generic.send') }}
						</b-button>
					</b-col>
					<b-col align-self="end" />
				</b-row>
			</b-form>
		</b-modal>
	</div>
</template>

<script>
export default {
	name: 'ImportTemplateModal',
	data() {
		return {
			errormsg: null,
			errored: false,

			importwithsuccess: false,
			
			importtemplate: false,
			file: null,
			jsonToSend: null,

			loadingimport: false,

			// Import mode: 'complete' (whole template) or 'partial' (inject sections)
			mode: 'complete',

			// Partial mode
			templates: [],
			selectedtemplate: null,
			loadingtemplates: false,
			selectedsections: [],
		}
	},
	computed: {
		// Proxy between the b-tabs index and the import mode
		activetab: {
			get() {
				return this.mode === 'partial' ? 1 : 0
			},
			set(value) {
				this.mode = value === 1 ? 'partial' : 'complete'
			},
		},

		// Sections found in the uploaded import file
		filesections() {
			const sections = this.jsonToSend?.sections
			return Array.isArray(sections) ? sections : []
		},

		canSubmit() {
			if (this.loadingimport) return false
			if (!this.jsonToSend) return false

			if (this.mode === 'partial') {
				return !!this.selectedtemplate && this.selectedsections.length > 0
			}

			return true
		},
	},
	watch: {
		importwithsuccess: function() {
			setTimeout(() => {
				this.importtemplate = false
				this.importwithsuccess = false
				this.$emit('reloadDatatable')
			}, 500)
		},

		mode: function() {
			// Reset feedback and section selection when switching mode
			this.errormsg = null
			this.errored = false
			this.importwithsuccess = false
			this.selectedsections = []

			if (this.mode === 'partial' && !this.templates.length) {
				this.getTemplates()
			}
		}
	},
	methods: {
		loadData() {
			this.importtemplate = true
			this.mode = 'complete'
			this.file = null
			this.jsonToSend = null
			this.errormsg = null
			this.errored = false
			this.importwithsuccess = false
			this.selectedtemplate = null
			this.selectedsections = []

			this.$refs?.fileInput?.reset?.()
		},

		async getTemplates() {
			this.loadingtemplates = true
			try {
				const data = await this.$api.generic.get("templates/")
				const templates = Array.isArray(data) ? data : (data?.results || [])

				this.templates = templates
					.filter((t) => t?.os !== "SNMP")
					.map((t) => ({ value: t.id, text: t.name }))

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.errored = true
			} finally {
				this.loadingtemplates = false
			}
		},

		processFile(event) {
			this.errormsg = null
			this.errored = false
			this.importwithsuccess = false
			this.selectedsections = []

			this.file = event?.target?.files?.[0] || null
			if (!this.file) {
				this.jsonToSend = null
				return
			}

			if (!this.file.name.toLowerCase().endsWith(".json")) {
				this.errormsg = "Le fichier doit être un .json"
				this.errored = true
				this.jsonToSend = null
				return
			}

			const reader = new FileReader()

			reader.onload = (res) => {
				try {
					const text = res?.target?.result ?? ""
					this.jsonToSend = JSON.parse(text)
				} catch (e) {
					this.jsonToSend = null
					this.errormsg = "JSON invalide"
					this.errored = true
				}
			}

			reader.onerror = (err) => {
				this.jsonToSend = null
				this.errormsg = err?.message || String(err)
				this.errored = true
			}

			reader.readAsText(this.file)
		},

		async onSubmit() {
			this.loadingimport = true
			this.errormsg = null
			this.errored = false
			this.importwithsuccess = false

			try {
				if (!this.jsonToSend) {
					throw new Error("No JSON to import (missing or invalid file).")
				}

				if (this.mode === 'partial') {
					await this.submitPartial()
				} else {
					await this.$api.generic.post("templates/", this.jsonToSend)
				}

				this.importwithsuccess = true
			} catch (e) {
				this.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.errored = true
				this.importwithsuccess = false
			} finally {
				this.loadingimport = false
			}
		},

		async submitPartial() {
			// Take the selected sections from the file and drop their identifiers
			// so the backend attaches them to the target template as new sections.
			const sections = this.selectedsections
				.map((index) => this.filesections[index])
				.filter(Boolean)
				.map((section) => {
					const { id: _id, template: _template, ...rest } = section
					return rest
				})

			await this.$api.generic.patch(`templates/${this.selectedtemplate}/`, {
				sections,
			})
		},
	}
}
</script>