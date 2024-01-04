<template>
	<div 
		id="multisearch" 
		class="container-xl"
	>
		<div>
			<!-- Page header -->
			<PageHeader 
				page-title="multisearch"
			/>
			<!-- Display Datatable -->
			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<!-- Error box message -->
						<div v-if="errored">
							<Alert 
								:message="errorMsg" 
								variant="danger"
							/>
						</div>

						<div>
							<Search
								@reloadDatatable="reloadDatatable"
							/>
						</div>

						<hr>

						<div 
							v-if="loading"
							class="ocs-loader"
						>
							<Loader />
						</div>

						<div v-else>
							<Datatable
								id="search-datatable"
								:rowdata="rowdata"
								:usecheckbox="false"
								:rowheader="rowheader"
								title="search"
								translationkey="inventory."
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import Axios from 'axios'
import i18n from '../../../i18n'
import Loader from '@/components/Loader/Loader'
import Datatable from '@/components/Datatable/Datatable'
import Alert from '@/components/Alert/Alert'
import PageHeader from '@/components/Header/PageHeader'
import Search from '@/components/Filter/Search'

export default {
	name: "Multisearch",
	components: { Loader, Datatable, Alert, PageHeader, Search },
	data() {
		return {
			errorMsg: null,
			rowdata: [],
			rowheader: [],
			rowsearch: [],
			loading: true,
			errored: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	mounted() {
		if(localStorage.getItem('permissions').split(",").includes("view_inventorybase")) {
			this.getHeader()
		} else {
			this.errorMsg = i18n.t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
		}
	},
	methods: {
		getHeader() {
			Axios.options(process.env.VUE_APP_API_ROUTE+"asset/bases/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						this.rowheader.push(field)
					})
					this.errorMsg = null
					this.errored = false

					this.loading = false
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
		},
		reloadDatatable(search) {
			this.rowsearch = search
			
			Axios.post(process.env.VUE_APP_API_ROUTE+"search/", this.rowsearch, { headers: this.header })
				.then(response => {
					this.rowdata = []

					response.data.forEach(element => {
						this.rowdata.push(element.fields)
					})

					this.succesMsg = "success"
					this.successed = true
					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
					this.succesMsg = null
					this.successed = false
				})
		}
	}
}
</script>