<template>
	<div>
		<Alert
			v-if="errored"
			:message="errormsg"
			variant="danger"
		/>
		<ExposureTable
			ref="table"
			:name="name"
			:rows="rows"
			:total="total"
			:busy="loading"
			serverside
			assetview
			:closed="status === 'closed'"
			:excluded="excluded"
			:canexclude="canexclude"
			@change-query="onQueryChange"
			@export-all="exportAll"
			@reload="reload"
			@exclude="$emit('exclude', $event)"
		/>
	</div>
</template>

<script>
import { apiErrorMessage, asList } from "@/utils/security"

// A machine's exposures, open or closed, paged, sorted and searched by the server
export default {
	name: "AssetExposureTable",
	props: {
		assetId: { type: Number, required: true },
		name: { type: String, required: true },
		status: { type: String, default: "open" },
		// the open exposures an exclusion leaves out, else the others
		excluded: { type: Boolean, default: false },
		canexclude: { type: Boolean, default: false },
	},
	emits: ["exclude", "reload"],
	data() {
		return {
			errored: false,
			errormsg: null,
			loading: true,
			rows: [],
			total: 0,
			request: 0,
			query: { limit: Number(localStorage.getItem("perPage")) || 5, offset: 0 },
		}
	},
	mounted() {
		this.load()
	},
	methods: {
		params(paginated = true) {
			const params = {
				asset: this.assetId,
				status: this.status,
				search: this.query.search,
				ordering: this.query.ordering,
			}
			if (this.status === "open") params.excluded = this.excluded ? "yes" : "no"
			if (paginated) {
				params.limit = this.query.limit
				params.offset = this.query.offset
			}
			return params
		},

		async load() {
			this.loading = true
			// an answer to an older query must not replace a newer one
			const request = ++this.request
			try {
				const data = await this.$api.generic.get("vulnerability_exposures/", this.params())
				if (request !== this.request) return
				this.rows = asList(data)
				this.total = data?.count ?? this.rows.length
				this.errored = false
			} catch (e) {
				if (request !== this.request) return
				this.errormsg = apiErrorMessage(e)
				this.errored = true
			} finally {
				if (request === this.request) this.loading = false
			}
		},

		async onQueryChange(query) {
			this.query = { limit: query.limit, offset: query.offset, search: query.search, ordering: query.ordering }
			await this.load()
		},

		// the tiles and tabs of the machine count again too
		async reload() {
			await this.load()
			this.$emit("reload")
		},

		async exportAll() {
			try {
				// without limit the list comes whole
				const data = await this.$api.generic.get("vulnerability_exposures/", this.params(false))
				this.$refs.table.exportAll(asList(data))
			} catch (e) {
				this.errormsg = apiErrorMessage(e)
				this.errored = true
			}
		},
	},
}
</script>
