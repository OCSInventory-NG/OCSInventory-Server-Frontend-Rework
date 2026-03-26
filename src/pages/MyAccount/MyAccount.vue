<template>
	<div
		id="my-account" 
		class="container-xl"
	>
		<div>
			<PageHeader page-title="myaccount" />

			<div class="page-body">
				<div class="card">
					<div class="card-body">
						<section v-if="successed">
							<Alert 
								:message="$t('message.success_saved')"
								:cols="true"
								variant="success"
							/>
						</section>

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
export default {
	name: "MyAccount",
	data() {
		return {
			errored: false,
			errormsg: null,

			successed: false,
			successmsg: null,

			rowdata: [{}],
			password: null,
			
			loading: true,
		}
	},
	watch: {
		successed: function() {
			setTimeout(() => this.successed = false, 5000)
		}
	},
	async mounted() {
		try {
			this.loading = true

			const data = await this.$api.generic.get("myaccount/")
			this.rowdata = data

			this.errormsg = null
			this.errored = false
		} catch (e) {
			this.errormsg = (e.response?.data?.error)
				? e.response.data.error
				: e.message
			this.errored = true
		} finally {
			this.loading = false
		}
	},
	methods: {
		async onSubmit(event) {
			event.preventDefault()

			try {
				const payload = {
					email: this.rowdata.email,
					first_name: this.rowdata.first_name,
					last_name: this.rowdata.last_name,
					...(this.rowdata.password ? { password: this.rowdata.password } : {})
				}

				await this.$api.generic.patch(
					`myaccount/${this.rowdata.id}/`,
					payload
				)

				this.successmsg = "success"
				this.successed = true
				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = (e.response?.data?.error)
					? e.response.data.error
					: e.message
				this.errored = true
				this.successmsg = null
				this.successed = false
			}
		}
	}
}
</script>