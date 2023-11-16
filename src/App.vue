<template>
	<div id="ocsreports">
		<vue-extend-layouts loading="loading" />
	</div>
</template>

<script>
import VueExtendLayouts from 'vue-extend-layout'
import Axios from 'axios'
import i18n from './i18n'

export default {
	name: "Ocsreports",
	components: { VueExtendLayouts },
	beforeCreate() {
		const header = {
			"Content-Type": "application/json;charset=utf-8"
		}

		var sso = window.location.search

		if(sso) {
			Axios.get(process.env.VUE_APP_API_ROUTE+"callback/"+sso, { headers: header })
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
				Axios.get(process.env.VUE_APP_API_ROUTE+"login/", { headers: header })
					.then(response => {
						if(response.data) {
							if(response.data.auto_redirect) {
								window.location.href = response.data.redirect_url+window.location.origin
							} else {
								const currentPath = this.$router.history.current.path;

								if (currentPath === "/" || currentPath === "/ocsreports") {
									this.$router.push("/dashboard");
								}

								if (localStorage.getItem("authenticated") === null
								|| localStorage.getItem("authenticated") === "false"
								|| localStorage.getItem('token_authentication') === null 
								|| localStorage.getItem('permissions') === null) {
									this.$router.push("/login").catch(() => {});
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

			Axios.get(process.env.VUE_APP_API_ROUTE+"myaccount/", { headers: header })
				.then(responseAccount => {
					var tmpUser = responseAccount.data.full_permissions
					if(tmpUser.length != 0) {
						localStorage.setItem('permissions', tmpUser)
						this.$router.push('/dashboard')
					} else {
						this.errorMessage = i18n.t("message.error_no_permissions")
						this.$router.push("/login").catch(() => {});
					}
				})
				.catch(e => {
					this.errorMessage = e.message
				})
		}
	}
}
</script>

<style src="./styles/ocsreports.scss" lang="scss" />