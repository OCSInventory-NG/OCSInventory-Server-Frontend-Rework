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
			await axios.get(this.$config.BACKEND_API_ROUTE+"search/save/", { headers: this.header })
				.then(response => {
					for (const search of response.data) {
						delete search.last_updated
						search.visibility = this.$t("search."+search.visibility)
						search.allow_group_modification = this.$t("generic."+search.allow_group_modification)
						this.rowdata.push(search)
					}

					this.rowdata = response.data
					this.errormsg = null
					this.errored = false
					this.getUserName()
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		async getUserName() {
			for (const search of this.rowdata) {
				await axios.get(this.$config.BACKEND_API_ROUTE+"users/"+search.user, { headers: this.header })
					.then(response => {
						if(response.data.first_name != "") {
							search.user = response.data.last_name.concat(" ", response.data.first_name)
						} else {
							search.user = response.data.username
						}
					})
					.catch(e => {
						this.errormsg = e.message
						this.errored = true
					})
			}
			this.getGroups()
		},
		async getGroups() {
			for (const [key, search] of Object.entries(this.rowdata)) {
				this.groups[key] = []
				if(search.groups) {
					for (const group of search.groups) {
						this.loading = true
						await axios.get(this.$config.BACKEND_API_ROUTE+"groups/"+group, { headers: this.header })
							.then(response => {
								this.loading = true
								this.groups[key].push(response.data.name)
								this.rowdata[key].groups = this.groups[key].join(", ")
							})
							.catch(e => {
								this.errormsg = e.message
								this.errored = true
							})
							.finally(() => { this.loading = false })
					}
					if(this.rowdata[key].groups.length == 0) {
						this.rowdata[key].groups = null
					}
				}
			}

			this.loading = false
		},
		async executeSavedSearch(id) {
			this.rowdata.forEach(search => {
				console.log(this.rowdata)
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
			await this.getSavedSearches()
		}
	}
}
</script>