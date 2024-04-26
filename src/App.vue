<template>
	<component :is="$route.meta.layout">
		<slot />
	</component>
</template>

<script>
import axios from 'axios'

export default {
	name: 'App',
	beforeCreate() {
		const header = {
			"Content-Type": "application/json;charset=utf-8"
		}

		var sso = window.location.search

		if(sso) {
			axios.get(import.meta.env.VITE_APP_API_ROUTE+"callback/"+sso, { headers: header })
				.then(response => {
					if(response.data.token_authentication) {
						localStorage.setItem('token_authentication', response.data.token_authentication)
						localStorage.setItem('authenticated', true)
						this.getPermissions()
					}
				})
				.catch(e => {
					console.log(e.message)
				})
		} else {
			if (localStorage.getItem("authenticated") === null
			|| localStorage.getItem("authenticated") === "false"
			|| localStorage.getItem('token_authentication') === null 
			|| localStorage.getItem('permissions') === null) {
				axios.get(import.meta.env.VITE_APP_API_ROUTE+"login/", { headers: header })
					.then(response => {
						if(response.data) {
							if(response.data.auto_redirect) {
								window.location.href = response.data.redirect_url+window.location.origin
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
		}
	},
	methods: {
		getPermissions() {
			const header = {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}

			axios.get(import.meta.env.VITE_APP_API_ROUTE+"myaccount/", { headers: header })
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
					this.errorMessage = e.message
				})
		}
	}
}
</script>

<style lang="scss">
@import "./assets/styles/ocsreports.scss";
</style>