<template>
	<b-container fluid>
		<div id="MyAccount">
			
			<section v-if="successed">
				<b-alert 
					:show="!!succesMsg" 
					class="alert-sm" 
					variant="success"
				>
					{{ succesMsg }}
				</b-alert>
			</section>

			<section v-if="errored">
				<b-alert 
					:show="!!errorMsg" 
					class="alert-sm" 
					variant="danger"
				>
					{{ errorMsg }}
				</b-alert>
			</section>

			<section
				id="formSection"
			>
				<div v-if="loading">
					<Loader/>
				</div>

				<div
					v-for="row in rowdata" 
					v-else
					:key="row.id"
					class="account-config"
				>
					<b-form
						@submit="onSubmit"
					>
						<b-row>
							<b-col>
								<b-form-group
									label="Username :" 
									label-for="username"
								>
									<b-form-input
										id="username"
										v-model="row.username"
										placeholder="Username"
										required
										disabled
									>{{ row.username }}</b-form-input>
								</b-form-group>
							</b-col>
							<b-col>
								<b-form-group
									label="Password :" 
									label-for="password"
								>
									<b-form-input
										id="password"
										v-model="row.password"
										type="password"
										required
									/>
								</b-form-group>
							</b-col>
						</b-row>
						<b-row>
							<b-col>
								<b-form-group
									label="Email :" 
									label-for="email"
								>
									<b-form-input
										id="email"
										v-model="row.email"
										placeholder="Email"
										required
									>{{ row.email }}</b-form-input>
								</b-form-group>
							</b-col>
						</b-row>
						<b-row>
							<b-col>
								<b-form-group 
									label="Firstname :" 
									label-for="first_name"
								>
									<b-form-input
										id="first_name"
										v-model="row.first_name"
										placeholder="Firstname"
										required
									>{{ row.first_name }}</b-form-input>
								</b-form-group>
							</b-col>
							<b-col>
								<b-form-group
									label="Lastname :" 
									label-for="last_name"
								>
									<b-form-input
										id="last_name"
										v-model="row.last_name"
										placeholder="Lastname"
										required
									>{{ row.last_name }}</b-form-input>
								</b-form-group>
							</b-col>
						</b-row>
						<b-row>
							<b-col align-self="start"/>
							<b-col 
								align-self="center"
								align="center"
							>
								<b-button 
									type="submit"
									variant="success"
								>
									Save
								</b-button>
							</b-col>
							<b-col align-self="end"/>
						</b-row>
					</b-form>
				</div>
			</section>
		</div>
	</b-container>
</template>

<script>
import Axios from 'axios'
import Loader from '@/components/Loader/Loader';

export default {
	name: "MyAccount",
	components: {
		Loader
	},
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

		Axios.get("http://172.18.26.12:8000/myaccount/", { headers: header })
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

			this.rowdata.forEach(details => {

				var jsonReturn = {
					"password": details.password,
					"email": details.email,
					"first_name": details.first_name,
					"last_name": details.last_name
				}

				Axios.patch("http://172.18.26.12:8000/myaccount/"+details.id+"/", jsonReturn, { headers: header })
					.then(() => {
						this.succesMsg = "My new account configuration saved !"
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
					.finally(() => {
						this.loading = false
					})
			})
		}
	}
}
</script>