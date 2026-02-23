<template>
	<div id="user-modal">
		<div 
			v-if="!update"
			class="page-header d-print-none"
		>
			<div class="row">
				<div class="col-auto ms-auto">
					<b-button
						:title="$t('user.adduser')"
						variant="primary"
						class="d-sm-inline-block btn-modal"
						@click="loadData()"
					>
						<font-awesome-icon 
							:icon="['fas', 'plus']"
						/>
						{{ $t('user.adduser') }}
					</b-button>
				</div>
			</div>
		</div>
		<div v-else>
			<button 
				:title="$t('user.edituser')"
				class="btn btn-ghost-dark"
				@click="loadData(id)"
			>
				<font-awesome-icon 
					:icon="['fas', 'pencil']"
				/>
			</button>
		</div>
		<b-modal 
			id="usermodal" 
			v-model="usermodal"
			:title="(!update) ? $t('user.adduser') : $t('user.edituser')"
			hide-footer
			modal-class="custom-modal"
			
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ (!update) ? $t('user.adduser') : $t('user.edituser') }}
					<b-spinner 
						v-if="loadingcreate"
						variant="success"
					/>
					<font-awesome-icon 
						v-if="createwithsuccess"
						:icon="['fas', 'check']"
						color="green"
					/>
					<font-awesome-icon 
						v-if="createerror"
						:icon="['fas', 'xmark']"
						color="red"
					/>
				</h5>
				<b-button 
					size="sm" 
					variant="outline-danger" 
					@click="close()"
				>
					<font-awesome-icon 
						:icon="['fas', 'xmark']"
						size="1x"
					/>
				</b-button>
			</template>
			<Alert 
				v-if="createerror || errored"
				:message="(createerror) ? createerrormsg : errormsg"
				variant="danger"
			/>
			<b-form
				v-if="!loading"
				@submit="onSubmit"
			>
				<b-row>
					<b-col>
						<h4>{{ $t('user.user_informations') }}</h4>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('user.username')" 
							label-for="username"
						>
							<b-form-input
								id="username"
								v-model="row.username"
								required
							/>
						</b-form-group>
					</b-col>
					<b-col>
						<b-form-group
							:label="$t('user.password')" 
							label-for="password"
						>
							<b-form-input
								id="password"
								v-model="row.password"
								type="password"
								autocomplete="new-password"
								:required="(!update) ? true : false"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('user.email')" 
							label-for="email"
						>
							<b-form-input
								id="email"
								v-model="row.email"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<b-form-group 
							:label="$t('user.first_name')" 
							label-for="first_name"
						>
							<b-form-input
								id="first_name"
								v-model="row.first_name"
							/>
						</b-form-group>
					</b-col>
					<b-col>
						<b-form-group
							:label="$t('user.last_name')" 
							label-for="last_name"
						>
							<b-form-input
								id="last_name"
								v-model="row.last_name"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<h4>{{ $t('title.groups') }}</h4>
					</b-col>
				</b-row>
				<b-row>
					<b-col
						v-for="group in groups"
						:key="group.id"
						cols="4"
						class="mb-2"
					>
						<b-form-checkbox
							:id="group.code"
							v-model="row.groups"
							:name="group.code"
							:value="group.id"
							unchecked
							inline
						>
							{{ group.name }}
						</b-form-checkbox>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<h4>{{ $t('title.dangerzone') }}</h4>
					</b-col>
				</b-row>
				<b-row>
					<b-col>
						<Alert 
							:message="$t('message.superuser_disclaimer')" 
							variant="warning"
						/>
						<b-form-group>
							<b-form-checkbox
								id="is_superuser"
								v-model="row.is_superuser"
								name="is_superuser"
								:value="true"
								:unchecked-value="false"
								inline
							>
								{{ $t('user.is_superuser') }}
							</b-form-checkbox>
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
							{{ (!update) ? $t('generic.add') : $t('generic.save') }}
						</b-button>
					</b-col>
					<b-col align-self="end" />
				</b-row>
			</b-form>
			<div 
				v-if="loading"
				class="ocs-loader"
			>
				<Loader />
			</div>
		</b-modal>
	</div>
</template>

<script>
export default {
	name: "UserModal",
	props: {
		groupsprop: { type: [Array, Object], default: () => [] },
		update: { type: Boolean, default: false },
		id: { type: Number, default: null }
	},
	data() {
		return {
			errormsg: null,
			errored: false,
			createerror: false,
			createerrormsg: null,

			createwithsuccess: false,

			row: {
				username: null,
				password: null,
				email: null,
				first_name: null,
				last_name: null,
				is_superuser: false,
				groups: [],
				user_permissions: []
			},
			usermodal: false,
			groups: [],
			
			loading: true,
			loadingcreate: false,
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.usermodal = false
				this.createwithsuccess = false
				this.row = {
					username: null,
					password: null,
					email: null,
					first_name: null,
					last_name: null,
					is_superuser: false,
					groups: [],
					user_permissions: []
				}
				this.$emit("reloadDatatable")
			}, 500)
		}
	},
	mounted() {
		if(!this.update) {
			this.groups = this.groupsprop
			this.loading = false
		}
	},
	methods: {
		_apiError(e) {
			return e?.response?.data?.error || e?.message || String(e)
		},

		loadData(id) {
			this.usermodal = true
			this.row = {
				username: null,
				password: null,
				email: null,
				first_name: null,
				last_name: null,
				is_superuser: false,
				groups: [],
				user_permissions: [],
			}

			this.errormsg = null
			this.errored = false
			this.createerror = false
			this.createerrormsg = null
			this.createwithsuccess = false

			if (id) {
				this.loading = true
				this.getUser(id)
			}
		},

		async getUser(id) {
			try {
				const data = await this.$api.generic.get(`users/${id}/`)
				this.row = data

				this.errormsg = null
				this.errored = false

				await this.getGroups()
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
				this.loading = false
			}
		},

		async getGroups() {
			try {
				const data = await this.$api.generic.get("groups/")

				this.groups = (data || []).map((groupDetails) => ({
					id: groupDetails.id,
					code: "group_" + groupDetails.id,
					name: groupDetails.name,
				}))

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		async onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true

			this.createwithsuccess = false
			this.createerror = false
			this.createerrormsg = null

			try {
				if (!this.update) {
					await this.$api.generic.post("users/", this.row)
				} else {
					const payload = { ...this.row }

					if (payload.password === "") {
						delete payload.password
					}

					await this.$api.generic.patch(`users/${this.row.id}/`, payload)
				}

				this.createwithsuccess = true
				this.createerrormsg = null
				this.createerror = false
			} catch (e) {
				this.createerrormsg = this._apiError(e)
				this.createerror = true
				this.createwithsuccess = false
			} finally {
				this.loadingcreate = false
			}
		},
	}
}
</script>