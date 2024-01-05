<template>
	<div id="inventory">
		<!-- Error box message -->
		<section v-if="errored">
			<Alert 
				:message="errorMsg" 
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
			</div>
		</section>
	</div>
</template>

<script>
import Axios from 'axios'
import Loader from '@/components/Loader/Loader'
import Alert from '@/components/Alert/Alert'
import Datatable from '@/components/Datatable/Datatable'

export default {
	name: "Inventory",
	components: { Loader, Alert, Datatable },
	props: {
		id: { type: String, default: "0" },
	},
	data() {
		return {
			sections: [],
			sectionsheader: [],
			sectionstitle: [],
			loading: true,
			errored: false,
			errorMsg: null,
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
		this.getInventory()
	},
	methods: {
		getInventory() {
			Axios.get(process.env.VUE_APP_API_ROUTE+"asset/sections?base="+this.id, { headers: this.header })
				.then(response => {
					response.data.forEach(section => {
						if(!this.sectionstitle.includes(section.section_name)) {
							this.sectionstitle.push(section.section_name)
						}

						if(!this.sections[section.section_name]) {
							this.sections[section.section_name] = []
						}

						if(!this.sectionsheader[section.section_name]) {
							this.sectionsheader[section.section_name] = []
						}

						var tmpRow = {}

						section.fields.forEach(row => {
							Object.assign(tmpRow, {
								[row.field_name]: row.value
							})

							if(!this.sectionsheader[section.section_name].includes(row.field_name)) {
								this.sectionsheader[section.section_name].push(row.field_name)
							}
						})

						const isEmpty = Object.values(tmpRow).every(x => x === null || x === '')

						if(!isEmpty) {
							this.sections[section.section_name].push(tmpRow)
						}
					})

					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		}
	}
}
</script>