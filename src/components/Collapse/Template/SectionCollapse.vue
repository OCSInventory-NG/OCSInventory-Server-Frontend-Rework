<template>
	<div id="section-collapse">
		{{ routetype }}
		<div class="table-responsive">
			<table class="table table-vcenter border">
				<thead>
					<tr>
						<th>{{ $t('user.name') }}</th>
						<th>{{ $t('template.retrival_method') }}</th>
						<th v-if="routetype != 'snmp'">
							{{ $t('template.retrival_output') }}
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
						<td>{{ section.name }}</td>
						<td>{{ $t("template."+section.retrival_method) }}</td>
						<td v-if="routetype != 'snmp'">
							{{ $t("template."+section.retrival_output) }}
						</td>
						<td v-if="routetype != 'snmp'">
							{{ section.target }}
						</td>
						<td v-if="routetype != 'snmp'">
							<p
								v-for="(option,optionname) in section.options"
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
										:id="section.id"
										:update="true"
										:rowsectiondata="section"
										:template="section.template"
										@reloadTemplate="reloadTemplate"
									/>
									<delete-item-modal 
										:id="section.id"
										:name="section.name"
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
		<b-row  
			v-if="rowdata.length"
		>
			<b-col>
				<div 
					v-if="loading"
					class="ocs-loader"
				>
					<Loader />
				</div>
				<Datatable
					v-else
					id="fields-datatable"
					:canedit="true"
					:candelete="true"
					:rowdata="rowdata"
					:usecheckbox="false"
					:rowheader="rowheader"
					title="fields"
					translationkey="template."
					editcomponent="FieldModal"
					@reloadDatatable="reloadDatatable"
				/>
			</b-col>
		</b-row>
		<div v-else>
			<Alert 
				:message="$t('message.no_field')" 
				variant="info"
			/>
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
			errored: false,
			errormsg: null,
			rowheader: [],
			rowdata: [],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	async mounted() {
		await this.getHeader()
		await this.getFields()
	},
	methods: {
		async getHeader() {
			this.loading = true
			this.rowheader = []
			for (const field of this.section.fields) {
				if (this.routetype == "assets") {
					const keys = Object.keys(field).filter(key => key !== 'section')
					this.rowheader.push(...keys)
				} else {
					this.rowheader = ["id", "name", "retrival_value"]
				}
			}
		},
		async getFields() {
			for (const field of this.section.fields) {
				var options = ""
				if (field.options) {
					for (const [key, value] of Object.entries(field.options)) {
						options += key + " : " + value + "\n"
					}
				}
				field.options = options.trim()
			}
			this.rowdata = this.section.fields
			this.loading = false
		},
		async reloadTemplate() {
			this.$emit('reloadTemplate')
		},
		async reloadDatatable() {
			this.loading = true
			await axios.get(this.$config.BACKEND_API_ROUTE+"fields/?section="+this.section.id,
				{ headers: this.header })
				.then(response => {
					if (this.routetype == "snmp") {
						this.rowheader = ["id", "name", "retrival_value"]
					}
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
