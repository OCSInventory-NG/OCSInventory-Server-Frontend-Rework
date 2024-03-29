<template>
	<div 
		id="add-action-list-modal"
		class="container-xl"
	>
		<div class="page-header d-print-none text-white">
			<div class="row align-items-center">
				<div class="col">
					<div class="page-pretitle">
						<Breadcrumb />
					</div>
					<h2 class="page-title">
						{{ $t('deployment.manageaction') }}
					</h2>
				</div>
				<div class="col-auto ms-auto">
					<b-button
						v-if="canaddaction"
						:title="$t('deployment.addaction')"
						variant="primary"
						class="d-none d-sm-inline-block"
						@click="addaction = !addaction"
					>
						<font-awesome-icon 
							:icon="['fas', 'plus']"
						/>
						{{ $t('deployment.addaction') }}
					</b-button>

					<b-modal 
						id="add-action" 
						v-model="addaction"
						:title="$t('deployment.addaction')"
						hide-footer
						modal-class="custom-modal modal-blur"
					>
						<template #header="{ close }">
							<h5 class="modal-title">
								{{ $t('deployment.addaction') }}
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
						<b-form
							v-if="!loading"
							@submit="onSubmit"
						>
							<Alert 
								v-if="createerror"
								:message="createerrormsg" 
								variant="danger"
							/>
							<b-row>
								<b-col>
									<b-form-group
										:label="$t('deployment.name')" 
										label-for="name"
									>
										<b-form-input
											id="name"
											v-model="row.name"
											required
										/>
									</b-form-group>
								</b-col>
							</b-row>
							<b-row>
								<b-col>
									<b-form-group
										:label="$t('deployment.priority')" 
										label-for="priority"
									>
										<b-form-input
											id="priority"
											v-model="row.priority"
											type="number"
											required
										/>
									</b-form-group>
								</b-col>
							</b-row>
							<b-row>
								<b-col>
									<b-form-group
										:label="$t('deployment.action_type')" 
										label-for="action_type"
									>
										<b-form-select
											id="action_type"
											v-model="row.action_type" 
											:options="actionoptions" 
											class="mb-3 form-select"
										/>
									</b-form-group>
								</b-col>
							</b-row>
							<b-row>
								<b-col>
									<b-form-group
										:label="row.action_type == 'STORE' ? 
											$t('deployment.path') : $t('deployment.command')" 
										label-for="command"
									>
										<b-form-input
											id="command"
											v-model="row.command"
											required
										/>
									</b-form-group>
								</b-col>
							</b-row>
							<b-row
								v-if="row.action_type == 'STORE' || row.action_type == 'LAUNCH'"
							>
								<b-col>
									<b-form-file
										id="file"
										:placeholder="row.action_type == 'LAUNCH' ? 
											$t('deployment.select_launch_file') : $t('deployment.select_store_file')"
										@change="processFile($event)"
									/>
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
										{{ $t('generic.add') }}
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
			</div>
		</div>
	</div>
</template>

<script>
import Axios from 'axios'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb.vue'

export default {
	name: 'AddActionListModal',
	components: { Breadcrumb },
	props: {
		package: { type: String, required: true },
		canaddaction: { type: Boolean, default: false }
	},
	data() {
		return {
			row: {
				id: null,
				name: null,
				priority: 1,
				action_type: "EXEC",
				command: null,
				file: ''
			},
			rowdata: [],
			loading: true,
			loadingcreate: false,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,
			addaction: false,
			header: {
				"Content-Type": "multipart/form-data;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			},
			actionoptions: [
				{ value: 'EXEC', text: this.$t('deployment.EXEC') },
				{ value: 'LAUNCH', text: this.$t('deployment.LAUNCH') },
				{ value: 'STORE', text: this.$t('deployment.STORE') }
			]
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.addaction = false
				this.createwithsuccess = false
				this.$emit('reloadPackage')
			}, 500)
		}
	},
	created() {
		this.row.package = this.package
		this.loading = false
	},
	methods: {
		processFile(event){
			this.row.file = event.target.files[0];
		},
		// Submit package action creation and call getPackage to reload datatable datas
		onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true

			let formdata = new FormData()

			Object.keys(this.row).forEach(key => {
				formdata.append(key, this.row[key])
			})

			Axios.post(import.meta.env.VITE_APP_API_ROUTE+"deployment/actions/", formdata, { headers: this.header })
				.then(() => {
					this.createwithsuccess = true
					this.createerrormsg = null
					this.createerror = false
				})
				.catch(e => {
					this.createerrormsg = e.message
					this.createerror = true
					this.createwithsuccess = false
				})
				.finally(() => this.loadingcreate = false)
		}
	}
}
</script>
