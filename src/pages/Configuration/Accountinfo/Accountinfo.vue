<template>
	<div 
		id="accountinfo"
		class="container-xl"
	>
		<div>
			<!-- Page header -->
			<PageHeader 
				page-title="accountinfo"
			/>
			<!-- Display Datatable -->
			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<!-- Error box message -->
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
							<AccountinfoModal
								v-if="canadd"
								@reloadDatatable="reloadDatatable"
							/>
							<Datatable
								id="accountinfodatatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								:canedit="canedit"
								:candelete="candelete"
								:canaddvalue="canaddvalue"
								editcomponent="AccountinfoModal"
								title="accountinfo/config"
								titlevalue="accountinfo_param"
								adddvalueroute="accountinfo/value"
								reconciliationname="accountinfo_config"
								translationkey="accountinfo."
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
import axios from 'axios'

export default {
	name: "Accountinfo",
	data() {
		return {
			canadd: false,
			canedit: false,
			candelete: false,
			canaddvalue: false,
			canview: false,
			rowdata: [],
			rowheader: [],
			config: [],
			errored: false,
			errormsg: null,
			loading: true,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	async mounted() {
		if(localStorage.getItem('permissions').split(",").includes("accountinfo_view_accountinfoconfig")) {
			this.canview = true
			if(localStorage.getItem('permissions').split(",").includes("accountinfo_add_accountinfoconfig")) {
				this.canadd = true
			}
			if(localStorage.getItem('permissions').split(",").includes("accountinfo_change_accountinfoconfig")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("accountinfo_delete_accountinfoconfig")) {
				this.candelete = true
			}
			if(localStorage.getItem('permissions').split(",").includes("accountinfo_add_accountinfovalue")) {
				this.canaddvalue = true
			}
			await this.getHeader()
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
		}
	},
	methods: {
		async getHeader() {
			await axios.options(this.$config.BACKEND_API_ROUTE+"accountinfo/config/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						this.rowheader.push(field)
					})
					this.errormsg = null
					this.errored = false
					this.getAccountinfoConfig()
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
		},
		async getAccountinfoConfig() {
			await axios.get(this.$config.BACKEND_API_ROUTE+"accountinfo/config/?expand=accountinfo_values",
				{ headers: this.header })
				.then(response => {
					this.config = response.data
					this.accountinfovaluesTreatment()
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
		},
		accountinfovaluesTreatment() {
			Object.keys(this.config).forEach(key => {
				var tmpValues = []
				for (const accountvalue of this.config[key].accountinfo_values) {
					tmpValues.push(accountvalue.value)
				}
				this.config[key].accountinfo_values = tmpValues.join('\n')
			})

			this.rowdata = this.config
			this.loading = false
		},
		async reloadDatatable() {
			this.loading = true
			await this.getAccountinfoConfig()
		}
	}
}
</script>