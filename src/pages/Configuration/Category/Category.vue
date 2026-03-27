<template>
	<div
		id="category" 
		class="container-xl"
	>
		<div>
			<PageHeader page-title="category" />

			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<div v-if="errored">
							<Alert 
								:message="errormsg"
								:cols="true"
								variant="danger"
							/>
						</div>

						<div 
							v-if="loading"
							class="ocs-loader"
						>
							<Loader />
						</div>

						<div v-else>
							<CategoryModal
								v-if="canadd"
								@reloadDatatable="reloadDatatable"
							/>

							<Datatable
								id="categories-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:canedit="canedit"
								:candelete="candelete"
								:isbusy="isbusy"
								is-sticky
								editcomponent="CategoryModal"
								title="categories"
								translationkey="template."
								@reloadDatatable="reloadDatatable"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'Category',
	data() {
		return {
			errored: false,
			errormsg: null,

			canadd: false,
			canedit: false,
			candelete: false,
			canview: false,

			rowdata: [],
			rowheader: [],
			templates: [],

			isbusy: true,
			loading: true,
		}
	},
	async mounted() {
		const rawPermissions = localStorage.getItem('permissions')
		const permissions = rawPermissions ? rawPermissions.split(",") : []

		if (permissions.includes("category_view_category")) {
			this.canview = true
			if (permissions.includes("category_add_category")) {
				this.canadd = true
			}
			if (permissions.includes("category_change_category")) {
				this.canedit = true
			}
			if (permissions.includes("category_delete_category")) {
				this.candelete = true
			}
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
			this.isbusy = false
			return
		}

		// Data init
		await this.loadInitial()
	},
	methods: {
		async loadInitial() {
			this.loading = true
			this.isbusy = true
			try {
				// Get header
				const header = await this.$api.generic.options("categories/")
				this.rowheader = Object.keys(header.actions.POST).filter(
					(f) => !["inventory_sections", "is_protected"].includes(f)
				)
				this.rowheader.push("sections")

				// Get templates
				await this.getTemplates()
				// Get categories
				await this.getCategories()

				this.errored = false
				this.errormsg = null
			} catch (e) {
				this.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.errored = true
			} finally {
				this.loading = false
				this.isbusy = false
			}
		},

		async getCategories() {
			this.isbusy = true
			this.rowdata = []

			try {
				const data = await this.$api.generic.get(
					"categories/",
					{},
					{ expand: "inventory_sections" }
				)

				const categories = Array.isArray(data) ? data : (data?.results || [])

				this.rowdata = categories.map((category) => {
					const sections = Array.isArray(category?.inventory_sections)
						? category.inventory_sections
						: []

					const sectionsText = sections
						.map((section) => {
							const tplName = this.templates?.[section.template] ?? section.template
							return `${tplName} - ${section.name}`
						})
						.join("\n")

					return {
						...category,
						sections: sectionsText,
					}
				})

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			} finally {
				this.isbusy = false
			}
		},

		async getTemplates() {
			try {
				const data = await this.$api.generic.get("templates/")
				const templates = Array.isArray(data) ? data : (data?.results || [])

				this.templates = templates.reduce((acc, tpl) => {
					acc[tpl.id] = tpl.name
					return acc
				}, this.templates || {})

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			}
		},

		async reloadDatatable() {
			await this.getCategories()
		}
	}
}
</script>