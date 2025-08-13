<template>
	<div 
		id="detail" 
		class="container-xl"
	>
		<div>
			<!-- Page header for asset -->
			<PageHeader 
				v-if="device.name"
				:page-title="device.name"
			/>

			<!-- Page header for netdevice -->
			<PageHeader 
				v-if="device.netname || device.ip"
				:page-title="(device.netname) ? device.netname : device.ip"
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
											<button 
												:title="$t('generic.reload')"
												class="form-control btn datatable-btn"
												@click="reloadInventory"
											>
												<font-awesome-icon 
													:icon="['fas', 'arrows-rotate']"
												/>
											</button>&nbsp;&nbsp;
											<PackageResultModal
												v-if="device.osname != 'SNMP'"
												:items="deployment"
												@reloadDeployment="reloadDeployment"
											/>&nbsp;
											<AssetOptionsModal
												:item="deployment"
												@reloadInventory="reloadInventory"
											/>&nbsp;&nbsp;
											<router-link 
												v-if="device.osname != 'SNMP'"
												:to="'/inventory/inventory_logs/'+$route.params.id"
												:title="$t('inventory.see_logs')"
												class="btn datatable-btn mr-1"
											>
												<font-awesome-icon 
													:icon="['far', 'file-lines']"
												/>
											</router-link>
										</b-button-group>
									</div>
									<div class="col-1" />
								</b-row>
								<b-tabs
									content-class="col-10 sticky-tabs"
									pills
									card
									vertical
								>
									<b-tab
										v-for="category in categories"
										:key="category.id"
										:title="$te('category.'+category.name) ? $t('category.'+category.name) : category.name"
										lazy
										@click="scrollToTop()"
									>
										<div v-if="category.id == 1">
											<div class="datagrid">
												<div 
													v-for="(value,key) in device"
													:key="key"
													class="datagrid-item"
												>
													<div class="datagrid-title">
														{{ $t(translationkey+key) }}
													</div>
													<div class="datagrid-content">
														{{ ($te('inventory.'+value)) ? $t('inventory.'+value) : value }}
													</div>
												</div>
											</div><br><br>
											<div align="center">
												<h2>{{ $t("title.accountinfo") }}</h2>
											</div>
											<fieldset class="form-fieldset">
												<Accountinfo
													:id="device.id"
													:type="type"
													:canedit="canedit"
													:slug="slug"
												/>
											</fieldset><br>
										</div>
										<div v-if="category.id == 2 && device.osname != 'SNMP'">
											<div align="center">
												<h2>{{ $t("title.deployment") }}</h2>
											</div>
											<ResultDetail
												:id="$route.params.id"
												:reload="reload"
												@endReloadDeployment="endReloadDeployment"
											/>
										</div>
										<div
											v-if="category.inventory_sections
												&& category.inventory_sections.some(
													section => section.template == device.template
												)"
										>
											<div
												v-for="section in category.inventory_sections"
												:key="section.id"
											>
												<Inventory
													v-if="section.template == device.template"
													:section="section"
													:inventory="sections[section.id]"
												/>
											</div>
										</div>
										<div v-else>
											<Alert 
												:message="$t('message.no_inventory')" 
												variant="info"
											/>
										</div>
									</b-tab>
								</b-tabs>
							</div>
							<div v-else>
								<div class="hr-text">
									{{ $t("generic.information") }}
								</div>
								<b-row>
									<b-col cols="1" />
									<b-col>
										<div class="datagrid">
											<div 
												v-for="(value,key) in device"
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
									</b-col>
									<b-col cols="1" />
								</b-row>
								<br><br>
								<div align="center">
									<h2>{{ $t("title.accountinfo") }}</h2>
								</div>
								<fieldset class="form-fieldset">
									<Accountinfo
										:id="device.id"
										:type="type"
										:canedit="canedit"
										:slug="slug"
									/>
								</fieldset><br>
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
			loading: true,
			errored: false,
			canedit: true,
			type: null,
			slug: null,
			translationkey: null,
			id: null,
			reload: false,
			deployment: [],
			device: {},
			categories: [],
			sections: [],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	async mounted() {
		if(this.$route.params.type == 'asset') {
			this.type = "ASSET"
			this.slug = "inventory_base.inventorybase"
			this.translationkey = "inventory."
			if(this.$route.params.id) this.id = this.$route.params.id
			await this.getInventoryBase()
			await this.getCategories()
			await this.getInventoryCollection()
		}
		if(this.$route.params.type == 'netdevice') {
			this.type = "IPDISCOVER"
			this.slug = "netdevice.netdevice"
			this.translationkey = "network."
			await this.getNetdevice()
		}
	},
	methods: {
		async getNetdevice() {
			await axios.get(this.$config.BACKEND_API_ROUTE+"netdevices/"+this.$route.params.id+"?expand=network",
				{ headers: this.header })
				.then(response => {
					this.device = response.data
					this.device.network = this.device.network.name
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
				.finally(() => {this.loading = false})
		},
		async getInventoryBase() {
			await axios.get(this.$config.BACKEND_API_ROUTE+"asset/bases/"+this.$route.params.id, { headers: this.header })
				.then(response => {
					this.device = response.data
					this.deployment.push(response.data)
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		async getCategories() {
			await axios.get(this.$config.BACKEND_API_ROUTE+"categories?expand=inventory_sections", { headers: this.header })
				.then(response => {
					response.data.sort((a, b) => a.id - b.id);
					this.categories = []
					for (const category of response.data) {
						var allReadyPush = false
						if (category.is_protected) {
							this.categories.push(category)
							allReadyPush = true
						}

						Object.keys(category.inventory_sections).forEach(item => {
							this.loading = true
							var section = category.inventory_sections[item]

							if (!allReadyPush && section.template == this.device.template) {
								this.categories.push(category)
								allReadyPush = true
							}
						})
					}
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		async getInventoryCollection() {
			await axios.get(this.$config.BACKEND_API_ROUTE+"asset/sections?base="+this.$route.params.id+"&expand=fields",
				{ headers: this.header })
				.then(response => {
					this.sections = []
					for (const inventory of response.data) {
						if (!this.sections[inventory.template_section]) {
							this.sections[inventory.template_section] = []
						}

						this.sections[inventory.template_section].push(inventory.fields)
					}
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
				.finally(() => {this.loading = false})
		},
		reloadDeployment() {
			this.reload = true
		},
		async reloadInventory() {
			this.loading = true
			await this.getInventoryBase()
			await this.getCategories()
			await this.getInventoryCollection()
		},
		endReloadDeployment() {
			this.reload = false
		},
		scrollToTop(){
			this.$nextTick(() => {
				const scrollContainer = this.$el.querySelector('.tab-content.col-10.sticky-tabs');
				if (scrollContainer) {
					scrollContainer.scrollTop = 0;
				}
			});
		}
	}
}
</script>