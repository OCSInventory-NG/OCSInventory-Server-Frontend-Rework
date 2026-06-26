<template>
	<div 
		id="detail" 
		class="container-xl"
	>
		<div>
			<PageHeader 
				v-if="device.name"
				:page-title="device.name"
			/>

			<PageHeader 
				v-if="device.netname || device.ip"
				:page-title="(device.netname) ? device.netname : device.ip"
			/>

			<div class="page-body">
				<div class="card">
					<div class="card-body">
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
												@reload-deployment="reloadDeployment"
											/>&nbsp;

											<AssetOptionsModal
												:item="deployment"
												@reload-inventory="reloadInventory"
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
									v-model="activetab"
									content-class="col-10 sticky-tabs"
									pills
									card
									vertical
								>
									<template
										v-for="category in categories"
										:key="category.id"
									>
										<b-tab
											:title="$te('category.'+category.name)
												? $t('category.'+category.name)
												: category.name"
											title-item-class="ocs-menu-tab"
											@click="scrollToTop()"
										>
											<div v-if="category.id == 1">
												<div class="datagrid">
													<template
														v-for="(value,key) in device"
														:key="key"
													>
														<div
															v-if="!['templateid', 'matched'].includes(key)"
															class="datagrid-item"
														>
															<div class="datagrid-title">
																{{ $t(translationkey+key) }}
															</div>
															<div class="datagrid-content">
																{{ formatDate(value, key) }}
															</div>
														</div>
														<div
															v-if="key === 'is_template_forced' && complianceStatus"
															class="datagrid-item"
														>
															<div class="datagrid-title">
																{{ $t('inventory.compliance') }}
															</div>
															<div class="datagrid-content">
																<span
																	:class="complianceStatus === 'compliant'
																		? 'badge bg-success'
																		: complianceStatus === 'non_compliant'
																			? 'badge bg-danger'
																			: 'badge bg-secondary'"
																>
																	{{ $t('compliance.' + complianceStatus) }}
																</span>
															</div>
														</div>
														<div
															v-if="key === 'is_template_forced'"
															class="datagrid-item"
														>
															<div class="datagrid-title">
																{{ $t('inventory.eol') }}
															</div>
															<div class="datagrid-content">
																<span
																	v-if="eolStatus"
																	:class="eolStatus.is_eol
																		? 'badge bg-danger'
																		: 'badge bg-success'"
																>
																	{{ eolStatus.is_eol
																		? $t('compliance.eol_expired')
																		: $t('compliance.eol_active') }}
																</span>
																<span
																	v-else
																	class="badge bg-secondary"
																>
																	{{ $t('compliance.eol_unknown') }}
																</span>
															</div>
														</div>
													</template>
												</div><br><br>
												<div align="center">
													<h2>{{ $t("title.accountinfo") }}</h2>
												</div>
												<fieldset class="form-fieldset">
													<Accountinfo
														:id="device.id"
														:type="type"
														:slug="slug"
													/>
												</fieldset><br>

												<div align="center">
													<h2>{{ $t("title.notes") }}</h2>
												</div>
												<Notes
													:id="device.id"
													:type="type"
													:slug="slug"
												/><br>

												<ExtensionSlot
													name="inventory.asset.detail.afterAccountInfo"
													:context="{ assetId: device?.id }"
												/><br>
											</div>
											<div v-if="category.id == 2 && device.osname != 'SNMP'">
												<div align="center">
													<h2>{{ $t("title.deployment") }}</h2>
												</div>

												<ResultDetail
													:id="$route.params.id"
													:reload="reload"
													@end-reload-deployment="endReloadDeployment"
												/>
											</div>
											<div
												v-if="category.inventory_sections
													&& category.inventory_sections.some(
														section => section.template == device.templateid
													)"
											>
												<div
													v-for="section in category.inventory_sections"
													:key="section.id"
												>
													<Inventory
														v-if="section.template == device.templateid"
														:section="section"
														:base="device.id"
													/>
												</div>
											</div>
											<div v-else>
												<Alert
													:message="$t('message.no_inventory')"
													:cols="true"
													variant="info"
												/>
											</div>
										</b-tab>
										<b-tab
											v-if="category.id === 1"
											:title="$t('compliance.title')"
											title-item-class="ocs-menu-tab"
											@click="scrollToTop()"
										>
											<ComplianceDetail :asset-id="device.id" />
										</b-tab>
									</template>
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
													{{ formatDate(value, key) }}
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
										
										:slug="slug"
									/>
								</fieldset><br>
								<div align="center">
									<h2>{{ $t("title.notes") }}</h2>
								</div>
								<Notes
									:id="device.id"
									:type="type"
									:slug="slug"
								/><br>
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
	name: 'Detail',
	data() {
		return {
			errored: false,
			errormsg: null,

			type: null,
			slug: null,
			translationkey: null,
			reload: false,
			deployment: [],
			device: {},
			categories: [],
			activetab: 0,

			loading: true,
			complianceStatus: null,
			eolStatus: null,
		}
	},
	async mounted() {
		const { type } = this.$route.params || {}

		if (type === "asset") {
			this.type = "ASSET"
			this.slug = "inventory_base.inventorybase"
			this.translationkey = "inventory."

			// Get inventory base
			await this.getInventoryBase()
			this.getComplianceStatus()
			this.getEolStatus()
			// Get categories
			await this.getCategories()
			return
		}

		if (type === "netdevice") {
			this.type = "IPDISCOVER"
			this.slug = "netdevice.netdevice"
			this.translationkey = "network."

			// Get netdevices
			await this.getNetdevice()
		}
	},

	methods: {
		async getNetdevice() {
			try {
				this.loading = true

				const data = await this.$api.generic.get(
					`netdevices/${this.$route.params.id}/`,
					{},
					{ expand: "network" }
				)

				this.device = {
					...data,
					network: data?.network?.name ?? data?.network,
				}

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		async getInventoryBase() {
			try {
				const data = await this.$api.generic.get(`asset/bases/${this.$route.params.id}/`)

				let templateName = this.$t("generic.none")
				if (data?.template) {
					const tpl = await this.$api.generic.get(`templates/${data.template}/`)
					templateName = tpl?.name ?? templateName
				}

				const device = {
					...data,
					templateid: data?.template,
					template: templateName,
				}

				this.device = device
				this.deployment = [device]

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			}
		},

		async getCategories() {
			try {
				const data = await this.$api.generic.get(
					"categories/",
					{},
					{ expand: "inventory_sections" }
				)

				const categories = (Array.isArray(data) ? data : (data?.results || []))
					.slice()
					.sort((a, b) => (a?.id ?? 0) - (b?.id ?? 0))

				const templateId = this.device?.templateid

				this.categories = categories.filter((category) => {
					if (category?.is_protected) return true

					const sections = Array.isArray(category?.inventory_sections)
						? category.inventory_sections
						: Object.values(category?.inventory_sections || {})

					return sections.some((s) => s?.template === templateId)
				})

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		async getEolStatus() {
			try {
				const data = await this.$api.generic.get(
					"compliance/eol-status/",
					{},
					{ asset: this.device.id }
				)
				const results = Array.isArray(data) ? data : (data?.results || [])
				this.eolStatus = results[0] ?? null
			} catch {
				// non-blocking
			}
		},

		async getComplianceStatus() {
			try {
				const data = await this.$api.generic.get(
					"compliance/results/asset-summary/",
					{},
					{ asset__in: this.device.id }
				)
				const results = Array.isArray(data) ? data : (data?.results || [])
				const entry = results.find(r => r.asset == this.device.id)
				this.complianceStatus = entry?.global_status ?? 'not_applicable'
			} catch {
				// non-blocking
			}
		},

		reloadDeployment() {
			this.reload = true
		},

		async reloadInventory() {
			const currentTab = this.activetab
			this.loading = true

			await this.getInventoryBase()
			await this.getCategories()

			this.$nextTick(() => {
				this.activetab = currentTab
			})
		},

		endReloadDeployment() {
			this.reload = false
		},

		scrollToTop() {
			this.$nextTick(() => {
				const scrollContainer = this.$el.querySelector('.tab-content.col-10.sticky-tabs')
				if (scrollContainer) scrollContainer.scrollTop = 0
			})
		},

		formatDate(value, key) {
			const dateFields = ['last_update', 'last_updated', 'timestamp', 'date_created', 'last_seen']
			if (key === "id") return value
			if (this.$te('inventory.' + value)) return this.$t('inventory.' + value)
			if (dateFields.includes(key)) {
				return new Date(value).toLocaleString(this.$i18n.locale)
			}
			return value
		},
	}
}
</script>