<template>
	<div
		id="my-account" 
		class="container-xl"
	>
		<!-- Header page -->
		<div>
			<!-- Page header -->
			<PageHeader 
				page-title="myaccount"
			/>

			<!-- Display my account form -->
			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<!-- Display success box message -->
						<section v-if="successed">
							<Alert 
								:message="$t('message.success_saved')"
								:cols="true"
								variant="success"
							/>
						</section>

						<!-- Display error box message -->
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
							<b-form
								@submit="onSubmit"
							>
								<b-row>
									<b-col>
										<!-- USERNAME -->
										<b-form-group
											:label="$t('user.username')" 
											label-for="username"
										>
											<b-form-input
												id="username"
												v-model="rowdata.username"
												required
												disabled
											>
												{{ rowdata.username }}
											</b-form-input>
										</b-form-group>
									</b-col>
									<b-col>
										<!-- PASSWORD -->
										<b-form-group
											:label="$t('user.password')" 
											label-for="password"
										>
											<b-form-input
												id="password"
												v-model="rowdata.password"
												type="password"
											/>
										</b-form-group>
									</b-col>
								</b-row>
								<b-row>
									<b-col>
										<!-- EMAIL -->
										<b-form-group
											:label="$t('user.email')" 
											label-for="email"
										>
											<b-form-input
												id="email"
												v-model="rowdata.email"
												required
											>
												{{ rowdata.email }}
											</b-form-input>
										</b-form-group>
									</b-col>
								</b-row>
								<b-row>
									<b-col>
										<!-- FIRSTNAME -->
										<b-form-group 
											:label="$t('user.first_name')" 
											label-for="first_name"
										>
											<b-form-input
												id="first_name"
												v-model="rowdata.first_name"
												required
											>
												{{ rowdata.first_name }}
											</b-form-input>
										</b-form-group>
									</b-col>
									<b-col>
										<!-- LASTNAME -->
										<b-form-group
											:label="$t('user.last_name')" 
											label-for="last_name"
										>
											<b-form-input
												id="last_name"
												v-model="rowdata.last_name"
												required
											>
												{{ rowdata.last_name }}
											</b-form-input>
										</b-form-group>
									</b-col>
								</b-row>
								<b-row>
									<b-col align-self="start" />
									<b-col 
										align-self="center"
										align="center"
									>
										<b-button 
											type="submit"
											variant="success"
										>
											{{ $t('generic.save') }}
										</b-button>
									</b-col>
									<b-col align-self="end" />
								</b-row>
							</b-form>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import axios from 'axios'

export default {
	name: "MyAccount",
	data() {
		return {
			errormsg: null,
			successmsg: null,
			rowdata: [{}],
			loading: true,
			errored: false,
			successed: false,
			password: null,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		successed: function() {
			setTimeout(() => this.successed = false, 10000)
		}
	},
	async mounted() {
		await axios.get(this.$config.BACKEND_API_ROUTE+"myaccount/", { headers: this.header })
			.then(response => {
				this.rowdata = response.data
				this.errormsg = null
				this.errored = false
				this.loading = false
			})
			.catch(e => {
				this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
				this.errored = true
			})
	},
	methods: {
		onSubmit(event) {
			event.preventDefault()

			var jsonReturn = {}

			if(this.rowdata.password != '') {
				jsonReturn = {
					"password": this.rowdata.password,
					"email": this.rowdata.email,
					"first_name": this.rowdata.first_name,
					"last_name": this.rowdata.last_name
				}
			} else {
				jsonReturn = {
					"email": this.rowdata.email,
					"first_name": this.rowdata.first_name,
					"last_name": this.rowdata.last_name
				}
			}

			axios.patch(this.$config.BACKEND_API_ROUTE+"myaccount/"+this.rowdata.id+"/", jsonReturn,
				{ headers: this.header })
				.then(() => {
					this.successmsg = "success"
					this.successed = true
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
					this.successmsg = null
					this.successed = false
				})
				.finally(() => {
					this.loading = false
				})
		}
	}
}
</script>