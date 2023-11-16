<template>
	<div id="ldap">
		<!-- Display success box message -->
		<div v-if="successed">
			<Alert 
				:message="$t('message.success_saved')" 
				variant="success"
			/>
		</div>

		<!-- Display error box message -->
		<div v-if="successed">
			<Alert 
				:message="errorMsg.message" 
				variant="danger"
			/>
		</div>
		
		<div>
			<b-list-group flush>
				<b-list-group-item 
					class="d-flex justify-content-between align-items-center"
				>
					<div>
						<h4 class="mb-1">
							{{ $t("authentication.priority") }}
						</h4>
						<p class="mb-1">
							{{ $t("authentication.ldap_priority") }}
						</p>
					</div>
					<div>
						<label class="form-check form-switch">
							<input 
								v-model="priority"
								class="form-check-input"
								type="checkbox"
								:disabled="!canedit"
								@change="setPriority(
									ldapdata[0].id, priority
								)"
							>
						</label>
					</div>
				</b-list-group-item>
			</b-list-group>
		</div>
		<hr>
		<AddLdapModal
			:canadd="canadd"
			:canedit="canedit"
			:candelete="candelete"
			page-title="ldap-authentication"
		/>
	</div>
</template>

<script>
import Axios from 'axios'
import i18n from '@/i18n'
import Alert from '@/components/Alert/Alert'
import AddLdapModal from '@/components/Modals/AddItem/AddLdapModal'

export default {
	name: "Ldap",
	components: { Alert, AddLdapModal },
	data() {
		return {
			errorMsg: null,
			loading: true,
			errored: false,
			canview: false,
			canedit: false,
			canadd: false,
			candelete: false,
			successed: false,
			succesMsg: null,
			priority: false,
			ldapdata: [],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	mounted() {
		if(localStorage.getItem('permissions').split(",").includes("view_authconfig")) {
			this.canview = true
			if(localStorage.getItem('permissions').split(",").includes("change_authconfig")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("add_authconfig")) {
				this.canadd = true
			}
			if(localStorage.getItem('permissions').split(",").includes("delete_authconfig")) {
				this.candelete = true
			}
			this.getLdapConfiguration()
		} else {
			this.errorMsg = i18n.t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
		}
	},
	methods: {
		getLdapConfiguration() {
			Axios.get(process.env.VUE_APP_API_ROUTE+"auth_method?name=LDAP", { headers: this.header })
				.then(response => {
					this.ldapdata = response.data
					this.errorMsg = null
					this.errored = false
					if(this.ldapdata[0].priority == 1) {
						this.priority = true
					}
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		setPriority(authid, state) {
			if(state == true) {
				state = 1
			} else {
				state = 2
			}

			var rowupdate = {
				priority: state
			}

			Axios.patch(process.env.VUE_APP_API_ROUTE+"auth_method/"+authid+"/", rowupdate, { headers: this.header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
					this.succesMsg = null
					this.successed = false
				})
		}
	}
}
</script>