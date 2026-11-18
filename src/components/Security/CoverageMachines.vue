<template>
	<div>
		<Alert
			v-if="errored"
			:message="errormsg"
			:cols="true"
			variant="danger"
		/>
		<Datatable
			id="coverage-machines-datatable"
			:rowdata="rows"
			:rowheader="columns"
			:nonsortablefields="columns"
			:usecheckbox="false"
			:candeletemultiple="false"
			:cansearch="false"
			:server-side="true"
			:server-total-rows="total"
			:page-reset-key="pageResetKey"
			:isbusy="loading"
			:emptytext="$t('security.machines_empty')"
			title="coverage_machines"
			translationkey="security.column_"
			compactheader
			@change-query="onQueryChange"
			@reload-datatable="load"
		>
			<template #toolbar>
				<v-select
					v-model="filters.status"
					:options="statusOptions"
					:reduce="option => option.value"
					:placeholder="$t('security.all_statuses')"
					:searchable="false"
					label="text"
					class="datatable-btn vuln-filter"
				/>
				<v-select
					v-model="filters.reason"
					:options="reasonOptions"
					:reduce="option => option.value"
					:placeholder="$t('security.all_reasons')"
					:searchable="false"
					label="text"
					class="datatable-btn vuln-filter"
				/>
				<v-select
					v-model="filters.family"
					:options="familyOptions"
					:reduce="option => option.value"
					:placeholder="$t('security.all_platforms')"
					:searchable="false"
					label="text"
					class="datatable-btn vuln-filter"
				/>
			</template>

			<template #cell(machine)="{ row }">
				<router-link
					:to="`/inventory/asset/${row.item.asset}`"
					class="ocs-link"
				>
					{{ row.item.machine || '#' + row.item.asset }}
				</router-link>
			</template>
			<template #cell(platform)="{ row }">
				<template v-if="row.item.family">
					{{ $t('software_identity.family_' + row.item.family) }}
					<div
						v-if="row.item.platform"
						class="text-muted small"
					>
						{{ row.item.platform }}
					</div>
				</template>
				<span
					v-else
					class="text-muted"
				>{{ $t('software_identity.family_unknown') }}</span>
			</template>
			<template #cell(status)="{ row }">
				<span
					class="badge"
					:class="row.item.status === 'covered' ? 'bg-green-lt' : 'bg-orange-lt'"
				>{{ $t('security.machine_' + row.item.status) }}</span>
			</template>
			<template #cell(reason)="{ row }">
				{{ row.item.reason ? reasonLabel(row.item.reason) : '' }}
			</template>
			<template #cell(support_end)="{ row }">
				<span
					class="text-nowrap"
					:class="{ 'text-danger': isPast(row.item.support_end) }"
				>{{ formatDay(row.item.support_end) }}</span>
			</template>
		</Datatable>
	</div>
</template>

<script>
import { FAMILIES, MACHINE_REASONS, apiErrorMessage, asList, formatDay } from "@/utils/security"

// Machines and whether the scan can check them, the uncovered ones first.
// The list is paginated by the server, as the vulnerability list
export default {
	name: "CoverageMachines",
	props: {
		// filter given by the link that opened the list (?status=not_covered)
		status: { type: String, default: null },
	},
	data() {
		return {
			errored: false,
			errormsg: null,
			loading: true,
			rows: [],
			total: 0,
			pageResetKey: 0,
			request: 0,
			query: { limit: Number(localStorage.getItem("perPage")) || 5, offset: 0 },
			filters: { status: this.status, reason: null, family: null },
			columns: ["machine", "platform", "status", "reason", "support_end"],
		}
	},
	computed: {
		statusOptions() {
			return ["not_covered", "covered"].map((status) => ({ value: status, text: this.$t("security.machine_" + status) }))
		},
		reasonOptions() {
			return MACHINE_REASONS.map((reason) => ({ value: reason, text: this.reasonLabel(reason) }))
		},
		familyOptions() {
			return FAMILIES.map((family) => ({ value: family, text: this.$t("software_identity.family_" + family) }))
		},
	},
	watch: {
		filters: {
			deep: true,
			handler() {
				this.query = { ...this.query, offset: 0 }
				this.pageResetKey += 1
				this.load()
			},
		},
	},
	mounted() {
		this.load()
	},
	methods: {
		formatDay,

		reasonLabel(reason) {
			const key = "security.machine_reason_" + reason
			return this.$te(key) ? this.$t(key) : reason
		},
		isPast(day) {
			return !!day && new Date(day) < new Date()
		},

		async onQueryChange(query) {
			this.query = { limit: query.limit, offset: query.offset }
			await this.load()
		},

		async load() {
			this.loading = true
			// an answer to an older filter must not replace a newer one
			const request = ++this.request
			try {
				const data = await this.$api.generic.get("vulnerabilities/machines/", {
					...this.query,
					status: this.filters.status,
					reason: this.filters.reason,
					family: this.filters.family,
				})
				if (request !== this.request) return
				const rows = asList(data)
				this.total = data?.count ?? rows.length
				this.rows = rows.map((row) => ({ ...row, id: row.asset, machine: row.name }))
				this.errored = false
			} catch (e) {
				if (request !== this.request) return
				this.errormsg = apiErrorMessage(e)
				this.errored = true
			} finally {
				if (request === this.request) this.loading = false
			}
		},
	},
}
</script>
