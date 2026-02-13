<template>
	<div id="cas">
		<div v-if="successed">
			<Alert 
				:message="$t('message.success_saved')"
				:cols="true"
				variant="success"
			/>
		</div>

		<div v-if="errored">
			<Alert 
				:message="errormsg.message"
				:cols="true"
				variant="danger"
			/>
		</div>

		<div v-if="loading">
			<Loader />
		</div>
	
		<div v-else>
			<div class="row">
				<div class="col-auto">
					<h2>{{ $t("authentication.cas_config") }}</h2>
				</div>
				<div class="col-auto ms-auto">
					<MappingModal
						v-if="canaddmapping"
						:id="casdata.id"
					/>
				</div>
			</div>
			<b-form
				@submit="onSubmit"
			>
				<b-list-group
					flush
				>
					<b-list-group-item 
						v-for="(row, index) in casdata.config"
						:key="index"
						class="d-flex justify-content-between align-items-center"
					>
						<div>
							<h4 class="mb-1">
								{{ index }}
							</h4>
							<p class="mb-1">
								{{ $t("authentication.des_"+index) }}
							</p>
						</div>
						<div class="col-6">
							<b-form-input
								v-if="index != 'VERSION' && index != 'AUTO_REDIRECT'"
								:id="index"
								v-model="casdata.config[index]"
								:disabled="!canedit"
							/>
							<v-select
								v-if="index == 'VERSION'"
								:id="index"
								v-model="casdata.config[index]" 
								:options="options"
								:reduce="text => text.value"
								:clearable="false"
								:disabled="!canedit"
								label="text"
								class="mb-3"
							/>
							<label 
								v-if="index == 'AUTO_REDIRECT'"
								class="form-check form-switch align-right"
							>
								<input 
									:id="index"
									v-model="casdata.config[index]"
									class="form-check-input"
									type="checkbox"
									:value="true"
									:disabled="!canedit"
								>
							</label>
						</div>
					</b-list-group-item>
				</b-list-group>
				<b-row>
					<b-col align-self="start" />
					<b-col 
						align-self="center"
						align="center"
					>
						<b-button 
							type="submit"
							variant="success"
							:disabled="!canedit"
						>
							{{ $t('generic.save') }}
						</b-button>
					</b-col>
					<b-col align-self="end" />
				</b-row>
			</b-form>
		</div>
	</div>
</template>

<script>
export default {
	name: "Cas",
	data() {
		return {
			errored: false,
			errormsg: null,

			successed: false,
			successmsg: null,
			
			canedit: false,
			canaddmapping: false,

			casdata: [],
			options: [
				{ value: 1, text: "v1" },
				{ value: 2, text: "v2" },
				{ value: 3, text: "v3" }
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

		if (permissions.includes("auth_config_view_authconfig")) {
			if (permissions.includes("auth_mapping_add_authmapping")) {
				this.canaddmapping = true
			}
			if (permissions.includes("auth_config_change_authconfig")) {
				this.canedit = true
			}
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
			this.isbusy = false
			return
		}

		// Data init
		await this.getCasConfiguration()
	},
	methods: {
		async getCasConfiguration() {
			try {
				const data = await this.$api.generic.get(
					"auth_method/",
					{ name: "CAS" },
					{ expand: "configs" }
				)

				const methods = Array.isArray(data) ? data : (data?.results || [])
				this.casdata = methods?.[0]?.configs?.[0] ?? []

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = e
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		async onSubmit(event) {
			event.preventDefault()

			try {
				const { mappings: _mappings, ...payload } = this.casdata || {}

				await this.$api.generic.patch(
					`auth_config/${this.casdata.id}/`,
					payload
				)

				this.successmsg = "success"
				this.successed = true
				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = e
				this.errored = true
				this.successmsg = null
				this.successed = false
			}
		},
	}
}
</script>