<template>
	<div id="cas">
		<!-- Display success box message -->
		<div v-if="successed">
			<Alert 
				:message="$t('message.success_saved')" 
				variant="success"
			/>
		</div>

		<!-- Display error box message -->
		<div v-if="errored">
			<Alert 
				:message="errorMsg.message" 
				variant="danger"
			/>
		</div>

		<div v-if="loading">
			<Loader />
		</div>
	
		<div v-else>
			<div class="row">
				<div class="col-auto">
					<h2>{{ $t("authentication.oidc_config") }}</h2>
				</div>
				<div class="col-auto ms-auto">
					<EditMappingModal
						v-if="canaddmapping"
						:id="oidcdata.id"
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
						v-for="(row, index) in oidcdata.config"
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
								v-if="!booleans.includes(index) && index != 'SIGN_ALGO'"
								:id="index"
								v-model="oidcdata.config[index]"
								:disabled="!canedit"
							/>
							<b-form-select
								v-if="index == 'SIGN_ALGO'"
								:id="index"
								v-model="oidcdata.config[index]" 
								:options="options" 
								class="mb-3 form-select"
								:disabled="!canedit"
							/>
							<label 
								v-if="booleans.includes(index)"
								class="form-check form-switch align-right"
							>
								<input 
									:id="index"
									v-model="oidcdata.config[index]"
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
import Axios from 'axios'
import i18n from '@/i18n'
import Alert from '@/components/Alert/Alert'
import Loader from '@/components/Loader/Loader'
import EditMappingModal from '@/components/Modals/EditItem/EditMappingModal'

export default {
	name: "Oidc",
	components: { Alert, Loader, EditMappingModal },
	data() {
		return {
			errorMsg: null,
			loading: true,
			errored: false,
			canview: false,
			canedit: false,
			successed: false,
			succesMsg: null,
			oidcdata: [],
			canaddmapping: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			},
			booleans: [
				"ALLOW_UNSECURED_JWT",
				"AUTO_REDIRECT",
				"ALLOW_UNSECURE_JWT",
				"VERIFY_SSL",
			],
			options: [
				{ value: "HS256", text: "HS256" },
				{ value: "RS256", text: "RS256" }
			]
		}
	},
	watch: {
		successed: function() {
			setTimeout(() => this.successed = false, 5000)
		}
	},
	mounted() {
		if(localStorage.getItem('permissions').split(",").includes("view_authconfig")) {
			this.canview = true
			if(localStorage.getItem('permissions').split(",").includes("change_authconfig")) {
				this.canedit = true
			}
			if(localStorage.getItem('permissions').split(",").includes("add_authmapping")) {
				this.canaddmapping = true
			}
			this.getOidcConfiguration()
		} else {
			this.errorMsg = i18n.t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
		}
	},
	methods: {
		getOidcConfiguration() {
			Axios.get(process.env.VUE_APP_API_ROUTE+"auth_method?name=OIDC", { headers: this.header })
				.then(response => {
					this.oidcdata = response.data[0].configs[0] ?? []
					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		// Submit edit cas config
		onSubmit(event) {
			event.preventDefault()

			delete this.oidcdata.mappings
			
			Axios.patch(process.env.VUE_APP_API_ROUTE+"auth_config/"+this.oidcdata.id+"/", this.oidcdata,
				{ headers: this.header })
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