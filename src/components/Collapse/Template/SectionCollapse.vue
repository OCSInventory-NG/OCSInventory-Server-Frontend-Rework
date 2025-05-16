<template>
	<div id="section-collapse">
		<div
			v-if="loadingsection"
			class="ocs-loader"
		>
			<Loader />
		</div>
		<div v-else>
			<div class="table-responsive">
				<table class="table table-vcenter border">
					<thead>
						<tr>
							<th>{{ $t('user.name') }}</th>
							<th>{{ $t('template.retrieval_method') }}</th>
							<th v-if="routetype != 'snmp'">
								{{ $t('template.retrieval_output') }}
							</th>
							<th v-if="routetype != 'snmp'">
								{{ $t('template.target') }}
							</th>
							<th v-if="routetype != 'snmp'">
								{{ $t('template.retrieval_output_options') }}
							</th>
							<th class="section-table-title">
								{{ $t('generic.actions') }}
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>{{ rowsection.name }}</td>
							<td>{{ $t("template."+rowsection.retrieval_method) }}</td>
							<td v-if="routetype != 'snmp'">
								{{ $t("template."+rowsection.retrieval_output) }}
							</td>
							<td v-if="routetype != 'snmp'">
								{{ rowsection.target }}
							</td>
							<td v-if="routetype != 'snmp'">
								<p
									v-for="(option,optionname) in rowsection.options"
									:key="optionname"
									class="section-table-options"
								>
									{{ $t('template.' + optionname) }} : {{ option }}
								</p>
							</td>
							<td class="section-table-btn">
								<b-button-toolbar>
									<b-button-group class="mr-1">
										<SectionModal
											:id="rowsection.id"
											:update="true"
											:rowsectiondata="rowsection"
											:template="rowsection.template"
											@reloadTemplate="reloadTemplate"
											@reloadSection="reloadSection"
										/>
										<delete-item-modal 
											:id="rowsection.id"
											:name="rowsection.name"
											parameter="sections"
											@reloadTemplate="reloadTemplate"
										/>
									</b-button-group>
								</b-button-toolbar>
							</td>
						</tr>
					</tbody>
				</table>
			</div><br>
			<b-row class="text-center">
				<b-col cols="4" />
				<b-col cols="4">
					<h2>{{ $t("template.fieldslist") }}</h2>
				</b-col>
				<b-col cols="4">
					<FieldModal
						:section="section.id"
						:routetype="routetype"
						@reloadDatatable="reloadDatatable"
					/>
				</b-col>
			</b-row>
			<div
				v-if="loading"
				class="ocs-loader"
			>
				<Loader />
			</div>
			<b-row  
				v-else
			>
				<b-col>
					<Datatable
						v-if="rowdata.length"
						id="fields-datatable"
						:canedit="true"
						:candelete="true"
						:rowdata="rowdata"
						:usecheckbox="true"
						:rowheader="rowheader"
						title="fields"
						translationkey="template."
						editcomponent="FieldModal"
						@reloadDatatable="reloadDatatable"
					/>
					<div v-else>
						<Alert
							:message="$t('message.no_field')"
							variant="info"
						/>
					</div>
				</b-col>
			</b-row>
		</div>
	</div>
</template>

<script>
import axios from 'axios'

export default {
	name: 'SectionCollapse',
	props: {
		section: { type: Object, default: () => {} },
		routetype: { type: String, default: "assets" }
	},
	data() {
		return {
			loading: true,
			loadingsection: true,
			errored: false,
			errormsg: null,
			rowheader: [],
			rowdata: [],
			rowsection: [], 
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	async mounted() {
		this.rowsection = this.section
		await this.getHeader()
		await this.getFields()
		this.loadingsection = false
	},
	methods: {
		async getHeader() {
			this.rowheader = []
			await axios.options(this.$config.BACKEND_API_ROUTE+"fields/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						if(field != "section") {
							this.rowheader.push(field)
						}
					})
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		async getFields() {
			for (const field of this.rowsection.fields) {
				var options = ""
				if (field.options) {
					for (const [key, value] of Object.entries(field.options)) {
						options += key + " : " + value + "\n"
					}
				}
				field.options = options.trim()
			}
			this.rowdata = this.rowsection.fields
			this.loading = false
		},
		// If new section
		async reloadTemplate() {
			this.$emit('reloadTemplate')
		},
		// If update section
		async reloadSection() {
			this.loadingsection = true
			await axios.get(this.$config.BACKEND_API_ROUTE+"sections/"+this.rowsection.id+"?expand=fields",
				{ headers: this.header })
				.then(response => {
					this.rowsection = response.data
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
				.finally(() => { this.loadingsection = false })
		},
		async reloadDatatable() {
			this.loading = true
			await axios.get(this.$config.BACKEND_API_ROUTE+"fields/?section="+this.rowsection.id,
				{ headers: this.header })
				.then(response => {
					this.rowdata = response.data
					for (const field of this.rowdata) {
						var options = ""
						for (const [key, value] of Object.entries(field.options)) {
							options += key + " : " + value + "\n"
						}
						field.options = options.trim()
					}
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
				.finally(() => {this.loading = false})
		}
	}
}
</script>
