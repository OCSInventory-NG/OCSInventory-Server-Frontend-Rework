<template>
	<div id="inventory">
		<!-- Error box message -->
		<section v-if="errored">
			<Alert 
				:message="errormsg" 
				variant="danger"
			/>
		</section>

		<!-- Display inventory -->
		<section v-else>
			<div 
				v-if="loading"
				class="ocs-loader"
			>
				<Loader />
			</div>

			<div v-else>
				<div v-if="isDataLoaded">
					<div v-if="sectionstitle.length > 0">
						<div align="right">
							<b-button
								v-b-toggle="allcollapse"
								variant="ghost-dark"
								:title="$t('inventory.expandall')"
							>
								<font-awesome-icon 
									:icon="['far', 'window-maximize']"
									size="1x"
								/>
							</b-button>
						</div><br>
						<div
							v-for="(section_name) in sectionstitle"
							:key="section_name"
						>
							<div
								class="accordion"
								role="tablist"
							>
								<b-card
									no-body
									class="mb-1"
								>
									<b-card-header
										header-tag="header"
										class="p-1"
										role="tab"
									>
										<b-button
											v-b-toggle="'section-'+section_name"
											block
											class="section-btn"
										>
											{{ section_name }}
										</b-button>
									</b-card-header>

									<b-collapse
										:id="'section-'+section_name"
										accordion="my-accordion"
										role="tabpanel"
									>
										<b-card-body>
											<b-card-text>
												<Datatable
													id="battery-datatable"
													:rowdata="sections[section_name]"
													:usecheckbox="false"
													:rowheader="sectionsheader[section_name]"
													title="section"
												/>
											</b-card-text>
										</b-card-body>
									</b-collapse>
								</b-card>
							</div>
						</div>
					</div>
					<div v-else>
						<Alert 
							:message="$t('message.no_inventory')" 
							variant="info"
						/>
					</div>
				</div>
				<div 
					v-else
					class="ocs-loader"
				>
					<Loader />
				</div>
			</div>
		</section>
	</div>
</template>

<script>
import axios from 'axios'

export default {
	name: "Inventory",
	props: {
		id: { type: String, default: "0" },
	},
	data() {
		return {
			sections: [],
			sectionsheader: [],
			sectionstitle: [],
			allsections: [],
			allfields: [],
			loading: true,
			errored: false,
			errormsg: null,
			expandall: false,
			allcollapse: [],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	computed: {
		isDataLoaded() {
			const nestedLoaded = this.sectionsheader.length !== 0
			return this.sections && nestedLoaded.length !== 0
		}
	},
	created() {
		this.getSection()
		this.getInventory()
	},
	methods: {
		getInventory() {
			axios.get(this.$config.VITE_APP_API_ROUTE+"asset/sections?base="+this.id, { headers: this.header })
				.then(response => {
					for (const inventory of response.data) {
						var sectionName = this.allsections[inventory.template_section].name

						if(!this.sectionstitle.includes(sectionName)) {
							this.sectionstitle.push(sectionName)
							this.allcollapse.push("section-"+sectionName)
						}

						if(!this.sections[sectionName]) {
							this.sections[sectionName] = []
						}

						if(!this.sectionsheader[sectionName]) {
							this.sectionsheader[sectionName] = []
						}

						var tmpRow = {}

						for (const field of inventory.fields) {
							var fieldName = this.allfields[field.template_field]

							Object.assign(tmpRow, {
								[fieldName]: field.value
							})

							if(!this.sectionsheader[sectionName].includes(fieldName)) {
								this.sectionsheader[sectionName].push(fieldName)
							}
						}

						const isEmpty = Object.values(tmpRow).every(x => x === null || x === '')

						if(!isEmpty) {
							this.sections[sectionName].push(tmpRow)
						}
					}

					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		getSection() {
			axios.get(this.$config.VITE_APP_API_ROUTE+"sections", { headers: this.header })
				.then(response => {
					for (const section of response.data) {
						this.allsections[section.id] = section
						for (const field of section.fields) {
							this.allfields[field.id] = field.name
						}
					}
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		}
	}
}
</script>