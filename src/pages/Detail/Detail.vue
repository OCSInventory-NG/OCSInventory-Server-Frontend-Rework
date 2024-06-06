<template>
	<div 
		id="detail" 
		class="container-xl"
	>
		<div>
			<!-- Page header for asset -->
			<PageHeader 
				v-if="rowdata.name"
				:page-title="rowdata.name"
			/>

			<!-- Page header for netdevice -->
			<PageHeader 
				v-if="rowdata.netname"
				:page-title="rowdata.netname"
			/>

			<!-- Display details -->
			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<!-- Error box message -->
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
							<div v-if="type == 'ASSET'">
								<b-row class="asset-btn responsive">
									<div
										class="col-1"
										align="right"
									>
										<b-button-group class="mr-1">
											<PackageResultModal
												:items="deployment"
												@reloadDeployment="reloadDeployment"
											/>
										</b-button-group>
									</div>
									<div class="col-1">
										<router-link 
											:to="'/inventory/inventory_logs/'+$route.params.id"
											:title="$t('inventory.see_logs')"
											class="btn datatable-btn mr-1"
										>
											<font-awesome-icon 
												:icon="['far', 'file-lines']"
											/>
										</router-link>
									</div>
								</b-row>
							</div>

							<div class="hr-text">
								{{ $t("generic.information") }}
							</div>
							<div class="datagrid">
								<div 
									v-for="(value,key) in rowdata"
									:key="key"
									class="datagrid-item"
								>
									<div class="datagrid-title">
										{{ $t(translationkey+key) }}
									</div>
									<div class="datagrid-content">
										{{ value }}
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
										:title="$t('title.accountinfo')"
									>
										<fieldset class="form-fieldset">
											<Accountinfo
												:id="rowdata.id"
												:type="type"
												:canedit="canedit"
												:slug="slug"
											/>
										</fieldset>
									</b-tab>
									<b-tab
										v-if="type == 'ASSET'"
										:title="$t('title.inventory')"
										active
									>
										<Inventory
											:id="$route.params.id"
										/>
									</b-tab>
									<b-tab 
										v-if="type == 'ASSET'"
										:title="$t('title.deployment')"
									>
										<ResultDetail
											:id="$route.params.id"
											:reload="reload"
											@endReloadDeployment="endReloadDeployment"
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
	name: 'Detail',
	data() {
		return {
			errormsg: null,
			rowdata: [],
			loading: true,
			errored: false,
			canedit: true,
			type: null,
			slug: null,
			translationkey: null,
			id: null,
			reload: false,
			deployment: [],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	mounted() {
		var extendedRoute = null
		if(this.$route.params.type == 'asset') {
			extendedRoute = "asset/bases/"+this.$route.params.id
			this.type = "ASSET"
			this.slug = "inventory_base.inventorybase"
			this.translationkey = "inventory."
			if(this.$route.params.id) this.id = this.$route.params.id
		}
		if(this.$route.params.type == 'netdevice') {
			extendedRoute = "netdevices/"+this.$route.params.id
			this.type = "IPDISCOVER"
			this.slug = "netdevice.netdevice"
			this.translationkey = "network."
		}

		axios.get(import.meta.env.VITE_APP_API_ROUTE+extendedRoute, { headers: this.header })
			.then(response => {
				delete response.data.inventory_sections
				this.rowdata = response.data
				this.deployment.push(response.data)
				this.errormsg = null
				this.errored = false
				this.loading = false
			})
			.catch(e => {
				this.errormsg = e.message
				this.errored = true
			})
	},
	methods: {
		reloadDeployment() {
			this.reload = true
		},
		endReloadDeployment() {
			this.reload = false
		}
	}
}
</script>