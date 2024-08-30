<template>
	<div id="ResultDetail">		
		<!-- Error box message -->
		<section v-if="errored">
			<Alert 
				:message="errormsg" 
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
					:deletemultiple="(group) ? true : false"
					:deleteids="rows"
					title="deployment/results"
					translationkey="deployment."
					@reloadDatatable="reloadDatatable"
				/>
			</div>
		</section>
	</div>
</template>

<script>
import axios from 'axios'

export default {
	name: 'ResultDetail',
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
			rows: [],
			loading: true,
			errormsg: null,
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
	async mounted() {
		await this.getHeader()
	},
	methods: {
		async getHeader() {
			await axios.options(this.$config.BACKEND_API_ROUTE+"deployment/results", { headers: this.header })
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

					this.errormsg = null
					this.errored = false
					this.getResult()
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
		async getResult() {
			this.rowdata = []
			if(this.group) {
				this.parameter = "group=" + this.group
			} else {
				this.parameter = "asset=" + this.id
			}

			await axios.get(this.$config.BACKEND_API_ROUTE+"deployment/results?"+this.parameter, { headers: this.header })
				.then(response => {
					if(this.group) {
						this.calculForGroup(response.data)
					} else {
						this.rowdata = response.data
					}

					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = e.message
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
			this.rows = []

			for (const pkg of data) {
				if(tmprow[pkg.package] == undefined) {
					tmprow[pkg.package] = {}
					tmprow[pkg.package].id = pkg.package
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
					console.log(pkg)

					this.rows[pkg.package] = []
					this.rows[pkg.package].push(pkg.id)
				} else {
					tmprow[pkg.package].total += 1
					if(pkg.status == 2) {
						tmprow[pkg.package].error += 1
					} else if (pkg.status == 1) {
						tmprow[pkg.package].success += 1
					} else {
						tmprow[pkg.package].waiting += 1
					}
					this.rows[pkg.package].push(pkg.id)
				}
			}

			for (const result of tmprow) {
				if(result !== undefined) {
					this.rowdata.push(result)
				}
			}

			this.loading = false
		},
		async reloadDatatable() {
			this.loading = true
			await this.getResult()
		}
	}
}
</script>