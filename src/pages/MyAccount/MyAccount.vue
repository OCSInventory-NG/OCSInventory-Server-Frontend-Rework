<template>
	<div
		id="my-account" 
		class="container-xl"
	>
		<!-- Display success box message -->
		<section v-if="successed">
			<Alert 
				:message="$t('success_saved')" 
				variant="success"
			/>
		</section>

		<!-- Display error box message -->
		<section v-if="errored">
			<Alert 
				:message="errorMsg" 
				variant="danger"
			/>
		</section>

		<!-- Display info if no error -->
		<section v-else>
			<div v-if="loading">
				<Loader />
			</div>

			<!-- Header page -->
			<div v-else>
				<!-- Page header -->
				<PageHeader 
					page-title="myaccount"
				/>

				<!-- Display my account form -->
				<div class="page-body">
					<div class="card">
						<div class="card-body">
							<b-form
								@submit="onSubmit"
							>
								<b-row>
									<b-col>
										<!-- USERNAME -->
										<b-form-group
											:label="$t('username')" 
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
											:label="$t('password')" 
											label-for="password"
										>
											<b-form-input
												id="password"
												v-model="rowdata.password"
												type="password"
												required
											/>
										</b-form-group>
									</b-col>
								</b-row>
								<b-row>
									<b-col>
										<!-- EMAIL -->
										<b-form-group
											:label="$t('email')" 
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
											:label="$t('first_name')" 
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
											:label="$t('last_name')" 
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
											{{ $t('save') }}
										</b-button>
									</b-col>
									<b-col align-self="end" />
								</b-row>
							</b-form>
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<script>
import Axios from 'axios'
import PageHeader from '@/components/Header/PageHeader'
import Alert from '@/components/Alert/Alert'
import Loader from '@/components/Loader/Loader';

export default {
	name: "MyAccount",
	components: { PageHeader, Alert, Loader },
	data() {
		return {
			errorMsg: null,
			succesMsg: null,
			rowdata: [{
				password: '',
			}],
			loading: true,
			errored: false,
			successed: false,
			password: null,
		}
	},
	watch: {
		successed: function() {
			setTimeout(() => this.successed = false, 10000)
		}
	},
	mounted() {
		const header = {
			"Content-Type": "application/json;charset=utf-8",
			"Authorization": 'Token ' + localStorage.getItem('token_authentication')
		}

		Axios.get(process.env.VUE_APP_API_ROUTE+"myaccount/", { headers: header })
			.then(response => {
				this.rowdata = response.data
				this.errorMsg = null
				this.errored = false
			})
			.catch(e => {
				this.errorMsg = e
				this.errored = true
			})
			.finally(() => this.loading = false)
	},
	methods: {
		onSubmit(event) {
			event.preventDefault()

			const header = {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}

			var jsonReturn = {
				"password": this.rowdata.password,
				"email": this.rowdata.email,
				"first_name": this.rowdata.first_name,
				"last_name": this.rowdata.last_name
			}

			Axios.patch(process.env.VUE_APP_API_ROUTE+"myaccount/"+this.rowdata.id+"/", jsonReturn, { headers: header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
					this.succesMsg = null
					this.successed = false
				})
				.finally(() => {
					this.loading = false
				})
		}
	}
}
</script>