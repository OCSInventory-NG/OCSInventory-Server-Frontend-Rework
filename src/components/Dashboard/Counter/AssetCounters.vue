<template>
	<div id="asset-counters">
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
				<div class="row row-deck row-cards">
					<!-- TOTAL -->
					<div class="col-sm-6 col-lg-3">
						<div class="card">
							<div class="card-body">
								<div class="d-flex align-items-center">
									<div class="subheader">
										{{ $t("dashboard.total") }}
									</div>
								</div>
								<div class="h1 mb-3">
									{{ total.total }}
								</div>
								<div class="d-flex mb-2">
									<div>{{ $t("dashboard.contacted") }}</div>
									<div class="ms-auto">
										<span class="badge bg-indigo-lt">
											{{ contacted.total }}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
					<!-- WINDOWS -->
					<div class="col-sm-6 col-lg-3">
						<div class="card">
							<div class="card-body">
								<div class="d-flex align-items-center">
									<div class="subheader">
										{{ $t("dashboard.windows") }}
									</div>
								</div>
								<div class="h1 mb-3">
									{{ total.windows }}
								</div>
								<div class="d-flex mb-2">
									<div>{{ $t("dashboard.contacted") }}</div>
									<div class="ms-auto">
										<span class="badge bg-indigo-lt">
											{{ contacted.windows }}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
					<!-- LINUX -->
					<div class="col-sm-6 col-lg-3">
						<div class="card">
							<div class="card-body">
								<div class="d-flex align-items-center">
									<div class="subheader">
										{{ $t("dashboard.linux") }}
									</div>
								</div>
								<div class="h1 mb-3">
									{{ total.linux }}
								</div>
								<div class="d-flex mb-2">
									<div>{{ $t("dashboard.contacted") }}</div>
									<div class="ms-auto">
										<span class="badge bg-indigo-lt">
											{{ contacted.linux }}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
					<!-- MACOS -->
					<div class="col-sm-6 col-lg-3">
						<div class="card">
							<div class="card-body">
								<div class="d-flex align-items-center">
									<div class="subheader">
										{{ $t("dashboard.macos") }}
									</div>
								</div>
								<div class="h1 mb-3">
									{{ total.macos }}
								</div>
								<div class="d-flex mb-2">
									<div>{{ $t("dashboard.contacted") }}</div>
									<div class="ms-auto">
										<span class="badge bg-indigo-lt">
											{{ contacted.macos }}
										</span>
									</div>
								</div>
							</div>
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

export default {
	name: "AssetCounters",
	components: { Loader, Alert },
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