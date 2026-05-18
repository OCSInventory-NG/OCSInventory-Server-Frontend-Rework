<template>
	<div 
		id="edit-package"
		class="container-xl"
	>
		<div>
			<div class="page-body">
				<div class="card-body">
					<section v-if="errored">
						<Alert 
							:message="errormsg"
							:cols="true"
							variant="danger"
						/>
					</section>

					<div 
						v-if="loading"
						class="ocs-loader"
					>
						<Loader />
					</div>

					<div v-else>
						<ActionRuleModal
							v-if="canadd"
							:id="id"
							:trigger="trigger"
							:view-only="viewOnly"
							@reload-datatable="reloadDatatable"
						/>
						<Draggable 
							:rowdata="rowactiondata"
							:rowheader="rowheader"
							:canedit="canedit"
							:candelete="candelete"
							:apiroute="`automation/action`"
							editcomponent="ActionRuleModal"
							:edit-props="{ trigger }"
							title="automation/action"
							translationkey="automation.action."
							is-sticky
							@reload-datatable="reloadDatatable"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import ActionRuleModal from '@/components/Modals/Item/ActionRuleModal.vue'

export default {
	name: "RuleAction",
	components: {
		ActionRuleModal,
	},
	props: {
		id: { type: [Number, String], required: true },
		trigger: { type: String, default: "inventory_received" },
		actions: { type: Array, default: null },
		triggers: { type: Array, default: () => [] },
		viewOnly: { type: Boolean, default: false }
	},
	data() {
		return {
			errormsg: null,
			errored: false,

			successed: false,
			successmsg: null,

			canadd: false,
			canedit: false,
			candelete: false,

			rowpackagedata: [],
			rowactiondata: [],
			rowheader: [],
			excludedFields: ["content_type", "object_id", "object_slug"],
			templates: [],

			actionupdate: [],
			fields: [],
			fieldopt: [],
			actionstrigger: {},
			datavalues: [],
			accountinfoFields: {},
			accountinfoValues: {},
			fieldValues: {},
			choiceValues: {},

			loading: false,
		}
	},
	watch: {
		successed: function() {
			setTimeout(() => this.successed = false, 5000)
		}
	},
	async mounted() {
		const rawPermissions = localStorage.getItem('permissions')
		const permissions = rawPermissions ? rawPermissions.split(",") : []

		if (permissions.includes("action_view_deploymentaction")) {
			if (permissions.includes("action_add_deploymentaction")) {
				this.canadd = true
			}
			if (permissions.includes("action_change_deploymentaction")) {
				this.canedit = true
			}
			if (permissions.includes("action_delete_deploymentaction")) {
				this.candelete = true
			}
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
			return
		}

		await this.loadTemplates();
		await this.loadInitial()
	},
	methods: {
		async loadTemplates() {
			try {
				const response = await this.$api.generic.get('templates/');
				this.templates = Array.isArray(response)
					? response
					: response.results ?? response;
			} catch ( e ) {
				console.error('Erreur lors du chargement des templates:', e);
				this.templates = [];
			}
		},

		async loadInitial() {
			this.loading = true
			try {
				const triggerObj = this.triggers.find((t) => t.trigger === this.trigger)
				this.actionstrigger = triggerObj?.action_targets || {}

				const header = await this.$api.generic.options("automation/action/")
				this.rowheader = Object.keys(header.actions.POST).filter(
					(f) => !this.excludedFields.includes(f)
				)
				this.rowheader.splice(this.rowheader.indexOf("action"), 0, "object")

				await this.getAction()

				this.errored = false
				this.errormsg = null
			} catch (e) {
				this.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		getObjectSlug(action) {
			let objectSlug = action.object_slug
				? String(action.object_slug).toLowerCase()
				: (action.field?.startsWith("accountdata:") ? "accountinfo.accountinfoconfig" : null)

			if (!objectSlug) {
				objectSlug = Object.keys(this.actionstrigger).find((model) => {
					return this.actionstrigger[model].includes(action.field)
				})
			}

			return objectSlug
		},

		getObjectLabel(action) {
			const objectSlug = this.getObjectSlug(action)

			return {
				"accountinfo.accountinfoconfig": this.$t("title.accountinfo"),
				"inventory_base.inventorybase": this.$t("title.assets"),
				"auth.user": this.$t("title.users"),
			}[objectSlug] || objectSlug
		},

		getFieldLabel(action) {
			if (!action.field?.startsWith("accountdata:")) return action.field

			const fieldId = action.field.split(":")[1]
			return this.accountinfoFields[fieldId] || action.field
		},

		getValueLabel(action, value) {
			const valueId = String(action.value ?? "").replace(/\[|\]/g, "")

			if (action.field === "template") {
				return this.fieldValues.template?.[valueId] || value
			}

			if (action.field?.startsWith("accountdata:")) {
				const fieldId = action.field.split(":")[1]
				return this.accountinfoValues[fieldId]?.[valueId] || value
			}

			return this.choiceValues[action.field]?.[valueId]
				|| this.fieldValues[action.field]?.[valueId]
				|| value
		},

		displayValue(label, payloadValue = undefined) {
			const value = Object(label || "")
			Object.defineProperty(value, "toJSON", {
				value: () => payloadValue,
			})
			return value
		},

		getObjectRoute(action) {
			return {
				"inventory_base.inventorybase": "asset/bases/",
				"auth.user": "users/",
			}[this.getObjectSlug(action)]
		},

		async loadChoiceValues(actions) {
			const routeByObject = actions.reduce((acc, action) => {
				const route = this.getObjectRoute(action)
				if (route) acc[this.getObjectSlug(action)] = route
				return acc
			}, {})

			const options = await Promise.all(Object.values(routeByObject).map(async (route) => {
				return this.$api.generic.options(route)
			}))

			this.choiceValues = options.reduce((acc, option) => {
				for (const field in option?.actions?.POST || {}) {
					const choices = option.actions.POST[field]?.choices || []
					if (choices.length) {
						acc[field] = choices.reduce((choiceAcc, choice) => {
							choiceAcc[String(choice.value)] = choice.display_name || choice.value
							return choiceAcc
						}, acc[field] || {})
					}
				}
				return acc
			}, {})
		},

		getFieldValueRoute(action) {
			const objectSlug = this.getObjectSlug(action)

			if (action.field === "template")
				return "templates/"
			if (objectSlug === "inventory_base.inventorybase" && action.field === "groups")
				return "asset/groups/"
			if (objectSlug === "auth.user" && action.field === "groups")
				return "groups/"
			if (action.description === "field" && action.field)
				return action.field + "/"

			return null
		},

		async loadFieldValues(actions) {
			const routeByField = actions.reduce((acc, action) => {
				const route = this.getFieldValueRoute(action)
				if (route) acc[action.field] = route
				return acc
			}, {})

			const values = await Promise.all(Object.entries(routeByField).map(async ([field, route]) => {
				const response = await this.$api.generic.get(route)
				const rows = Array.isArray(response) ? response : (response?.results || [])
				return [field, rows]
			}))

			this.fieldValues = values.reduce((acc, [field, rows]) => {
				acc[field] = rows.reduce((rowAcc, row) => {
					rowAcc[row.id] = row.name || row.username || row.id
					return rowAcc
				}, {})
				return acc
			}, {})
		},

		async loadAccountinfoFields(actions) {
			const accountinfoActions = actions.filter((action) => action.field?.startsWith("accountdata:"))
			if (!accountinfoActions.length) return

			const datatarget = this.trigger === "netdevice_received" ? "IPDISCOVER" : "ASSET"
			const data = await this.$api.generic.get("accountinfo/config/", {}, { datatarget })
			const fields = Array.isArray(data) ? data : (data?.results || [])

			this.accountinfoFields = fields.reduce((acc, field) => {
				acc[field.id] = field.name
				return acc
			}, {})

			const fieldIds = [...new Set(accountinfoActions.map((action) => action.field.split(":")[1]))]
			const values = await Promise.all(fieldIds.map(async (fieldId) => {
				const response = await this.$api.generic.get("accountinfo/value/", { accountinfo_config: fieldId })
				const rows = Array.isArray(response) ? response : (response?.results || [])
				return [fieldId, rows]
			}))

			this.accountinfoValues = values.reduce((acc, [fieldId, rows]) => {
				acc[fieldId] = rows.reduce((rowAcc, row) => {
					rowAcc[row.id] = row.value
					return rowAcc
				}, {})
				return acc
			}, {})
		},

		async getAction(reload = false) {
			try {
				this.loading = true;
				const data = await this.$api.generic.get(
					`automation/action/?rule=${this.id}`,
					{},
					{ expand: "actions" }
				);
				if (!reload) {
					this.rowpackagedata = data;
				}

				const actions = Array.isArray(data) ? data : data.results || [];
				await Promise.all([
					this.loadAccountinfoFields(actions),
					this.loadFieldValues(actions),
					this.loadChoiceValues(actions),
				])

				this.rowactiondata = actions.map((action) => {
					const value = this.getValueLabel(action, action.value)

					return {
						id: action.id,
						rule: action.rule,
						priority: action.priority,
						description: action.description,
						object: this.displayValue(this.getObjectLabel(action)),
						action: action.action,
						field: this.displayValue(this.getFieldLabel(action), action.field),
						value: this.displayValue(value, action.value),
					};
				});

				this.errormsg = null;
				this.errored = false;
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message;
				this.errored = true;
			} finally {
				this.loading = false;
			}
		},

		async reloadDatatable() {
			await this.getAction(true)
		},

		async reloadAction() {
			await this.getAction(false)
		},
	}
}
</script>