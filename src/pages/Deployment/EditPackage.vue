<template>
	<div 
		id="edit-package"
		class="container-xl"
	>
		<div>
			<!-- Page header -->
			<PageHeader 
				page-title="actionlist"
			/>

			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<!-- Display error box message -->
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
							<b-row align="center">
								<h2>{{ rowpackagedata.name }}</h2>
							</b-row>
							<b-row align="center">
								<b-col>
									<p>{{ $t('deployment.description') }} : {{ rowpackagedata.description }}</p>
									<p>{{ $t('deployment.target_os') }} : {{ $t('template.'+rowpackagedata.target_os) }}</p>
									<p>{{ $t('deployment.date_created') }} : {{ formatDate(rowpackagedata.date_created, 'date_created') }}</p>
								</b-col>
							</b-row><br>
							<ActionListModal
								v-if="canaddaction"
								:package="id"
								@reloadPackage="reloadPackage"
							/>
							<Draggable 
								:rowdata="rowactiondata"
								:rowheader="rowheader"
								:canedit="caneditaction"
								:candelete="candeleteaction"
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
	name: 'EditPackage',
	props: {
		id: { type: String, required: true }
	},
	data() {
		return {
			errormsg: null,
			rowpackagedata: [],
			rowactiondata: [],
			rowheader: [],
			successmsg: null,
			successed: false,
			loading: true,
			errored: false,
			canaddaction: false,
			caneditaction: false,
			candeleteaction: false,
			excludedFields: [
				"uploaded_file"
			],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		successed: function() {
			setTimeout(() => this.successed = false, 5000)
		}
	},
	async mounted() {
		await this.getHeader()
		if(localStorage.getItem('permissions').split(",").includes("action_add_deploymentaction")) {
			this.canaddaction = true
		}
		if(localStorage.getItem('permissions').split(",").includes("action_change_deploymentaction")) {
			this.caneditaction = true
		}
		if(localStorage.getItem('permissions').split(",").includes("action_delete_deploymentaction")) {
			this.candeleteaction = true
		}
	},
	methods: {
		async getHeader() {
			await axios.options(this.$config.BACKEND_API_ROUTE+"deployment/actions?package="+this.id, { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						if (!this.excludedFields.includes(field)) {
							this.rowheader.push(field)
						}
					})
					this.errormsg = null
					this.errored = false
					this.getPackage()
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
		},
		async getPackage(reload = false) {
			await axios.get(this.$config.BACKEND_API_ROUTE+"deployment/packages/"+this.id+"/?expand=actions_list",
				{ headers: this.header })
				.then(response => {
					if(!reload) {
						this.rowpackagedata = response.data
					}
					this.rowactiondata = []
					for (const action of response.data.actions_list) {
						if (action.file instanceof Object) {
							action.file = action.file.name
						}
						this.rowactiondata.push(action)
					}

					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		async reloadDatatable() {
			this.loading = true
			await this.getPackage(true)
		},
		async reloadPackage() {
			this.loading = true
			await this.getPackage()
		},
		formatDate(value, key) {
			const dateFields = ['last_updated', 'created_at', 'updated_at','date_created']
			if (this.$te('inventory.' + value)) return this.$t('inventory.' + value)
			if (dateFields.includes(key)) {
				return new Date(value).toLocaleString(this.$i18n.locale)
			}
			return value
    	},
	}
}
</script>
