<template>
	<div 
		id="edit-package"
		class="container-xl"
	>
		<div>
			<PageHeader page-title="actionlist" />

			<div class="page-body">
				<div class="card">
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
							<b-row align="center">
								<h2>{{ rowpackagedata.name }}</h2>
							</b-row>
							<b-row align="center">
								<b-col>
									<p>{{ $t('deployment.description') }} : {{ rowpackagedata.description }}</p>
									<p>{{ $t('deployment.target_os') }} : {{ $t('template.'+rowpackagedata.target_os) }}</p>
									<p>
										{{ $t('deployment.date_created') }} : 
										{{ formatDate(rowpackagedata.date_created, 'date_created') }}
									</p>
								</b-col>
							</b-row><br>
							<ActionListModal
								v-if="canadd"
								:package="id"
								@reloadPackage="reloadPackage"
							/>

							<Draggable 
								:rowdata="rowactiondata"
								:rowheader="rowheader"
								:canedit="canedit"
								:candelete="candelete"
								is-sticky
								@reloadDatatable="reloadDatatable"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'EditPackage',
	props: {
		id: { type: String, required: true }
	},
	data() {
		return {
			errormsg: null,
			errored: false,

			successmsg: null,
			successed: false,
			
			canadd: false,
			canedit: false,
			candelete: false,

			rowpackagedata: [],
			rowactiondata: [],
			rowheader: [],
			excludedFields: [
				"uploaded_file"
			],
			
			loading: true,
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

		// Data init
		await this.loadInitial()
	},
	methods: {
		async loadInitial() {
			this.loading = true
			try {
				// Get header
				const header = await this.$api.generic.options("deployment/actions/")
				this.rowheader = Object.keys(header.actions.POST).filter(
					(f) => !this.excludedFields.includes(f)
				)

				// Get package
				await this.getPackage()

				this.errored = false
				this.errormsg = null
			} catch (e) {
				this.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		async getPackage(reload = false) {
			try {
				this.loading = true

				const data = await this.$api.generic.get(
					`deployment/packages/${this.id}/`,
					{},
					{ expand: "actions_list" }
				)

				if (!reload) {
					this.rowpackagedata = data
				}

				const actions = Array.isArray(data?.actions_list) ? data.actions_list : []

				this.rowactiondata = actions.map((action) => ({
					...action,
					file: (action?.file && typeof action.file === "object")
						? action.file.name
						: action?.file,
				}))

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		async reloadDatatable() {
			await this.getPackage(true)
		},

		async reloadPackage() {
			await this.getPackage(false)
		},

		formatDate(value, key) {
			const dateFields = ['last_updated', 'created_at', 'updated_at', 'date_created']
			if (this.$te('inventory.' + value)) return this.$t('inventory.' + value)
			if (dateFields.includes(key)) {
				return new Date(value).toLocaleString(this.$i18n.locale)
			}
			return value
		},
	}
}
</script>
