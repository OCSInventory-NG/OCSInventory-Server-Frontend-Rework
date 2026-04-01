<template>
	<div id="ResultDetail">		
		<section v-if="errored">
			<Alert 
				:message="errormsg" 
				variant="danger"
			/>
		</section>

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
					:candelete="group ? true : false"
					:usecheckbox="group ? true : false"
					:deletemultiple="(group) ? true : false"
					:deleteids="rows"
					:isbusy="isbusy"
					is-sticky
					title="deployment/results"
					translationkey="deployment."
					@reload-datatable="reloadDatatable"
				/>
			</div>
		</section>
	</div>
</template>

<script>
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
			errored: false,
			errormsg: null,

			successmsg: null,
			successed: false,

			rowdata: [],
			rowheader: [],
			rows: [],
			parameter: null,
			
			isbusy: true,
			loading: true,
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
		// Data init
		await this.loadInitial()
	},
	methods: {
		async loadInitial() {
			this.loading = true
			this.isbusy = true
			try {
				// Get header
				const header = await this.$api.generic.options("deployment/results/")
				this.rowheader = Object.keys(header.actions.POST).filter(
					(f) => !["package"].includes(f)
				)

				if (this.group) {
					this.rowheader = []
					this.rowheader.push(
						"package",
						"name",
						"total",
						"waiting",
						"notified",
						"success",
						"error"
					)
				}

				// Get results
				await this.getResult()

				this.errored = false
				this.errormsg = null
			} catch (e) {
				this.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.errored = true
			} finally {
				this.loading = false
				this.isbusy = false
			}
		},

		async getResult() {
			this.isbusy = true
			this.rowdata = []

			try {
				const customParams = {
					expand: "group",
					...(this.group ? { group: this.group } : { asset: this.id }),
				}

				const data = await this.$api.generic.get(
					"deployment/results/",
					{},
					customParams
				)

				const results = Array.isArray(data) ? data : (data?.results || [])

				if (this.group) {
					await this.calculForGroup(results)
				} else {
					this.rowdata = results
				}

				this.rowdata = (this.rowdata || []).map((r) => ({
					...r,
					group: r?.group?.name ?? r.group,
				}))

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			} finally {
				this.isbusy = false
				this.$emit("endReloadDeployment")
			}
		},

		async calculForGroup(data) {
			this.isbusy = true
			this.rows = {}

			const byPackage = new Map()

			for (const pkg of data || []) {
				const key = pkg.package

				if (!byPackage.has(key)) {
					byPackage.set(key, {
						id: key,
						package: key,
						name: pkg.name,
						total: 0,
						waiting: 0,
						notified: 0,
						success: 0,
						error: 0,
					})
					this.rows[key] = []
				}

				const agg = byPackage.get(key)
				agg.total += 1

				if (pkg.status === 3) agg.error += 1
				else if (pkg.status === 0) agg.success += 1
				else if (pkg.status === 2) agg.notified += 1
				else agg.waiting += 1

				this.rows[key].push(pkg.id)
			}

			this.rowdata = Array.from(byPackage.values())
			this.isbusy = false
		},

		async reloadDatatable() {
			await this.getResult()
		}
	}
}
</script>