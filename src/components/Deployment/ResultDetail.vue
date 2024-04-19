<template>
	<div id="ResultDetail">		
		<!-- Error box message -->
		<section v-if="errored">
			<Alert 
				:message="errorMsg" 
				variant="danger"
			/>
		</section>

		<!-- Accountinf form -->
		<section v-else>
			<div 
				v-if="loading"
				class="ocs-loader"
			>
				<Loader />
			</div>

			<div v-else>
				<Datatable
					id="assets-deployment-datatable"
					:rowdata="rowdata"
					:rowheader="rowheader"
					:candelete="true"
					:usecheckbox="false"
					title="deployment/results"
					translationkey="deployment."
					@reloadDatatable="reloadDatatable"
				/>
			</div>
		</section>
	</div>
</template>

<script>
import Axios from 'axios'
import Datatable from '@/components/Datatable/Datatable.vue'

export default {
	name: 'ResultDetail',
	components: { Datatable },
	props: {
		reload: { type: Boolean, default: false },
		type: { type: String, default: '' },
		id: { type: String, default: null },
		group: { type: String, default: null }
	},
	data() {
		return {
			rowdata: [],
			rowheader: [],
			loading: true,
			errorMsg: null,
			succesMsg: null,
			errored: false,
			successed: false,
			parameter: null,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		reload: function() {
			if(this.reload) {
				this.getResult()
			}
		}
	},
	mounted() {
		this.getHeader()
	},
	methods: {
		getHeader() {
			Axios.options(import.meta.env.VITE_APP_API_ROUTE+"deployment/results", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						if(field != "package") {
							if(this.id && field != "asset") {
								this.rowheader.push(field)
							}
						}
					})

					if(this.group) {
						this.rowheader.push("package")
						this.rowheader.push("name")
						this.rowheader.push("total")
						this.rowheader.push("waiting")
						this.rowheader.push("success")
						this.rowheader.push("error")
					}

					this.errorMsg = null
					this.errored = false
					this.getResult()
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
		},
		getResult() {
			if(this.group) {
				this.parameter = "group=" + this.group
			} else {
				this.parameter = "asset=" + this.id
			}

			Axios.get(import.meta.env.VITE_APP_API_ROUTE+"deployment/results?"+this.parameter, { headers: this.header })
				.then(response => {
					if(this.group) {
						this.calculForGroup(response.data)
					} else {
						this.rowdata = response.data
					}
					
					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
				.finally(() => {
					this.loading = false
					this.$emit('endReloadDeployment')
				})
		},
		calculForGroup(data) {
			this.loading = true
			var tmprow = []

			for (const pkg of data) {
				if(tmprow[pkg.package] == undefined) {
					tmprow[pkg.package] = {}
					tmprow[pkg.package].package = pkg.package
					tmprow[pkg.package].name = pkg.name
					tmprow[pkg.package].total = 1
					if(pkg.status == 2) {
						tmprow[pkg.package].error = 1
						tmprow[pkg.package].success = 0
						tmprow[pkg.package].waiting = 0
					} else if (pkg.status == 1) {
						tmprow[pkg.package].error = 0
						tmprow[pkg.package].succes = 1
						tmprow[pkg.package].waiting = 0
					} else {
						tmprow[pkg.package].error = 0
						tmprow[pkg.package].success = 0
						tmprow[pkg.package].waiting = 1
					}
				} else {
					tmprow[pkg.package].total += 1
					if(pkg.status == 2) {
						tmprow[pkg.package].error += 1
					} else if (pkg.status == 1) {
						tmprow[pkg.package].success += 1
					} else {
						tmprow[pkg.package].waiting += 1
					}
				}
			}

			for (const result of tmprow) {
				if(result !== undefined) {
					this.rowdata.push(result)
				}
			}

			this.loading = false
		},
		reloadDatatable() {
			this.loading = true
			this.getResult()
		}
	}
}
</script>