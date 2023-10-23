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
						v-b-modal.add-action
						:title="$t('deployment.addaction')"
						variant="primary"
						class="d-none d-sm-inline-block"
					>
						<font-awesome-icon 
							:icon="['fas', 'plus']"
						/>
						{{ $t('deployment.addaction') }}
					</b-button>

					<b-modal 
						id="add-action" 
						:title="$t('deployment.addaction')"
						hide-footer
						modal-class="custom-modal modal-blur"
					>
						<template #modal-header="{ close }">
							<h5 class="modal-title">
								{{ $t('deployment.addaction') }}
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
							@submit="onSubmit"
						>
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
					</b-modal>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import Axios from 'axios'
import i18n from '@/i18n'
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb'

export default {
	name: 'AddActionListModal',
	components: { Breadcrumb },
	props: {
		package: { type: Number, required: true },
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
			errorMsg: null,
			succesMsg: null,
			errored: false,
			successed: false,
			header: {
				"Content-Type": "multipart/form-data;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			},
			actionoptions: [
				{ value: 'EXEC', text: i18n.t('deployment.EXEC') },
				{ value: 'LAUNCH', text: i18n.t('deployment.LAUNCH') },
				{ value: 'STORE', text: i18n.t('deployment.STORE') }
			]
		}
	},
	created() {
		this.row.package = this.package
	},
	methods: {
		processFile(event){
			this.row.file = event.target.files[0];
		},
		// Submit package action creation and call getPackage to reload datatable datas
		onSubmit(event) {
			event.preventDefault()

			let formdata = new FormData()

			Object.keys(this.row).forEach(key => {
				formdata.append(key, this.row[key])
			})

			Axios.post(process.env.VUE_APP_API_ROUTE+"deployment/actions/", formdata, { headers: this.header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errorMsg = null
					this.errored = false
					this.$bvModal.hide('add-action')
					this.$emit('reloadPackage')
				})
				.catch(e => {
					this.errorMsg = e.message
					this.errored = true
					this.succesMsg = null
					this.successed = false
					this.$bvModal.hide('add-action')
				})
		}
	}
}
</script>
