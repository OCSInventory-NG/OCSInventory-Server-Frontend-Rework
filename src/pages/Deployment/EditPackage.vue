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
									<p>{{ $t('deployment.date_created') }} : {{ rowpackagedata.date_created }}</p>
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
	mounted() {
		this.getHeader()
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
		getHeader() {
			axios.options(this.$config.BACKEND_API_ROUTE+"deployment/actions?package="+this.id, { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						this.rowheader.push(field)
					})
					this.errormsg = null
					this.errored = false
					this.getPackage()
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		getPackage(reload = false) {
			axios.get(this.$config.BACKEND_API_ROUTE+"deployment/packages/"+this.id, { headers: this.header })
				.then(response => {
					if(!reload) {
						this.rowpackagedata = response.data
					}
					this.rowactiondata = response.data.actions_list
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		reloadDatatable() {
			this.loading = true
			this.getPackage(true)
		},
		reloadPackage() {
			this.loading = true
			this.getPackage()
		}
	}
}
</script>
