<template>
	<div
		id="saved-search"
		class="container-xl"
	>
		<div>
			<PageHeader page-title="savedsearch" />

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
							<Datatable
								id="savedsearch-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:canedit="canedit"
								:candelete="candelete"
								:hiddenfields="hiddenfields"
								:isbusy="isbusy"
								title="search/save"
								translationkey="search."
								editcomponent="SaveSearchModal"
								@reload-datatable="reloadDatatable"
							>
								<template #cell(firstActions)="row">
									<button
										:title="$t('search.execute')"
										class="btn btn-ghost-warning rounded"
										@click="executeSavedSearch(row.row.item.id)"
									>
										<font-awesome-icon 
											:icon="['fas', 'wand-magic-sparkles']"
										/>
									</button>
								</template>
							</Datatable>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "SavedSearch",
	data() {
		return {
			errored: false,
			errormsg: null,

			canedit: false,
			candelete: false,

			rowdata: [],
			rowheader: [],
			user: null,
			groups: [],
			hiddenfields: ["allow_group_modification"],
			
			isbusy: true,
			loading: true,
		}
	},
	async mounted() {
		const rawPermissions = localStorage.getItem("permissions")
		const permissions = rawPermissions ? rawPermissions.split(",") : []

		if (!permissions.includes("search_view_search")) {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
			this.isbusy = false
			return
		}
		this.canedit = permissions.includes("search_change_search")
		this.candelete = permissions.includes("search_delete_search")

		// Data init
		await this.loadInitial()
	},
	methods: {
		async loadInitial() {
			this.loading = true
			this.isbusy = true
			try {
				// Get header
				const header = await this.$api.generic.options("search/save/")
				this.rowheader = Object.keys(header.actions.POST).filter(
					(f) => !["search", "last_updated"].includes(f)
				)

				// Get saved searches
				await this.getSavedSearches()

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

		async getSavedSearches() {
			this.rowdata = []
			this.isbusy = true

			try {
				const data = await this.$api.generic.get(
					"search/save/",
					{},
					{ expand: "user,groups" }
				)

				const searches = Array.isArray(data) ? data : (data?.results || [])

				this.rowdata = searches.map((s) => {
					const user = s?.user || {}
					const fullName = (user.first_name && user.first_name !== "")
						? `${user.last_name} ${user.first_name}`
						: user.username

					const groupsText = Array.isArray(s?.groups)
						? s.groups.map((g) => g?.name).filter(Boolean).join("\n")
						: ""

					const { ...rest } = s

					return {
						...rest,
						visibility: this.$t("search." + s.visibility),
						allow_group_modification: this.$t("generic." + s.allow_group_modification),
						user: fullName,
						groups: groupsText,
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

		async executeSavedSearch(id) {
			const found = (this.rowdata || []).find((s) => s.id === id)
			if (found) {
				localStorage.setItem('multisearch', JSON.stringify(found.search))
				localStorage.setItem('useSavedSearch', true)
			}

			this.$router.push({ name: 'Multisearch' })
		},

		async reloadDatatable() {
			await this.getSavedSearches()
		},
	}
}
</script>