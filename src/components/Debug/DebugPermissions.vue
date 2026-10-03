<template>
	<p
		v-if="!trace.length && !checked.length"
		class="text-secondary mb-0"
	>
		{{ $t('debug.no_calls') }}
	</p>
	<p
		v-else-if="!rows.length && pending"
		class="text-secondary mb-0"
	>
		{{ $t('debug.resolving') }}
	</p>
	<p
		v-else-if="!rows.length && undetermined"
		class="text-secondary mb-0"
	>
		{{ $t('debug.permissions_undetermined') }}
	</p>
	<p
		v-else-if="!rows.length"
		class="text-secondary mb-0"
	>
		{{ $t('debug.no_permission_needed') }}
	</p>
	<template v-else>
		<p class="text-secondary">
			{{ $t('debug.permissions_intro') }}
		</p>
		<!-- same rows, labels and columns as the group permissions matrix -->
		<table class="table table-sm table-striped table-vcenter mb-0">
			<thead>
				<tr>
					<th>{{ $t('generic.type') }}</th>
					<th
						v-for="action in actions"
						:key="action"
						class="text-center"
					>
						{{ $t('generic.' + action) }}
					</th>
				</tr>
			</thead>
			<tbody>
				<tr
					v-for="row in rows"
					:key="row.key"
				>
					<td>{{ row.label }}</td>
					<td
						v-for="action in actions"
						:key="action"
						class="text-center"
					>
						<font-awesome-icon
							v-if="row.actions.has(action)"
							:icon="['fas', 'check']"
						/>
					</td>
				</tr>
			</tbody>
		</table>
	</template>
</template>

<script>
// column order of the group permissions matrix, see Matrix.vue
const ACTIONS = ["add", "change", "delete", "view"]
// frontend codenames are "<app_label>_<action>_<model>", app labels may contain "_"
const FRONTEND_CODENAME = /^(.+?)_(add|change|delete|view)_(.+)$/

export default {
	name: "DebugPermissions",
	// the slot passes the whole debug context, only some of it is used here
	inheritAttrs: false,
	props: {
		trace: { type: Array, default: () => [] },
		calls: { type: Object, default: () => ({}) },
		checked: { type: Array, default: () => [] },
	},
	data() {
		return {
			actions: ACTIONS,
		}
	},
	computed: {
		// some calls are not resolved yet, or their resolution failed
		pending() {
			return this.trace.some((entry) => !(entry.key in this.calls))
		},
		// the backend could not tell which permissions these calls need
		undetermined() {
			return this.trace.some((entry) => ["custom", "error"].includes(this.calls[entry.key]?.access))
		},
		// a box is ticked when a call of the page required the permission, or
		// when the page checked it to show one of its buttons
		rows() {
			const rows = new Map()
			const add = (action, model) => {
				const row = rows.get(model) || { key: model, label: this.permissionLabel(model), actions: new Set() }
				row.actions.add(action)
				rows.set(model, row)
			}

			for (const entry of this.trace) {
				for (const permission of this.calls[entry.key]?.permissions || []) {
					const codename = permission.codename.split(".").pop()
					const action = ACTIONS.find((prefix) => codename.startsWith(prefix + "_"))
					if (action) add(action, codename.slice(action.length + 1))
				}
			}
			for (const codename of this.checked) {
				const match = FRONTEND_CODENAME.exec(codename)
				if (match) add(match[2], match[3])
			}

			// acting on a type needs to list it first, like the default admin group,
			// so every type listed also needs View
			for (const row of rows.values()) row.actions.add("view")

			return [...rows.values()].sort((a, b) => a.label.localeCompare(b.label))
		},
	},
	methods: {
		// same translation as the group permissions matrix, see GroupModal.vue
		permissionLabel(key) {
			return this.$te("permission." + key) ? this.$t("permission." + key) : key
		},
	},
}
</script>
