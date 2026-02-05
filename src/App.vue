<template>
	<component :is="$route.meta.layout">
		<slot />
	</component>
</template>

<script>
import axios from 'axios'

export default {
	name: 'App',
	created() {
		const header = {
			"Content-Type": "application/json;charset=utf-8"
		}

		const token = this.getTokenFromUrl()
		if(token) {
			localStorage.setItem('token_authentication', token)
			localStorage.setItem('authenticated', true)
			this.clearAuthParams()
			this.getPermissions()
			return
		}

		if (localStorage.getItem("authenticated") === null
			|| localStorage.getItem("authenticated") === "false"
			|| localStorage.getItem('token_authentication') === null 
			|| localStorage.getItem('permissions') === null) {
			const noAuto = [...new URLSearchParams(window.location.search).keys()].some(k => k.toLowerCase() === 'noauto')
			axios.get(this.$config.BACKEND_API_ROUTE+"login/", { headers: header })
				.then(response => {
					if(response.data) {
						if(response.data.auto_redirect && !noAuto) {
							window.location.href = response.data.redirect_url
						} else {
							if (localStorage.getItem("authenticated") === null
								|| localStorage.getItem("authenticated") === "false"
								|| localStorage.getItem('token_authentication') === null 
								|| localStorage.getItem('permissions') === null) {
								this.$router.push({path:'/login'}).catch(() => {})
							}
						}
					}
				})
				.catch(e => {
					console.log(e.message)
				})
		}
	},
	methods: {
		getTokenFromUrl() {
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
		getPermissions() {
			const header = {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}

			axios.get(this.$config.BACKEND_API_ROUTE+"myaccount/", { headers: header })
				.then(responseAccount => {
					var tmpUser = responseAccount.data.full_permissions
					if(tmpUser.length != 0) {
						localStorage.setItem('permissions', tmpUser)
						this.$router.push('/dashboard')
					} else {
						this.errorMessage = this.$t("message.error_no_permissions")
						this.$router.push("/login").catch(() => {})
					}
				})
				.catch(e => {
					this.errorMessage = (e.response?.data?.error) ? e.response.data.error : e.message
				})
		}
	}
}
</script>

<style lang="scss">
@import "./assets/styles/ocsreports.scss";
</style>
