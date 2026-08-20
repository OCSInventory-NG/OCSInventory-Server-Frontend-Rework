<template>
	<div id="software-mapping-modal">
		<div 
			v-if="!update"
			class="page-header d-print-none"
		>
			<div class="row">
				<div class="col-auto ms-auto">
					<b-button
						:title="$t('software.addsoftwaremapping')"
						variant="primary"
						class="d-sm-inline-block btn-modal"
						@click="loadData()"
					>
						<font-awesome-icon 
							:icon="['fas', 'plus']"
						/>
						{{ $t('software.addsoftwaremapping') }}
					</b-button>
				</div>
			</div>
		</div>
		<div v-else>
			<button 
				:title="$t('network.editnetgroup')"
				class="btn btn-ghost-dark"
				@click="loadData(id)"
			>
				<font-awesome-icon 
					:icon="['fas', 'pencil']"
				/>
			</button>
		</div>
		<b-modal 
			id="softwaremappingmodal" 
			v-model="softwaremappingmodal"
			:title="(!update) ? $t('software.addsoftwaremapping') : $t('software.editsoftwaremapping')"
			hide-footer
			modal-class="custom-modal"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ (!update) ? $t('software.addsoftwaremapping') : $t('software.editsoftwaremapping') }}
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
							:label="$t('software.template')"
							label-for="template"
						>
							<v-select
								id="template"
								v-model="row.template"
								:options="templates"
								:reduce="text => text.value"
								:clearable="false"
								label="text"
								class="mb-3"
								@option:selected="getSections(row.template)"
							>
								<template #search="{attributes, events}">
									<input
										class="vs__search"
										:required="!row.template"
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
						<b-form-group
							:label="$t('software.section')"
							label-for="section"
						>
							<v-select
								id="section"
								v-model="row.section"
								:options="sections"
								:reduce="text => text.value"
								:clearable="false"
								label="text"
								class="mb-3"
								@option:selected="getFields(row.section)"
							>
								<template #search="{attributes, events}">
									<input
										class="vs__search"
										:required="!row.section"
										v-bind="attributes"
										v-on="events"
									>
								</template>
							</v-select>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row
					v-for="field in fieldsToForeach"
					:key="field"
				>
					<b-col>
						<b-form-group
							:label="$t('software.'+field)"
							:label-for="field"
						>
							<v-select
								:id="field"
								v-model="row[field]"
								:options="fields"
								:reduce="text => text.value"
								:clearable="false"
								label="text"
								class="mb-3"
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
	name: "SoftwareMappingModal",
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
				template: null,
				section: null,
				name: null,
				publisher: null,
				version: null,
				major_version: null,
				minor_version: null,
				patch_version: null
			},
			softwaremappingmodal: false,
			templates: [],
			sections: [],
			fields: [],
			fieldsToForeach: [
				"name",
				"publisher",
				"version",
				"major_version",
				"minor_version",
				"patch_version"
			],
			
			loading: true,
			loadingcreate: false,
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.softwaremappingmodal = false
				this.createwithsuccess = false
				this.row = {
					template: null,
					section: null,
					name: null,
					publisher: null,
					version: null,
					major_version: null,
					minor_version: null,
					patch_version: null
				}
				this.$emit("reloadDatatable")
			}, 500)
		}
	},
	async mounted() {
		await this.getTemplates()
		if(!this.update) {
			this.loading = false
		}
	},
	methods: {
		_apiError(e) {
			return e?.response?.data?.error || e?.message || String(e)
		},

		async loadData(id) {
			this.softwaremappingmodal = true
			this.row = {
				template: null,
				section: null,
				name: null,
				publisher: null,
				version: null,
				major_version: null,
				minor_version: null,
				patch_version: null,
			}

			this.errormsg = null
			this.errored = false
			this.createerror = false
			this.createerrormsg = null
			this.createwithsuccess = false

			if (id) {
				this.loading = true
				await this.getSoftwareMapping(id)
			}
		},

		async getSoftwareMapping(id) {
			try {
				const data = await this.$api.generic.get(`software_mapping/${id}/`)
				this.row = data

				this.errormsg = null
				this.errored = false

				if (this.row.template) {
					await this.getSections(this.row.template)
				}
				if (this.row.section) {
					await this.getFields(this.row.section)
				}
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		async getTemplates() {
			try {
				const data = await this.$api.generic.get("templates/")
				this.templates = (data || []).map((template) => ({
					value: template.id,
					text: template.name,
				}))
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			}
		},

		async getSections(templateId) {
			try {
				const data = await this.$api.generic.get("sections/", { template: templateId })
				this.sections = (data || []).map((section) => ({
					value: section.id,
					text: section.name,
				}))
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			}
		},

		async getFields(sectionId) {
			try {
				const data = await this.$api.generic.get("fields/", { section: sectionId })
				this.fields = (data || []).map((field) => ({
					value: field.id,
					text: field.name,
				}))
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
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
					await this.$api.generic.post("software_mapping/", this.row)
				} else {
					await this.$api.generic.patch(
						`software_mapping/${this.row.id}/`,
						this.row
					)
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