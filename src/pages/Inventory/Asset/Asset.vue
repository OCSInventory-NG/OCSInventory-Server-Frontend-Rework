<template>
	<div 
		id="assets" 
		class="container-xl"
	>
		<div>
			<!-- Page header -->
			<PageHeader 
				page-title="assets"
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
							<Datatable
								id="assets-datatable"
								:rowdata="rowdata"
								:canaccessdetails="true"
								:candelete="candelete"
								:rowheader="rowheader"
								:candeploy="true"
								:usecheckbox="true"
								:hiddenfields="hiddenfields"
								title="asset/bases"
								translationkey="inventory."
								sortby="last_update"
								sortdesc="desc"
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

const timezoneByLang = {
    fr: 'Europe/Paris',
    en: 'UTC',
}

export default {
	name: 'Assets',
	data() {
		return {
			errormsg: null,
			rowdata: [],
			rowheader: [],
			loading: true,
			errored: false,
			candelete: false,
			hiddenfields: ["id", "uuid", "template", "agent", "is_template_forced"],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	async mounted() {
		if(localStorage.getItem('permissions').split(",").includes("inventory_base_view_inventorybase")) {
			if(localStorage.getItem('permissions').split(",").includes("inventory_base_delete_inventorybase")) {
				this.candelete = true
			}
			await this.getHeader()
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
		}
	},
	methods: {
		async getHeader() {
			await axios.options(this.$config.BACKEND_API_ROUTE+"asset/bases/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						if(field != "inventory_sections") {
							this.rowheader.push(field)
						}
					})
					this.errormsg = null
					this.errored = false
					this.getAssets()
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
		},
		async getAssets() {
			try {
				const response = await axios.get(
					this.$config.BACKEND_API_ROUTE+"asset/bases/?accountinfo=true",
					{ headers: this.header }
				)
				const templateResponse = await axios.get(
					this.$config.BACKEND_API_ROUTE+"templates/",
					{ headers: this.header }
				)

				const templates = {}
				templateResponse.data.forEach(template => {
					templates[template.id] = template.name
				})

				response.data.forEach(asset => {
					if (asset.template && templates[asset.template]) {
						asset.template = templates[asset.template]
					}
				})

				const tz = timezoneByLang[this.$i18n.locale] || 'UTC'
				response.data.forEach(asset => {
					if (asset.last_update) {
						asset.last_update = new Date(asset.last_update).toLocaleString(
							this.$i18n.locale, 
							{ timeZone: tz }
						)
					}
				})

				response.data.forEach(data => {
					if(data.accountinfo) {
						Object.keys(data.accountinfo).forEach(accountinfo => {
							if(!this.rowheader.includes("Account info : " + accountinfo)) {
								this.rowheader.push("Account info : " + accountinfo)
							}
							data["Account info : " + accountinfo] = data.accountinfo[accountinfo]
						})
					}
				})

				this.rowdata = response.data
				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			} finally {
				this.loading = false
			}
		},
		async reloadDatatable() {
			this.loading = true
			await this.getAssets()
		},
	}
}
</script>