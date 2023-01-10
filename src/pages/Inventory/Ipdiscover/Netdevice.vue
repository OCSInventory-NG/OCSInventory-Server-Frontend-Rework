<template>
	<div 
		id="netdevice" 
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
					page-title="netdevice"
				/>
				<!-- Display Collapse -->
				<div class="page-body">
					<div class="card">
						<div class="card-body">
							<Datatable
								id="netdevice-datatable"
								:rowdata="rowdata"
								:canedit="canedit"
								:candelete="candelete"
								editcomponent="EditNetdeviceModal"
								title="netdevice"
								@reloadDatatable="reloadDatatable"
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
import Alert from '@/components/Alert/Alert'
import PageHeader from '@/components/Header/PageHeader'
import Datatable from '@/components/Datatable/Datatable'

export default {
	name: "Netdevice",
	components: { Loader, Alert, PageHeader, Datatable },
	data() {
		return {
			errorMsg: null,
			rowdata: [],
			loading: true,
			errored: false,
			canedit: false,
			candelete: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	mounted() {
		if(localStorage.getItem('permissions').split(",").includes("view_netdevice")) {
			if(localStorage.getItem('permissions').split(",").includes("change_netdevice")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("delete_netdevice")) {
				this.candelete = true
			}
			this.getNetdevice()
		} else {
			this.errorMsg = i18n.t("dont_have_right_to_see")
			this.errored = true
			this.loading = false
		}
	},
	methods: {
		// Retrieve netdevice
		getNetdevice() {
			Axios.get(process.env.VUE_APP_API_ROUTE+"netdevices?network="+this.$route.params.id, { headers: this.header })
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
		},
		reloadDatatable() {
			this.getNetdevice()
		}
	}
}
</script>