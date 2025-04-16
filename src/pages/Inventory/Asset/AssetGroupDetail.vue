<template>
	<div 
		id="asset-group-detail" 
		class="container-xl"
	>
		<div>
			<!-- Page header -->
			<PageHeader 
				:page-title="groupinfo.name"
			/>
			<!-- Display Datatable -->
			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<!-- Error box message -->
						<div v-if="errored">
							<Alert 
								:message="errormsg" 
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
							<div>
								<b-row class="asset-btn responsive">
									<div
										class="col-1"
										align="right"
									>
										<b-button-group class="mr-1">
											<PackageResultModal
												:items="rowdata"
												:group="$route.params.id"
												@reloadDeployment="reloadDeployment"
											/>
										</b-button-group>
									</div>
								</b-row>
							</div>
							<div class="hr-text">
								{{ $t("generic.information") }}
							</div>
							<div class="datagrid">
								<div class="datagrid-item">
									<div class="datagrid-title">
										{{ $t("assetgroup.name") }}
									</div>
									<div class="datagrid-content">
										{{ groupinfo.name }}
									</div>
								</div>
								<div class="datagrid-item">
									<div class="datagrid-title">
										{{ $t("assetgroup.description") }}
									</div>
									<div class="datagrid-content">
										{{ groupinfo.description }}
									</div>
								</div>
								<div class="datagrid-item">
									<div class="datagrid-title">
										{{ $t("assetgroup.is_dynamic") }}
									</div>
									<div class="datagrid-content">
										{{ $t("generic."+groupinfo.is_dynamic) }}
									</div>
								</div>
								<div class="datagrid-item">
									<div class="datagrid-title">
										{{ $t("assetgroup.last_updated") }}
									</div>
									<div class="datagrid-content">
										{{ groupinfo.last_updated }}
									</div>
								</div>
								<div class="datagrid-item">
									<div class="datagrid-title">
										{{ $t("assetgroup.visibility") }}
									</div>
									<div class="datagrid-content">
										{{ $t("assetgroup."+groupinfo.visibility) }}
									</div>
								</div>
								<div class="datagrid-item">
									<div class="datagrid-title">
										{{ $t("assetgroup.allow_group_modification") }}
									</div>
									<div class="datagrid-content">
										{{ $t("generic."+groupinfo.allow_group_modification) }}
									</div>
								</div>
								<div class="datagrid-item">
									<div class="datagrid-title">
										{{ $t("assetgroup.groups") }}
									</div>
									<div class="datagrid-content">
										{{ groupinfo.groups }}
									</div>
								</div>
								<div class="datagrid-item">
									<div class="datagrid-title">
										{{ $t("assetgroup.user") }}
									</div>
									<div class="datagrid-content">
										{{ groupinfo.user }}
									</div>
								</div>
							</div>
							<br><br>
							<div>
								<b-tabs
									content-class="mt-3"
									fill
								>
									<b-tab
										:title="$t('assetgroup.allassetsincache')"
									>
										<Datatable
											id="assetgroupdetail-datatable"
											:rowdata="rowdata"
											:canaccessdetails="true"
											:canedit="canedit"
											:candelete="candelete"
											:rowheader="rowheader"
											:usecheckbox="false"
											title="asset"
											translationkey="inventory."
										/>
									</b-tab>
									<b-tab
										:title="$t('title.deployment')"
									>
										<ResultDetail
											:group="$route.params.id"
											:reload="reload"
											@endReloadDeployment="endReloadDeployment"
										/>
									</b-tab>
									<b-tab
										v-if="groupinfo.is_dynamic == true"
										:title="$t('assetgroup.associatedsearch')"
									>
										<Search 
											:searchgroup="groupinfo.search"
											:disableforgroup="true"
										/>
									</b-tab>
								</b-tabs>
							</div>
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
	name: 'AssetGroupDetail',
	data() {
		return {
			errormsg: null,
			rowdata: [],
			groupinfo: [],
			rowheader: [],
			loading: true,
			errored: false,
			user: null,
			groups: [],
			assets: [],
			canedit: false,
			candelete: false,
			reload: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	async mounted() {
		await this.getHeader()
	},
	methods: {
		async getHeader() {
			await axios.options(this.$config.BACKEND_API_ROUTE+"asset/bases/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						this.rowheader.push(field)
					})
					this.errormsg = null
					this.errored = false
					this.getAssetGroup()
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		async getAssetGroup() {
			await axios.get(this.$config.BACKEND_API_ROUTE+"asset/groups/"+this.$route.params.id+"?expand=assets,user,groups",
				{ headers: this.header })
				.then(response => {
					this.rowdata = []
					this.rowdata = response.data.assets
					delete response.data.assets
					this.groupinfo = response.data
					this.groupinfo.user = (this.groupinfo.user.first_name != "") ?
						this.groupinfo.user.last_name.concat(" ", this.groupinfo.user.first_name) :
						this.groupinfo.user.username
					var tmpGroup = ""
					if (response.data.groups) {
						for (const expand of response.data.groups) {
							tmpGroup += expand.name + "\n"
						}
					}
					this.groupinfo.groups = tmpGroup
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		reloadDeployment() {
			this.reload = true
		},
		endReloadDeployment() {
			this.reload = false
		}
	}
}
</script>