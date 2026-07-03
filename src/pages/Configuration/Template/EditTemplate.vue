<template>
	<div 
		id="edit-template"
		class="container-xl"
	>
		<div>
			<PageHeader page-title="edittemplate" />

			<div class="page-body">
				<div class="card">
					<div class="card-body">
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
											@reload-datatable="reloadTemplate"
										/>
										<TemplateHistoryModal
											:id="parseInt(id)"
											:view-only="viewOnly"
											@reload-template="reloadTemplate"
										/>
									</div>
								</b-col>
								<b-col cols="4">
									<SectionModal
										:template="parseInt(id)"
										:routetype="routetype"
										:view-only="viewOnly"
										@reload-template="reloadTemplate"
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
											@reload-template="reloadTemplate"
										/>
									</b-tab>
								</b-tabs>
							</div>
							<div v-else>
								<Alert 
									:message="$t('message.no_section')" 
									:cols="true"
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
export default {
	name: 'EditTemplate',
	props: {
		id: { type: String, required: true },
	},
	data() {
		return {
			errored: false,
			errormsg: null,

			successmsg: null,
			successed: false,

			template: [],
			sections: [],
			routetype: "assets",

			loading: true,
		}
	},
	computed: {
		viewOnly() {
			return !localStorage.getItem('permissions') ?.split(',').includes('template_change_template')
		}
	},
	watch: {
		successed: function() {
			setTimeout(() => this.successed = false, 5000)
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
			this.loading = true

			try {
				const data = await this.$api.generic.get(
					`templates/${this.id}/`,
					{},
					{ expand: "*" }
				)

				this.template = data
				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			}
		},

		async getSections() {
			try {
				const data = await this.$api.generic.get(
					"sections/",
					{},
					{ template: this.id }
				)

				const sections = Array.isArray(data) ? data : (data?.results || [])

				this.sections = sections.sort((a, b) =>
					(a?.name || "").localeCompare(b?.name || "")
				)

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		async reloadTemplate() {
			try {
				await Promise.all([
					this.getTemplate(),
					this.getSections(),
				])
			} finally {
				this.loading = false
			}
		},

		formatDate(value, key) {
			const dateFields = ['last_update', 'last_updated', 'timestamp', 'date_created']
			if (this.$te('inventory.' + value)) return this.$t('inventory.' + value)
			if (dateFields.includes(key)) {
				return new Date(value).toLocaleString(this.$i18n.locale)
			}
			return value
		},
	}
}
</script>
