<template>
	<div id="search">
		<SaveSearchModal
			v-if="cansave && !disableforgroup"
			:rowsearch="datavalues"
			@use-save-search="useSaveSearch"
		/>
		<b-form
			@submit="onSubmit"
		>
			<template
				v-for="(masterinput, masterindex) in datavalues"
				:key="rowkeys[masterindex]?.[0] ?? masterindex"
			>
				<!-- AND / OR between two groups -->
				<div
					v-if="masterindex > 0"
					class="search-group-link"
				>
					<SearchSelect
						:id="`link-${masterindex}-0`"
						v-model="masterinput[0].link"
						:label="$t('search.criterion_link')"
						:options="linkopt"
						:disabled="disableforgroup"
					/>
				</div>
				<div class="multisearch-card">
					<div
						v-if="!disableforgroup && datavalues.length > 1"
						class="text-end"
					>
						<b-button
							size="sm"
							variant="outline-danger"
							:title="$t('search.removegroup')"
							:aria-label="$t('search.removegroup')"
							@click="removeGroup(masterindex)"
						>
							<font-awesome-icon :icon="['fas', 'trash-can']" />
						</b-button>
					</div>

					<SearchCriterion
						v-for="(input, index) in masterinput"
						:key="rowkeys[masterindex]?.[index] ?? index"
						:criterion="input"
						:first="index === 0"
						:disabled="disableforgroup"
						:canremove="masterinput.length > 1"
						:idsuffix="`${masterindex}-${index}`"
						:routeopt="routeopt"
						:operatoropt="operatoropt"
						:linkopt="linkopt"
						@change="updateCriterion(input, $event)"
						@add="addField(masterindex)"
						@remove="removeField(masterindex, index)"
					/>
				</div>
			</template>
			<div
				v-if="!disableforgroup"
				class="multisearch-btns text-center"
			>
				<div class="d-flex flex-wrap justify-content-center gap-2 mb-2">
					<b-button
						type="button"
						variant="info"
						@click="addGroup"
					>
						{{ $t('search.addgroup') }}
					</b-button>
					<b-button
						type="submit"
						variant="success"
					>
						{{ $t('generic.search') }}
					</b-button>
				</div>
				<b-form-checkbox
					v-model="grouped"
					inline
				>
					{{ $t('search.grouped') }}
				</b-form-checkbox>
				<Alert
					v-if="!grouped"
					:message="$t('search.ungrouped_warning')"
					:cols="false"
					variant="warning"
					class="mt-3 text-start"
				/>
			</div>
		</b-form>
	</div>
</template>

<script>
import { hasPermission } from "@/utils/permissions"

// a new criterion: a free text on the machines
function emptyCriterion(link = "") {
	return {
		object: "InventoryBase",
		route: "asset/bases",
		field: "",
		fieldtype: "string",
		operator: "iexact",
		value: "",
		link,
	}
}

// stable keys of the criteria: a removed row takes its options with it
let lastKey = 0
function newKey() {
	lastKey += 1
	return lastKey
}

export default {
	name: 'Search',
	props: {
		searchgroup: { type: [Array, Object], default: () => [] },
		disableforgroup: { type: Boolean, default: false },
		initialGrouped: { type: Boolean, default: null },
	},
	emits: ['reloadDatatable'],
	data() {
		return {
			grouped: true,
			cansave: false,

			// groups of criteria, sent as search_data
			datavalues: [[emptyCriterion()]],
			// one key per criterion, same shape as datavalues
			rowkeys: [],

			routeopt: [],
			operatoropt: {},
			linkopt: [],
		}
	},
	watch: {
		'$i18n.locale'() {
			this.updateTranslations()
		}
	},
	mounted() {
		this.cansave = hasPermission("search_add_search")

		this.datavalues = JSON.parse(localStorage.getItem("multisearch")) ?? [[emptyCriterion()]]
		if (this.searchgroup.length) {
			this.datavalues = JSON.parse(JSON.stringify(this.searchgroup))
		}
		if (typeof this.initialGrouped === "boolean") {
			this.grouped = this.initialGrouped
		}
		this.buildKeys()
		this.updateTranslations()
	},

	methods: {
		normalizeGroupingState(search = {}) {
			if (typeof search.grouped === "boolean") {
				return search.grouped
			}

			if (typeof search.ungroup === "boolean") {
				return !search.ungroup
			}

			return true
		},

		buildKeys() {
			this.rowkeys = this.datavalues.map((group) => group.map(() => newKey()))
		},

		updateTranslations() {
			this.routeopt = [
				{ value: "asset/bases", text: this.$t("title.assets") },
				{ value: "accountinfo/config?datatarget=ASSET", text: this.$t("title.accountinfo") },
				{ value: "deployment/results", text: this.$t("title.deployment") },
				{ value: "asset/logs", text: this.$t("title.inventory_logs") },
				{ value: "templates", text: this.$t("title.inventory") },
				{ value: "snmp/scanner", text: this.$t("network.snmpscanner") },
				{ value: "software_dictionary", text: this.$t("title.software_dictionary") },
			]
			// without this right the search answers 403
			if (hasPermission("security_view_vulnerability")) {
				this.routeopt.push(
					{ value: "vulnerabilities", text: this.$t("vulnerability_search.route_vulnerabilities") },
					{ value: "security", text: this.$t("vulnerability_search.route_security") },
				)
			}
			this.routeopt.sort((a, b) => (a.text > b.text ? 1 : (b.text > a.text ? -1 : 0)))

			const equal = { value: "iexact", text: this.$t("search.iexact") }
			const ranges = ["gt", "gte", "lt", "lte"].map((operator) => ({ value: operator, text: this.$t("search." + operator) }))
			this.operatoropt = {
				"string": [
					equal,
					{ value: "icontains", text: this.$t("search.icontains") },
					{ value: "istartswith", text: this.$t("search.istartswith") },
					{ value: "iendswith", text: this.$t("search.iendswith") },
				],
				"integer": [equal, ...ranges],
				"datetime": [equal, ...ranges],
				"select": [equal],
				"checkbox": [equal],
				"choice": [equal],
				// security criteria: numbers and enums compare exactly, dates by range
				"number": [{ value: "exact", text: this.$t("search.iexact") }, ...ranges],
				"date": ranges,
				"enum": [{ value: "exact", text: this.$t("search.iexact") }],
				"yesno": [{ value: "exact", text: this.$t("search.iexact") }],
			}

			this.linkopt = [
				{ value: "AND", text: this.$t("search.and") },
				{ value: "OR", text: this.$t("search.or") }
			]
		},

		onSubmit(event) {
			event.preventDefault()
			localStorage.setItem("multisearch", JSON.stringify(this.datavalues))
			this.$emit("reloadDatatable", {
				search_data: this.datavalues,
				grouped: this.grouped,
				ungroup: !this.grouped
			})
		},

		// a criterion reports its changes, applied here to search_data
		updateCriterion(criterion, patch) {
			Object.assign(criterion, patch)
		},

		addField(masterindex) {
			this.datavalues[masterindex].push(emptyCriterion("AND"))
			this.rowkeys[masterindex].push(newKey())
		},

		removeField(masterindex, index) {
			this.datavalues[masterindex].splice(index, 1)
			this.rowkeys[masterindex].splice(index, 1)
		},

		addGroup() {
			this.datavalues.push([emptyCriterion("AND")])
			this.rowkeys.push([newKey()])
		},

		removeGroup(masterindex) {
			this.datavalues.splice(masterindex, 1)
			this.rowkeys.splice(masterindex, 1)
		},

		useSaveSearch(search) {
			this.datavalues = JSON.parse(JSON.stringify(search))
			this.grouped = this.normalizeGroupingState(search)
			// new keys: every criterion reloads its fields
			this.buildKeys()

			localStorage.setItem("multisearch", JSON.stringify(this.datavalues))
			this.$emit("reloadDatatable", {
				search_data: this.datavalues,
				grouped: this.grouped,
				ungroup: !this.grouped
			})
		},
	}
}
</script>
