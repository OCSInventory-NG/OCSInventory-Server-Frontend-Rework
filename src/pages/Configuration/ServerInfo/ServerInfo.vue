<template>
	<div
		id="server-info"
		class="container-xl"
	>
		<PageHeader page-title="serverinfo" />

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
						<div class="d-flex justify-content-end mb-4">
							<b-button
								variant="primary"
								class="d-sm-inline-block btn-modal"
								@click="copyToClipboard('global', globalJson)"
							>
								<font-awesome-icon :icon="['fas', 'copy']" />
								{{ copiedKey === 'global' ? $t("serverinfo.copied") : $t("serverinfo.copy_all") }}
							</b-button>
						</div>

						<div class="mb-4">
							<div class="serverinfo-block">
								<div class="serverinfo-block-header">
									<span class="serverinfo-block-title">{{ $t("serverinfo.frontend_title") }}</span>
									<b-button
										size="sm"
										variant="outline-secondary"
										class="d-sm-inline-block btn-modal"
										@click="copyToClipboard('frontend', frontendJson)"
									>
										<font-awesome-icon :icon="['fas', 'copy']" />
										{{ copiedKey === 'frontend' ? $t("serverinfo.copied") : $t("serverinfo.copy") }}
									</b-button>
								</div>
								<pre class="serverinfo-code-block">{{ frontendJson }}</pre>
							</div>
						</div>

						<div>
							<div class="serverinfo-block">
								<div class="serverinfo-block-header">
									<span class="serverinfo-block-title">{{ $t("serverinfo.backend_title") }}</span>
									<b-button
										size="sm"
										variant="outline-secondary"
										class="d-sm-inline-block btn-modal"
										@click="copyToClipboard('backend', backendJson)"
									>
										<font-awesome-icon :icon="['fas', 'copy']" />
										{{ copiedKey === 'backend' ? $t("serverinfo.copied") : $t("serverinfo.copy") }}
									</b-button>
								</div>
								<pre class="serverinfo-code-block">{{ backendJson }}</pre>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: "ServerInfo",
	data() {
		return {
			errored: false,
			errormsg: null,
			loading: true,
			copiedKey: null,
			copyTimeout: null,
			backendInfo: {
				authentication_type: [],
				infrastructure_type: null,
				operating_system: null,
				operating_system_version: null,
				db_engine: null,
				ocs_configuration: [],
				python_version: null,
				python_libs_version: {},
			},
			frontendInfo: {
				browser: null,
				browser_version: null,
			},
		}
	},
	computed: {
		frontendJson() {
			return JSON.stringify(this.frontendInfo, null, 2)
		},
		backendJson() {
			return JSON.stringify(this.backendInfo, null, 2)
		},
		globalJson() {
			return JSON.stringify({
				frontend: this.frontendInfo,
				backend: this.backendInfo,
			}, null, 2)
		},
	},
	beforeUnmount() {
		if (this.copyTimeout) {
			clearTimeout(this.copyTimeout)
		}
	},
	async mounted() {
		this.frontendInfo = this.getBrowserInfo()

		const rawPermissions = localStorage.getItem("permissions")
		const permissions = rawPermissions ? rawPermissions.split(",") : []

		if (!permissions.includes("config_view_config")) {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
			return
		}

		await this.getServerInfo()
	},
	methods: {
		async getServerInfo() {
			this.loading = true
			this.errored = false
			this.errormsg = null

			try {
				const data = await this.$api.generic.get("server-info/")

				this.backendInfo = {
					authentication_type: Array.isArray(data?.authentication_type) ? data.authentication_type : [],
					infrastructure_type: data?.infrastructure_type ?? null,
					operating_system: data?.operating_system ?? null,
					operating_system_version: data?.operating_system_version ?? null,
					db_engine: data?.db_engine ?? null,
					ocs_configuration: Array.isArray(data?.ocs_configuration) ? data.ocs_configuration : [],
					python_version: data?.python_version ?? null,
					python_libs_version: this.isPlainObject(data?.python_libs_version) ? data.python_libs_version : {},
				}
			} catch (e) {
				this.errormsg = e?.response?.data?.error || e?.message || String(e)
				this.errored = true
			} finally {
				this.loading = false
			}
		},
		async copyToClipboard(key, value) {
			try {
				if (navigator.clipboard?.writeText) {
					await navigator.clipboard.writeText(value)
				} else {
					this.copyWithFallback(value)
				}

				this.copiedKey = key

				if (this.copyTimeout) {
					clearTimeout(this.copyTimeout)
				}

				this.copyTimeout = setTimeout(() => {
					this.copiedKey = null
				}, 1500)
			} catch (e) {
				this.errormsg = e?.message || String(e)
				this.errored = true
			}
		},
		copyWithFallback(value) {
			const textarea = document.createElement("textarea")
			textarea.value = value
			textarea.setAttribute("readonly", "")
			textarea.style.position = "absolute"
			textarea.style.left = "-9999px"

			document.body.appendChild(textarea)
			textarea.select()
			document.execCommand("copy")
			document.body.removeChild(textarea)
		},
		getBrowserInfo() {
			const userAgent = navigator.userAgent || ""
			const brands = navigator.userAgentData?.brands || []

			return {
				browser: this.getBrowserName(userAgent, brands),
				browser_version: this.getBrowserVersion(userAgent, this.getBrowserName(userAgent, brands)),
			}
		},
		getBrowserName(userAgent, brands = []) {
			const brandName = brands
				.map((brand) => brand.brand)
				.find((brand) => !["Not A(Brand)", "Chromium"].includes(brand))

			if (brandName) {
				return brandName
			}

			if (/Edg\//.test(userAgent)) return "Microsoft Edge"
			if (/OPR\//.test(userAgent) || /Opera/.test(userAgent)) return "Opera"
			if (/Firefox\//.test(userAgent)) return "Firefox"
			if (/Chrome\//.test(userAgent) && !/Edg\//.test(userAgent)) return "Chrome"
			if (/Safari\//.test(userAgent) && !/Chrome\//.test(userAgent)) return "Safari"
			if (/Trident\//.test(userAgent) || /MSIE /.test(userAgent)) return "Internet Explorer"

			return this.$t("serverinfo.unknown_browser")
		},
		getBrowserVersion(userAgent, browserName) {
			const matchers = {
				"Microsoft Edge": /Edg\/([\d.]+)/,
				Opera: /(?:OPR|Opera)\/([\d.]+)/,
				Firefox: /Firefox\/([\d.]+)/,
				Chrome: /Chrome\/([\d.]+)/,
				Safari: /Version\/([\d.]+)/,
				"Internet Explorer": /(?:MSIE |rv:)([\d.]+)/,
			}

			const matcher = matchers[browserName]
			return matcher ? (userAgent.match(matcher)?.[1] ?? null) : null
		},
		isPlainObject(value) {
			return Object.prototype.toString.call(value) === "[object Object]"
		},
	},
}
</script>
