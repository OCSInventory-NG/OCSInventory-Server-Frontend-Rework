<template>
	<div 
		id="assets" 
		class="container-xl"
	>
		<!-- Error box message -->
		<section v-if="errored">
			<Alert 
				:message="errorMsg" 
				variant="danger"
			/>
		</section>

		<section v-else>
			<div v-if="loading">
				<Loader />
			</div>

			<div v-else>
				<!-- Page header -->
				<PageHeader 
					page-title="assets"
				/>
				<!-- Display Datatable -->
				<div class="page-body">
					<div class="card">
						<div class="card-body">
							<Datatable
								id="assets-datatable"
								:rowdata="rowdata"
								:usecheckbox="false"
								title="assets"
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<script>
import Axios from 'axios'
import i18n from '../../../i18n'
import Loader from '@/components/Loader/Loader'
import Datatable from '@/components/Datatable/Datatable'
import Alert from '@/components/Alert/Alert'
import PageHeader from '@/components/Header/PageHeader' 

export default {
	name: 'Assets',
	components: { Loader, Datatable, Alert, PageHeader },
	data() {
		return {
			errorMsg: null,
			rowdata: [],
			loading: true,
			errored: false,
		}
	},
	mounted() {
		const header = {
			"Content-Type": "application/json;charset=utf-8",
			"Authorization": 'Token ' + localStorage.getItem('token_authentication')
		}
		if(localStorage.getItem('permissions').split(",").includes("view_base")) {
			Axios.get(process.env.VUE_APP_API_ROUTE+"asset/bases/", { headers: header })
				.then(response => {
					this.rowdata = response.data
					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		} else {
			this.errorMsg = i18n.t("dont_have_right_to_see")
			this.errored = true
			this.loading = false
		}
	}
}
</script>