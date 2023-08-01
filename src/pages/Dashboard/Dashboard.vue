<template>
	<div class="container-xl">
		<!-- Error box message -->
		<section v-if="errored">
			<Alert 
				:message="errorMsg" 
				variant="danger"
			/>
		</section>

		<section v-else>
			<div v-if="loading">
				<Loader />
			</div>

			<div v-else>
				<PageHeader 
					page-title="dashboard"
				/>

				<div class="page-body">
					<div class="card">
						<div class="card-body">
							<div class="row row-deck row-cards">
								<AssetCounters 
									firsttitle="dashboard.total"
									:firstcount="total.total"
									secondtitle="dashboard.contacted"
									:secondcount="contacted.total"
								/>
								<AssetCounters 
									firsttitle="dashboard.windows"
									:firstcount="total.windows"
									secondtitle="dashboard.contacted"
									:secondcount="contacted.windows"
								/>
								<AssetCounters 
									firsttitle="dashboard.linux"
									:firstcount="total.linux"
									secondtitle="dashboard.contacted"
									:secondcount="contacted.linux"
								/>
								<AssetCounters 
									firsttitle="dashboard.macos"
									:firstcount="total.macos"
									secondtitle="dashboard.contacted"
									:secondcount="contacted.macos"
								/>
							</div>
							
							<DonutChart 
								title="dashboard.osassets"
								:options="oscount.options"
								:series="oscount.series"
							/>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<script>
import Loader from '@/components/Loader/Loader'
import Alert from '@/components/Alert/Alert'
import Axios from 'axios'
import PageHeader from '@/components/Header/PageHeader'
//import BarChart from '@/components/Dashboard/Chart/Bar'
import AssetCounters from '@/components/Dashboard/Counter/AssetCounters'
import DonutChart from '@/components/Dashboard/Chart/Donut'

export default {
	name: "Dashboard",
	components: { PageHeader, /*BarChart,*/ AssetCounters, DonutChart, Loader, Alert },
	data() {
		return {
			templates: {
				WIN: [],
				LIN: [],
				MAC: []
			},
			total: {
				total: 0,
				windows: 0,
				linux: 0,
				macos: 0,
			},
			contacted: {
				total: 0,
				windows: 0,
				linux: 0,
				macos: 0,
			},
			ostemp: {},
			oscount: {
				options: {
					labels: []
				},
				series: []
			},
			errorMsg: null,
			loading: true,
			errored: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	mounted() {
		this.getTemplates()
	},
	methods: {
		// Retrieve templates ID and sort by type
		getTemplates() {
			Axios.get(process.env.VUE_APP_API_ROUTE+"templates/", { headers: this.header })
				.then(response => {
					response.data.forEach(template => {
						this.templates[template["os"]].push(template["id"])
					})
					this.errorMsg = null
					this.errored = false
					this.getCount()
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
		},
		// Count assets and sort by template types
		getCount() {
			Axios.get(process.env.VUE_APP_API_ROUTE+"asset/bases/", { headers: this.header })
				.then(response => {
					var now = new Date().toJSON().slice(0,10)
					this.total.total = response.data.length
					response.data.forEach(asset => {
						// Counter assets
						if(asset.last_update.slice(0,10) == now) this.contacted.total += 1
						if(this.templates.WIN.includes(asset.template)) {
							this.total.windows += 1
							if(asset.last_update.slice(0,10) == now) this.contacted.windows += 1
						}
						if(this.templates.LIN.includes(asset.template)) {
							this.total.linux += 1
							if(asset.last_update.slice(0,10) == now) this.contacted.linux += 1
						}
						if(this.templates.MAC.includes(asset.template)) {
							this.total.macos += 1
							if(asset.last_update.slice(0,10) == now) this.contacted.macos += 1
						}
						// Counter operating system
						this.ostemp[asset.osname] = (this.ostemp[asset.osname]) ? this.ostemp[asset.osname]+1 : 1
					})
					Object.keys(this.ostemp).forEach(osname => {
						this.oscount.options.labels.push(osname)
						this.oscount.series.push(this.ostemp[osname])
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