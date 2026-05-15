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
			excludedFields: [],
			templates: [],

			actionupdate: [],
			fields: [],
			fieldopt: [],
			actionstrigger: {},
			datavalues: [],

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
				const header = await this.$api.generic.options("automation/action/")
				this.rowheader = Object.keys(header.actions.POST).filter(
					(f) => !this.excludedFields.includes(f)
				)

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

				this.rowactiondata = actions.map((action) => {
					let value = action.value;
					if (action.field === 'template') {
						const template = this.templates.find(t => t.id === action.value);
						value = template ? template.name : action.value;
					}

					return {
						id: action.id,
						rule: action.rule,
						priority: action.priority,
						description: action.description,
						action: action.action,
						field: action.field,
						value: value,
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