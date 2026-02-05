<template>
	<div 
		id="edit-template"
		class="container-xl"
	>
		<div>
			<!-- Page header -->
			<PageHeader 
				page-title="edittemplate"
			/>

			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<!-- Display error box message -->
						<section v-if="errored">
							<Alert 
								:message="errormsg"
								:cols="true"
								variant="danger"
							/>
						</section>
						<div 
							v-if="loading"
							class="ocs-loader"
						>
							<Loader />
						</div>
						<div v-else>
							<b-row class="text-center">
								<b-col cols="4" />
								<b-col cols="4">
									<div class="d-flex justify-content-center align-items-center">
										<h2 class="mb-0 mr-2">
											{{ template.name }}
										</h2>
										<TemplateModal
											:id="id"
											:update="true"
											:view-only="viewOnly"
											@reloadDatatable="reloadTemplate"
										/>
									</div>
								</b-col>
								<b-col cols="4">
									<SectionModal
										:template="parseInt(id)"
										:routetype="routetype"
										:view-only="viewOnly"
										@reloadTemplate="reloadTemplate"
									/>
								</b-col>
							</b-row>
							<b-row class="text-center">
								<b-col>
									<p>
										<span class="datagrid-title">
											{{ $t('inventory.os') }} :
										</span>
										{{ $t("template." + template.os) }}
									</p> 
									<p>
										<span class="datagrid-title">
											{{ $t('inventory.last_update') }} :
										</span>
										{{ formatDate(template.last_update, 'last_update') }}
									</p>
								</b-col>
							</b-row>
							<div v-if="sections.length">
								<b-tabs
									content-class="col-10"
									pills
									card
									vertical
								>
									<b-tab
										v-for="section in sections"
										:key="section.id"
										:title="section.name"
										title-item-class="ocs-menu-tab"
										lazy
									>
										<SectionCollapse
											:section="section"
											:routetype="routetype"
											:view-only="viewOnly"
											@reloadTemplate="reloadTemplate"
										/>
									</b-tab>
								</b-tabs>
							</div>
							<div v-else>
								<Alert 
									:message="$t('message.no_section')" 
									variant="info"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import axios from 'axios'

export default {
	name: 'EditTemplate',
	props: {
		id: { type: String, required: true },
	},
	data() {
		return {
			errormsg: null,
			template: [],
			sections: [],
			successmsg: null,
			successed: false,
			loading: true,
			errored: false,
			routetype: "assets",
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	computed: {
		viewOnly() {
			return !localStorage.getItem('permissions') ?.split(',').includes('template_change_template')
		}
	},
	watch: {
		successed: function() {
			setTimeout(() => this.successed = false, 10000)
		}
	},
	beforeMount() {
		if(this.$route.path.includes("snmp")) {
			this.routetype = "snmp"
		}
	},
	async mounted() {
		await this.getTemplate()
		await this.getSections()
	},
	methods: {
		async getTemplate() {
			await axios.get(this.$config.BACKEND_API_ROUTE+"templates/"+this.id+"/?expand=*", { headers: this.header })
				.then(response => {
					this.template = response.data
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
		},
		async getSections() {
			await axios.get(this.$config.BACKEND_API_ROUTE+"sections/?template="+this.id,
				{ headers: this.header })
				.then(response => {
					this.sections = response.data
					this.sections.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
				.finally(() => {this.loading = false})
		},
		async reloadTemplate() {
			this.loading = true
			await this.getTemplate()
			await this.getSections()
		},
		formatDate(value, key) {
			const dateFields = ['last_update', 'last_updated', 'timestamp', 'date_created']
			if (this.$te('inventory.' + value)) return this.$t('inventory.' + value)
			if (dateFields.includes(key)) {
				return new Date(value).toLocaleString(this.$i18n.locale)
			}
			return value
		}
	}
}
</script>
