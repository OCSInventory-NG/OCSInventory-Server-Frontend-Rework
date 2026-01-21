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
						@click="softwaremappingmodal = !softwaremappingmodal"
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
			modal-class="custom-modal modal-blur"
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
import axios from 'axios'

export default {
	name: "SoftwareMappingModal",
	props: {
		update: { type: Boolean, default: false },
		id: { type: Number, default: null }
	},
	data() {
		return {
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
			errormsg: null,
			errored: false,
			loading: true,
			loadingcreate: false,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,
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
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
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
		async loadData(id) {
			this.loading = true
			this.softwaremappingmodal = true
			await this.getSoftwareMapping(id)
		},
		async getSoftwareMapping(id) {
			await axios.get(this.$config.BACKEND_API_ROUTE+"software_mapping/"+id+"/", { headers: this.header })
				.then(response => {
					this.row = response.data
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
			
			if (!this.errored) {
				await this.getSections(this.row.template)
				await this.getFields(this.row.section)
			}
			this.loading = false
		},
		async getTemplates() {
			await axios.get(this.$config.BACKEND_API_ROUTE+"templates/", { headers: this.header })
				.then(response => {
					this.templates = response.data
					this.templates = response.data.map(template => ({
						value: template.id,
						text: template.name
					}))
				})
		},
		async getSections(templateId) {
			await axios.get(this.$config.BACKEND_API_ROUTE+"sections/?template="+templateId, { headers: this.header })
				.then(response => {
					this.sections = response.data.map(section => ({
						value: section.id,
						text: section.name
					}))
				})
		},
		async getFields(sectionId) {
			await axios.get(this.$config.BACKEND_API_ROUTE+"fields/?section="+sectionId, { headers: this.header })
				.then(response => {
					this.fields = response.data.map(field => ({
						value: field.id,
						text: field.name
					}))
				})
		},
		onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true

			if(!this.update) {
				axios.post(this.$config.BACKEND_API_ROUTE+"software_mapping/", this.row, { headers: this.header })
					.then(() => {
						this.createwithsuccess = true
						this.createerror = false
						this.createerrormsg = null
					})
					.catch(e => {
						this.createwithsuccess = false
						this.createerror = true
						this.createerrormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					})
					.finally(() => this.loadingcreate = false)
			} else {
				axios.patch(this.$config.BACKEND_API_ROUTE+"software_mapping/"+this.row.id+"/", this.row,
					{ headers: this.header })
					.then(() => {
						this.createwithsuccess = true
						this.createerrormsg = null
						this.createerror = false
					})
					.catch(e => {
						this.createerrormsg = (e.response?.data?.error) ? e.response.data.error : e.message
						this.createerror = true
						this.createwithsuccess = false
					})
					.finally(() => this.loadingcreate = false)
			}
		}
	}
}
</script>