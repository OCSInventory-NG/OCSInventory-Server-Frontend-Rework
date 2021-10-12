<template>
	<div id="AddTemplateModal">
		<section v-if="successed">
			<b-alert 
				:show="!!succesMsg" 
				class="alert-sm" 
				variant="success"
			>
				{{ $t('success_saved') }}
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

		<section v-else>
			<div v-if="loading">
				<Loader/>
			</div>

			<div
				v-else
			>
				<div
					v-if="canadd"
				>
					<b-button 
						v-b-modal.add-template
						:title="$t('addtemplate')"
						variant="success"
						class="add-button"
					>
						<font-awesome-icon 
							:icon="['fas', 'plus']"/>
					</b-button>

					<b-modal 
						id="add-template" 
						:title="$t('addtemplate')"
						hide-footer
						modal-class="custom-modal"
					>
						<b-form
							@submit="onSubmit"
						>
							<b-row>
								<b-col>
									<b-form-group
										:label="$t('name')" 
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
										:label="$t('os')" 
										label-for="os"
									>
										<b-form-select
											id="os"
											v-model="row.os" 
											:options="options" 
											class="mb-3"
										/>
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
										{{ $t('add') }}
									</b-button>
								</b-col>
								<b-col align-self="end"/>
							</b-row>
						</b-form>
					</b-modal>
				</div>
				
				<Datatable
					id="templatesdatatable"
					:rowdata="rowdata"
					:canedittemplate="canedit"
					:candelete="candelete"
					:canexport="false"
					:exporttemplate="exporttemplate"
					title="templates"
					@reloadDatatable="reloadDatatable"
				/>
			</div>
		</section>
	</div>
</template>

<script>
import Axios from 'axios'
import Loader from '@/components/Loader/Loader'
import Datatable from '@/components/Datatable/Datatable'

export default {
	name: 'AddTemplateModal',
	components: {
		Datatable,
		Loader
	},
	props: {
		canadd: { type: Boolean, default: false },
		canedit: { type: Boolean, default: false },
		candelete: { type: Boolean, default: false },
		exporttemplate: { type: Boolean, default: false }
	},
	data() {
		return {
			row: {
				name: null,
				os: 'WIN',
				sections: []
			},
			rowdata: [],
			loading: true,
			errorMsg: null,
			succesMsg: null,
			errored: false,
			successed: false,
			options: [
				{ value: 'WIN', text: 'Windows' },
				{ value: 'LIN', text: 'Linux' },
				{ value: 'MAC', text: 'MacOS' }
			]
		}
	},
	watch: {
		successed: function() {
			setTimeout(() => this.successed = false, 10000)
		}
	},
	mounted() {
		this.getTemplates()
	},
	methods: {
		getTemplates() {
			const header = {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
			Axios.get(process.env.VUE_APP_API_ROUTE+"templates/", { headers: header })
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
		reloadDatatable() {
			this.getTemplates()
		},
		// Submit template creation and call getTemplates to reload datatable datas
		onSubmit(event) {
			const header = {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
			event.preventDefault()
			
			Axios.post(process.env.VUE_APP_API_ROUTE+"templates/", this.row, { headers: header })
				.then(() => {
					this.succesMsg = "success"
					this.successed = true
					this.errorMsg = null
					this.errored = false
					this.$bvModal.hide('add-template')
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
					this.succesMsg = null
					this.successed = false
					this.$bvModal.hide('add-template')
				})
				.finally(() => this.getTemplates())
		}
	}
}
</script>
