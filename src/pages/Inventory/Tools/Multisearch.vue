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

						<div 
							v-if="loading"
							class="ocs-loader"
						>
							<Loader />
						</div>

						<div v-else>
							<Search />
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
//import Axios from 'axios'
import i18n from '../../../i18n'
import Loader from '@/components/Loader/Loader'
//import Datatable from '@/components/Datatable/Datatable'
import Alert from '@/components/Alert/Alert'
import PageHeader from '@/components/Header/PageHeader'
import Search from '@/components/Filter/Search'

export default {
	name: "Multisearch",
	components: { Loader, /*Datatable,*/ Alert, PageHeader, Search },
	data() {
		return {
			errorMsg: null,
			rowdata: [],
			rowheader: [],
			loading: false,
			errored: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	mounted() {
		if(localStorage.getItem('permissions').split(",").includes("view_base")) {
			//this.getHeader()
		} else {
			this.errorMsg = i18n.t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
		}
	},
}
</script>