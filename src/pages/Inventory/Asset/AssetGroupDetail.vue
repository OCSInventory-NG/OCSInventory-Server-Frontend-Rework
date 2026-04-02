<template>
	<div 
		id="asset-group-detail" 
		class="container-xl"
	>
		<div>
			<PageHeader :page-title="groupinfo.name" />

			<div class="page-body">
				<div class="card">
					<div class="card-body">
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
												@reload-deployment="reloadDeployment"
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
										{{ formatDate(groupinfo.last_updated, 'last_updated') }}
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
											:usecheckbox="true"
											:removefromgroup="true"
											:assetgroupid="id"
											:assets="rowdata"
											:hiddenfields="hiddenfields"
											:isbusy="isbusy"
											is-sticky
											title="asset"
											translationkey="inventory."
											@reload-datatable="reloadDatatable()"
										/>
									</b-tab>
									<b-tab
										:title="$t('title.deployment')"
									>
										<ResultDetail
											:group="$route.params.id"
											:reload="reload"
											@end-reload-deployment="endReloadDeployment"
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
export default {
	name: 'AssetGroupDetail',
	data() {
		return {
			errored: false,
			errormsg: null,

			rowdata: [],
			groupinfo: [],
			rowheader: [],
			user: null,
			groups: [],
			assets: [],
			reload: false,
			id: null,
			hiddenfields: ["id", "uuid", "template", "agent", "is_template_forced"],
			
			canedit: false,
			candelete: true,
			
			isbusy: true,
			loading: true,
		}
	},
	async mounted() {
		this.id = this.$route.params.id
		// Data init
		await this.loadInitial()
	},
	methods: {
		async loadInitial() {
			this.loading = true
			this.isbusy = true
			try {
				// Get header
				const header = await this.$api.generic.options("asset/bases/")
				this.rowheader = Object.keys(header.actions.POST).filter(
					(f) => !["matched"].includes(f)
				)

				// Get asset group
				await this.getAssetGroup()

				this.errored = false
				this.errormsg = null
			} catch (e) {
				this.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.errored = true
			} finally {
				this.loading = false
				this.isbusy = false
			}
		},

		async getAssetGroup(reload = false) {
			this.isbusy = true

			try {
				const data = await this.$api.generic.get(
					`asset/groups/${this.$route.params.id}/`,
					{},
					{ expand: "assets,user,groups" }
				)

				this.rowdata = Array.isArray(data?.assets) ? data.assets : []

				if (!reload) {
					const user = data?.user || {}
					const fullName = (user.first_name && user.first_name !== "")
						? `${user.last_name} ${user.first_name}`
						: user.username

					const groupsText = Array.isArray(data?.groups)
						? data.groups.map((g) => g?.name).filter(Boolean).join("\n")
						: ""

					const { assets: _assets, ...groupinfo } = data

					this.groupinfo = {
						...groupinfo,
						user: fullName,
						groups: groupsText,
					}
				}

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			} finally {
				this.loading = false
				this.isbusy = false
			}
		},

		reloadDeployment() {
			this.reload = true
		},

		endReloadDeployment() {
			this.reload = false
		},

		async reloadDatatable() {
			await this.getAssetGroup(true)
		},

		formatDate(value, key) {
			const dateFields = ['last_updated', 'created_at', 'updated_at']
			if (this.$te('inventory.' + value)) return this.$t('inventory.' + value)
			if (dateFields.includes(key)) {
				return new Date(value).toLocaleString(this.$i18n.locale)
			}
			return value
		},
	}
}
</script>