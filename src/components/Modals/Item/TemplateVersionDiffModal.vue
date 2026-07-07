<template>
	<div class="template-version-diff-modal d-inline">
		<button
			:title="$t('template.diff')"
			class="btn btn-ghost-dark"
			@click="loadData()"
		>
			<font-awesome-icon
				:icon="['fas', 'table-columns']"
			/>
		</button>

		<b-modal
			:id="`versiondiff-${version.id}`"
			v-model="diffmodal"
			:title="$t('template.diff')"
			hide-footer
			lazy
			modal-class="custom-modal"
			size="xl"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('template.diff') }} ({{ version.revision }})
				</h5>
				<b-button
					size="sm"
					variant="outline-danger"
					@click="close()"
				>
					<font-awesome-icon
						:icon="['fas', 'xmark']"
						size="1x"
					/>
				</b-button>
			</template>

			<Alert
				v-if="errored"
				:message="errormsg"
				variant="danger"
			/>

			<div
				v-if="loading"
				class="ocs-loader"
			>
				<Loader />
			</div>

			<div v-else>
				<b-row class="mb-3">
					<b-col class="text-center">
						<h5>{{ $t('template.diff_current') }}</h5>
					</b-col>
					<b-col class="text-center">
						<h5>{{ $t('template.diff_target') }}</h5>
					</b-col>
				</b-row>

				<div
					v-for="row in templateFieldRows"
					:key="row.key"
					class="card mb-3"
					:class="statusBorderClass(row.status)"
				>
					<div class="card-header d-flex justify-content-between align-items-center">
						<b>{{ row.label }}</b>
						<span
							class="badge"
							:class="statusBadgeClass(row.status)"
						>
							{{ $t('template.diff_' + row.status) }}
						</span>
					</div>
					<div class="card-body">
						<b-row>
							<b-col>{{ row.key === 'os' ? formatOs(row.current) : row.current }}</b-col>
							<b-col>{{ row.key === 'os' ? formatOs(row.target) : row.target }}</b-col>
						</b-row>
					</div>
				</div>

				<div
					v-for="row in sectionRows"
					:key="row.name"
					class="card mb-3"
					:class="statusBorderClass(row.status)"
				>
					<div class="card-header d-flex justify-content-between align-items-center">
						<b>{{ row.name }}</b>
						<span
							class="badge"
							:class="statusBadgeClass(row.status)"
						>
							{{ $t('template.diff_' + row.status) }}
						</span>
					</div>
					<div class="card-body">
						<b-row>
							<b-col>
								<SectionDiffPane :section="row.current" />
							</b-col>
							<b-col>
								<SectionDiffPane :section="row.target" />
							</b-col>
						</b-row>
					</div>
				</div>

				<Alert
					v-if="!templateFieldRows.length && !sectionRows.length"
					:message="$t('template.diff_no_changes')"
					:cols="true"
					variant="info"
				/>
			</div>
		</b-modal>
	</div>
</template>

<script>
export default {
	name: "TemplateVersionDiffModal",
	props: {
		templateId: { type: [String, Number], required: true },
		version: { type: Object, required: true }
	},
	data() {
		return {
			diffmodal: false,

			loading: false,
			errored: false,
			errormsg: null,

			current: {},
			target: {},
		}
	},
	computed: {
		templateFieldRows() {
			const fieldsToCompare = [
				{ key: "name", label: this.$t("user.name") },
				{ key: "os", label: this.$t("inventory.os") },
			]

			return fieldsToCompare
				.map(({ key, label }) => {
					const currentValue = this.current?.[key]
					const targetValue = this.target?.[key]
					const status = this.deepEqual(currentValue, targetValue) ? "unchanged" : "modified"

					return { key, label, current: currentValue, target: targetValue, status }
				})
				.filter((row) => row.status !== "unchanged")
		},

		sectionRows() {
			const currentMap = this.sectionMap(this.current)
			const targetMap = this.sectionMap(this.target)
			const names = Array.from(
				new Set([...Object.keys(currentMap), ...Object.keys(targetMap)])
			).sort()

			return names
				.map((name) => {
					const currentSection = currentMap[name] || null
					const targetSection = targetMap[name] || null

					let status = "unchanged"
					if (!currentSection) {
						status = "added"
					} else if (!targetSection) {
						status = "removed"
					} else if (!this.deepEqual(currentSection, targetSection)) {
						status = "modified"
					}

					return { name, current: currentSection, target: targetSection, status }
				})
				.filter((row) => row.status !== "unchanged")
		}
	},
	methods: {
		_apiError(e) {
			return e?.response?.data?.error || e?.message || String(e)
		},

		formatOs(value) {
			return value ? this.$t("template." + value) : value
		},

		deepEqual(a, b) {
			if (a === b) return true
			if (typeof a !== typeof b || a === null || b === null) return a === b
			if (typeof a !== "object") return a === b

			if (Array.isArray(a) || Array.isArray(b)) {
				if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false
				return a.every((item, index) => this.deepEqual(item, b[index]))
			}

			const aKeys = Object.keys(a)
			const bKeys = Object.keys(b)
			if (aKeys.length !== bKeys.length) return false
			return aKeys.every((key) => this.deepEqual(a[key], b[key]))
		},

		sectionMap(snapshot) {
			const map = {}
			for (const section of snapshot?.sections || []) {
				map[section.name] = section
			}
			return map
		},

		statusBorderClass(status) {
			return {
				"border-success": status === "added",
				"border-danger": status === "removed",
				"border-warning": status === "modified",
			}
		},

		statusBadgeClass(status) {
			return {
				"bg-success": status === "added",
				"bg-danger": status === "removed",
				"bg-warning": status === "modified",
				"bg-secondary": status === "unchanged",
			}
		},

		async loadData() {
			this.diffmodal = true
			this.loading = true
			this.errored = false
			this.errormsg = null

			try {
				const [exportData, versionData] = await Promise.all([
					this.$api.generic.get(`templates/${this.templateId}/export/`),
					this.$api.generic.get(`templates/${this.templateId}/versions/${this.version.id}/`),
				])

				this.current = exportData || {}
				this.target = versionData?.snapshot || {}
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			} finally {
				this.loading = false
			}
		},
	}
}
</script>
