<template>
	<component :is="$route.meta.layout">
		<slot />
	</component>
</template>

<script>
export default {
	name: 'App',
	async created() {
		const token = await this.getTokenFromUrl()
		if (token) {
			localStorage.setItem('token_authentication', token)
			localStorage.setItem('authenticated', true)
			this.clearAuthParams()
			await this.getPermissions()
			return
		}

		const notAuthenticated =
			localStorage.getItem("authenticated") === null ||
			localStorage.getItem("authenticated") === "false" ||
			localStorage.getItem("token_authentication") === null ||
			localStorage.getItem("permissions") === null

		if (!notAuthenticated) return

		const noAuto = [...new URLSearchParams(window.location.search).keys()]
			.some((k) => k.toLowerCase() === "noauto")

		try {
			const loginInfo = await this.$api.generic.get("login/")

			if (loginInfo?.auto_redirect && !noAuto) {
				localStorage.setItem('auth_method', 'sso')
				window.location.href = loginInfo.redirect_url
				return
			}

			const stillNotAuthenticated =
				localStorage.getItem("authenticated") === null ||
				localStorage.getItem("authenticated") === "false" ||
				localStorage.getItem("token_authentication") === null ||
				localStorage.getItem("permissions") === null

			if (stillNotAuthenticated) {
				this.$router.push({
					path: '/login',
					query: Object.fromEntries(new URLSearchParams(window.location.search)),
				}).catch(() => {})
			}
		} catch (e) {
			console.log(e.message)
		}
	},
	methods: {
		async getTokenFromUrl() {
			const hash = window.location.hash ? window.location.hash.substring(1) : ""
			const hashParams = new URLSearchParams(hash)
			const searchParams = new URLSearchParams(window.location.search)
			return hashParams.get("token_authentication") || searchParams.get("token_authentication")
		},

		clearAuthParams() {
			const searchParams = new URLSearchParams(window.location.search)
			searchParams.delete("token_authentication")
			const search = searchParams.toString()
			const cleanUrl = window.location.pathname + (search ? `?${search}` : "")
			window.history.replaceState({}, document.title, cleanUrl)
		},

		async getPermissions() {
			try {
				const account = await this.$api.generic.get("myaccount/")
				const perms = account?.full_permissions || []

				if (perms.length) {
					localStorage.setItem('permissions', perms)
					this.$router.push('/dashboard')
				} else {
					this.errorMessage = this.$t("message.error_no_permissions")
					this.$router.push("/login").catch(() => {})
				}
			} catch (e) {
				this.errorMessage = (e.response?.data?.error) ? e.response.data.error : e.message
			}
		},
	},
}
</script>

<style lang="scss">
@import "./assets/styles/ocsreports.scss";
</style>
