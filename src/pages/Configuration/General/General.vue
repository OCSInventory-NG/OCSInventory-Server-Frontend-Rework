<template>
	<div
		id="general" 
		class="container-xl"
	>
		<div>
			<PageHeader page-title="config" />

			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<section v-if="successed">
							<Alert 
								:message="$t('message.success_saved')"
								:cols="true"
								variant="success"
							/>
						</section>

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
						<b-form
							v-else
							@submit="onSubmit"
						>
							<b-tabs 
								v-model="activetab"
								content-class="mt-3"
								fill
							>
								<b-tab
									v-for="config in configs"
									:key="config.name"
									:title="$t('configuration.' + config.name)"
								>
								<b-list-group
									v-for="parameter in config.value"
									:key="parameter.name"
									flush
								>
									<template v-if="parameter.length">
										<ConfigItem
											v-for="subparameter in parameter"
											:key="subparameter.name"
											v-model="subparameter.value"
											:item="subparameter"
											:error="itemErrors[subparameter.name] || ''"
											:disabled="!canedit"
										/>
									</template>
									<ConfigItem
										v-else
										v-model="parameter.value"
										:item="parameter"
										:error="itemErrors[parameter.name] || ''"
										:disabled="!canedit"
									/>
								</b-list-group>
							</b-tab>
							</b-tabs>
							<b-row>
								<b-col align-self="start" />
								<b-col 
									align-self="center"
									align="center"
									class="d-flex justify-content-center align-items-center gap-2 multisearch-btns"
								>
									<b-button 
										type="submit"
										variant="success"
										:disabled="!canedit || loadingcreate"
									>
										{{ $t('generic.save') }}
									</b-button>

									<b-spinner
										v-if="loadingcreate"
										small
										class="ms-2"
									/>
									<font-awesome-icon
										v-if="createwithsuccess"
										:icon="['fas', 'check']"
										class="ms-2"
										color="green"
									/>
									<font-awesome-icon
										v-if="createerror"
										:icon="['fas', 'xmark']"
										class="ms-2"
										color="red"
									/>
								</b-col>
								<b-col align-self="end" />
							</b-row>
						</b-form>

						<!-- Some changes start work on the server: asked first -->
						<b-modal
							v-model="confirmShown"
							:title="$t('configuration.confirm_title')"
							:ok-title="$t('generic.save')"
							:cancel-title="$t('generic.cancel')"
							@ok="save"
						>
							<p
								v-for="message in confirmMessages"
								:key="message"
							>
								{{ message }}
							</p>
						</b-modal>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { hasPermission } from "@/utils/permissions"

export default {
	name: 'General',
	data() {
		return {
			errored: false,
			errormsg: null,

			successed: false,
			successmsg: null,

			loadingcreate: false,
			createwithsuccess: false,
			createerror: false,

			configs: [],

			canedit: false,
			canview: false,

			activetab: 0,
			// values as loaded, by section then item, to see what changed
			saved: {},
			// messages of a refused save, by item name
			itemErrors: {},
			confirmShown: false,
			confirmMessages: [],

			loading: true,
		}
	},
	watch: {
		successed: function() {
			setTimeout(
				() => { this.successed = false
					this.createwithsuccess = false
					this.createerror = false
				}, 5000
			)
		},
		errored: function() {
			setTimeout(
				() => { this.errored = false
					this.createwithsuccess = false
					this.createerror = false
				}, 5000
			)
		}
	},
	async mounted() {
		if (hasPermission("config_view_config")) {
			this.canview = true
			if (hasPermission("config_change_config")) {
				this.canedit = true
			}
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
			return
		}

		// Data init
		await this.getConfig()
	},
	methods: {
		async getConfig() {
			try {
				const data = await this.$api.generic.get("config/")
				const configs = Array.isArray(data) ? data : (data?.results || [])

				this.configs = configs.filter((c) => !["snmp", "ipdiscover"].includes(c.name))
				this.saved = Object.fromEntries(this.configs.map((config) => [config.name, this.itemValues(config)]))

				// ?tab=<section> opens that section, e.g. from the security menu
				const index = this.configs.findIndex((config) => config.name === this.$route.query.tab)
				if (index !== -1) this.activetab = index

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		// item name -> value, nested items included. A number field gives text:
		// "0.6" and 0.6 are the same value
		itemValues(config) {
			const items = (config.value || []).flatMap((item) => (Array.isArray(item) ? item : [item]))
			return Object.fromEntries(items.map((item) => {
				const number = item.type === "number input" && item.value !== "" ? Number(item.value) : NaN
				return [item.name, JSON.stringify(Number.isNaN(number) ? item.value : number)]
			}))
		},

		onSubmit(event) {
			event.preventDefault()
			if(!this.canedit) return
			const config = this.configs?.[this.activetab]
			if (!config) return

			// a changed item with a configuration.<name>_confirm text starts work on the server
			const before = this.saved[config.name] || {}
			const now = this.itemValues(config)
			const messages = Object.keys(now)
				.filter((name) => now[name] !== before[name] && this.$te(`configuration.${name}_confirm`))
				.map((name) => this.$t(`configuration.${name}_confirm`))
			// both CPE scores share their text
			this.confirmMessages = [...new Set(messages)]
			if (this.confirmMessages.length) {
				this.confirmShown = true
				return
			}
			this.save()
		},

		async save() {
			this.loadingcreate = true
			this.createwithsuccess = false
			this.createerror = false
			this.itemErrors = {}

			try {
				const activeConfig = this.configs?.[this.activetab]
				if (!activeConfig) throw new Error("No active config selected")

				const configToUpdate = activeConfig.name

				// a number field gives text; decimals are kept (0.9 stays 0.9)
				const toNumber = (item) => {
					if (item?.type !== "number input" || item.value === "" || item.value === null) return item
					const n = Number(item.value)
					return { ...item, value: Number.isNaN(n) ? item.value : n }
				}
				const payload = {
					...activeConfig,
					value: Array.isArray(activeConfig.value)
						? activeConfig.value.map((item) => (Array.isArray(item) ? item.map(toNumber) : toNumber(item)))
						: activeConfig.value,
				}

				await this.$api.generic.patch(`config/${configToUpdate}/`, payload)
				this.saved = { ...this.saved, [configToUpdate]: this.itemValues(payload) }

				this.successmsg = "success"
				this.successed = true
				this.errormsg = null
				this.errored = false

				this.createwithsuccess = true
			} catch (e) {
				// a refused value comes as {"value": {"<item>": "message"}}, shown under its item
				const itemErrors = e.response?.data?.value
				if (itemErrors && typeof itemErrors === "object" && !Array.isArray(itemErrors)) {
					this.itemErrors = Object.fromEntries(Object.entries(itemErrors).map(([name, message]) =>
						[name, Array.isArray(message) ? message.join(" ") : String(message)]))
					this.errormsg = this.$t("configuration.invalid_values")
				} else {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				}
				this.errored = true
				this.successmsg = null
				this.successed = false

				this.createerror = true
			} finally {
				this.loadingcreate = false
			}
		},
	}
}
</script>