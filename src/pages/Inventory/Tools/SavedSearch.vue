<template>
	<div
		id="saved-search"
		class="container-xl"
	>
		<div>
			<!-- Page header -->
			<PageHeader 
				page-title="savedsearch"
			/>
			<!-- Display Collapse -->
			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<!-- Error box message -->
						<section v-if="errored">
							<Alert 
								:message="errormsg" 
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
								title="search/save"
								translationkey="search."
								editcomponent="SaveSearchModal"
								@reloadDatatable="reloadDatatable"
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
import axios from 'axios'

export default {
	name: "SavedSearch",
	data() {
		return {
			rowdata: [],
			rowheader: [],
			canedit: false,
			candelete: false,
			loading: true,
			errored: false,
			errormsg: null,
			user: null,
			groups: [],
			hiddenfields: ["allow_group_modification"],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	async mounted() {
		if(localStorage.getItem('permissions').split(",").includes("search_change_search")) {
			this.canedit = true
		}
		if(localStorage.getItem('permissions').split(",").includes("search_delete_search")) {
			this.candelete = true
		}

		await this.getHeader()
	},
	methods: {
		async getHeader() {
			await axios.options(this.$config.BACKEND_API_ROUTE+"search/save/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						if(field != "search" && field != "last_updated") {
							this.rowheader.push(field)
						}
					})
					this.errormsg = null
					this.errored = false
					this.getSavedSearches()
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		async getSavedSearches() {
			this.rowdata = []
			this.loading = true
			await axios.get(this.$config.BACKEND_API_ROUTE+"search/save?expand=user,groups", { headers: this.header })
				.then(response => {
					for (const search of response.data) {
						delete search.last_updated
						search.visibility = this.$t("search."+search.visibility)
						search.allow_group_modification = this.$t("generic."+search.allow_group_modification)
						search.user = (search.user.first_name != "") ?
							search.user.last_name.concat(" ", search.user.first_name) :
							search.user.username
						var tmpGroup = ""
						if (search.groups) {
							for (const expand of search.groups) {
								tmpGroup += expand.name + "\n"
							}
						}
						search.groups = tmpGroup
						this.rowdata.push(search)
					}

					this.rowdata = response.data
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
				.finally(() => { this.loading = false })
		},
		async executeSavedSearch(id) {
			this.rowdata.forEach(search => {
				if(id == search.id) {
					localStorage.setItem('multisearch', JSON.stringify(search.search))
					localStorage.setItem('useSavedSearch', true)
				}
			})
			this.$router.push({
				name: 'Multisearch',
			});
		},
		async reloadDatatable() {
			this.loading = true
			await this.getSavedSearches()
		}
	}
}
</script>