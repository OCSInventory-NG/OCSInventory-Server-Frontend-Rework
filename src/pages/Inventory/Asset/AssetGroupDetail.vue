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
											title="assetgroups"
											translationkey="inventory."
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
import Axios from 'axios'
import Loader from '@/components/Loader/Loader'
import Datatable from '@/components/Datatable/Datatable'
import Alert from '@/components/Alert/Alert'
import PageHeader from '@/components/Header/PageHeader'
import Search from '@/components/Filter/Search'

export default {
	name: 'AssetGroupDetail',
	components: { Loader, Datatable, Alert, PageHeader, Search },
	data() {
		return {
			errorMsg: null,
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
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	mounted() {
		this.getHeader()
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
					this.getAssetGroup()
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
		},
		getAssetGroup() {
			Axios.get(process.env.VUE_APP_API_ROUTE+"asset/groups/"+this.$route.params.id, { headers: this.header })
				.then(response => {
					this.assets = response.data.assets
					delete response.data.assets
					this.groupinfo = response.data
					this.errorMsg = null
					this.errored = false
					this.getUserName()
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
		},
		getUserName() {
			Axios.get(process.env.VUE_APP_API_ROUTE+"users/"+this.groupinfo.user, { headers: this.header })
				.then(response => {
					if(response.data.first_name != "") {
						this.groupinfo.user = response.data.last_name.concat(" ", response.data.first_name)
					} else {
						this.groupinfo.user = response.data.username
					}
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
			this.getGroups()
		},
		getGroups() {
			this.groups = []
			if(this.groupinfo.groups) {
				for (const group of this.groupinfo.groups) {
					Axios.get(process.env.VUE_APP_API_ROUTE+"groups/"+group, { headers: this.header })
						.then(response => {
							this.groups.push(response.data.name)
							this.groupinfo.groups = this.groups.join(", ")
						})
						.catch(e => {
							this.errorMsg = e.message
							this.errored = true
						})
				}
			}
			this.getAssets()
		},
		getAssets() {
			this.rowdata = []
			for (const asset of this.assets) {
				this.loading = true
				Axios.get(process.env.VUE_APP_API_ROUTE+"asset/bases/"+asset, { headers: this.header })
					.then(response => {
						this.rowdata.push(response.data)
					})
					.catch(e => {
						this.errorMsg = e.message
						this.errored = true
					})
					.finally(() => this.loading = false)
			}
			this.loading = false
		}
	}
}
</script>