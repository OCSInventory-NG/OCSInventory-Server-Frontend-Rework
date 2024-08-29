<template>
	<div class="container-xl">
		<PageHeader 
			page-title="dashboard"
		/>
		
		<div class="page-body">
			<div class="card">
				<div class="card-body">
					<h1>{{ $t("title.assets") }}</h1>
					<!-- Error box message -->
					<section v-if="erroredasset">
						<Alert 
							:message="errormsgAsset" 
							variant="danger"
						/>
					</section>
					
					<div 
						v-if="loadingasset"
						class="ocs-loader"
					>
						<Loader />
					</div>

					<div v-else>
						<div class="row row-deck row-cards justify-content-center">
							<Counter 
								firsttitle="dashboard.total"
								:firstcount="total.total"
								secondtitle="dashboard.contacted"
								:secondcount="contacted.total"
							/>
							<Counter 
								firsttitle="dashboard.windows"
								:firstcount="total.windows"
								secondtitle="dashboard.contacted"
								:secondcount="contacted.windows"
							/>
							<Counter 
								firsttitle="dashboard.linux"
								:firstcount="total.linux"
								secondtitle="dashboard.contacted"
								:secondcount="contacted.linux"
							/>
							<Counter 
								firsttitle="dashboard.macos"
								:firstcount="total.macos"
								secondtitle="dashboard.contacted"
								:secondcount="contacted.macos"
							/>
							<Counter 
								firsttitle="dashboard.legacy"
								:firstcount="total.legacy"
								secondtitle="dashboard.contacted"
								:secondcount="contacted.legacy"
							/>
						</div>
						<div class="row">
							<div class="col-lg-6">
								<DonutChart 
									title="dashboard.osassets"
									:options="oscount.options"
									:series="oscount.series"
								/>
							</div>
							<div class="col-lg-6">
								<LineChart 
									title="dashboard.lastcontacted"
									:options="lastcontactedopt.options"
									:series="lastcontactedopt.series"
								/>
							</div>
						</div>
					</div>

					<h1>{{ $t("title.network") }}</h1>
					<!-- Error box message -->
					<section v-if="errorednetwork">
						<Alert 
							:message="errormsgNetwork" 
							variant="danger"
						/>
					</section>
					<div 
						v-if="loadingnetwork"
						class="ocs-loader"
					>
						<Loader />
					</div>

					<div v-else>
						<div class="row row-deck row-cards">
							<Counter 
								firsttitle="dashboard.totalnetwork"
								:firstcount="networks.total"
								classstyle="col-sm-6 col-lg-6"
							/>
							<Counter 
								firsttitle="dashboard.totalnetworkdevices"
								:firstcount="networks.devices.total"
								classstyle="col-sm-6 col-lg-6"
							/>
						</div>
						<div class="row">
							<div class="col-lg-12">
								<BarChart 
									title="dashboard.nbdevicebynetwork"
									:options="networkopt.options"
									:series="networkopt.series"
								/>
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
import BarChart from '@/components/Dashboard/Chart/Bar.vue'
import Counter from '@/components/Dashboard/Counter/Counter.vue'
import DonutChart from '@/components/Dashboard/Chart/Donut.vue'
import LineChart from '@/components/Dashboard/Chart/Line.vue'

export default {
	name: "Dashboard",
	components: { BarChart, Counter, DonutChart, LineChart },
	data() {
		return {
			templates: {
				WIN: [],
				LIN: [],
				MAC: [],
				LEG: [],
			},
			total: {
				total: 0,
				windows: 0,
				linux: 0,
				macos: 0,
				legacy: 0,
			},
			contacted: {
				total: 0,
				windows: 0,
				linux: 0,
				macos: 0,
				legacy: 0,
			},
			ostemp: {},
			oscount: {
				options: {
					labels: []
				},
				series: []
			},
			lastcontactedopt: {
				options: {
					chart: {
						id: "last-contacted-chart"
					},
					xaxis: {
						categories: []
					}
				},
				series: [{
					name: this.$t('dashboard.nbassets'),
					data: []
				}]
			},
			networks: {
				total: 0,
				names: [],
				devices: {
					total: 0
				}
			},
			networkopt: {
				options: {
					chart: {
						id: "network-chart"
					},
					xaxis: {
						categories: []
					}
				},
				series: [{
					name: this.$t('dashboard.nbnetwork'),
					data: []
				}]
			},
			errormsgAsset: null,
			errormsgNetwork: null,
			loadingasset: true,
			loadingnetwork: true,
			erroredasset: false,
			errorednetwork: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	mounted() {
		// Get assets stats
		this.getTemplates()
		// Get networks stats
		this.getNetworks()
	},
	methods: {
		getNetworks() {
			axios.get(this.$config.BACKEND_API_ROUTE+"networks/", { headers: this.header })
				.then(response => {
					this.networks.total = response.data.length
					response.data.forEach(network => {
						this.networks.names[network.id] = {
							name: network.name,
							netid: network.netid,
							nbdevices: 0
						}
					})
					this.errormsgNetwork = null
					this.errorednetwork = false
					this.getNetdevices()
				})
				.catch(e => {
					this.errormsgNetwork = e.message
					this.errorednetwork = true
				})
		},
		getNetdevices() {
			axios.get(this.$config.BACKEND_API_ROUTE+"netdevices/", { headers: this.header })
				.then(response => {
					this.networks.devices.total = response.data.length
					response.data.forEach(device => {
						this.networks.names[device.network].nbdevices += 1
					})
					
					this.networks.names.forEach(network => {
						this.networkopt.options.xaxis.categories.push(network.name)
						this.networkopt.series[0].data.push(network.nbdevices)
					})

					this.errormsgNetwork = null
					this.errorednetwork = false
				})
				.catch(e => {
					this.errormsgNetwork = e.message
					this.errorednetwork = true
				})
				.finally(() => this.loadingnetwork = false)
		},
		// Retrieve templates ID and sort by type
		getTemplates() {
			axios.get(this.$config.BACKEND_API_ROUTE+"templates/", { headers: this.header })
				.then(response => {
					response.data.forEach(template => {
						this.templates[template["os"]].push(template["id"])
					})
					this.errormsgAsset = null
					this.erroredasset = false
					this.getCount()
				})
				.catch(e => {
					this.errormsgAsset = e.message
					this.erroredasset = true
				})
		},
		// Count assets and sort by template types
		getCount() {
			axios.get(this.$config.BACKEND_API_ROUTE+"asset/bases/", { headers: this.header })
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
						if(this.templates.LEG.includes(asset.template)) {
							this.total.legacy += 1
							if(asset.last_update.slice(0,10) == now) this.contacted.legacy += 1
						}
						// Counter operating system
						this.ostemp[asset.osname] = (this.ostemp[asset.osname]) ? this.ostemp[asset.osname]+1 : 1
					})

					Object.keys(this.ostemp).forEach(osname => {
						this.oscount.options.labels.push(osname)
						this.oscount.series.push(this.ostemp[osname])
					})

					// Last 7 days contact
					var dateNow = new Date()
					var date = new Date()
					date = date.setDate(dateNow.getDate() - 7)
					date = new Date(date)

					for(let i = 0; date.toJSON().slice(0,10) != dateNow.toJSON().slice(0,10); i++) {
						this.lastcontactedopt.options.xaxis.categories.push(date.toJSON().slice(0,10))
						this.lastcontactedopt.series[0].data[i] = 0
						date = date.setDate(date.getDate() + 1)
						date = new Date(date)

						response.data.forEach(asset => {
							if(asset.last_update.slice(0,10) == date.toJSON().slice(0,10)) {
								this.lastcontactedopt.series[0].data[i] += 1
							}
						})
					}

					this.errormsgAsset = null
					this.erroredasset = false
				})
				.catch(e => {
					this.errormsgAsset = e.message
					this.erroredasset = true
				})
				.finally(() => this.loadingasset = false)
		}
	}
}
</script>