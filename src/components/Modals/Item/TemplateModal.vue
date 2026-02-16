<template>
	<div id="template-modal">
		<div 
			v-if="!update"
			class="page-header d-print-none"
		>
			<div class="row">
				<div class="col-auto ms-auto">
					<b-button
						:title="$t('template.addtemplate')"
						variant="primary"
						class="d-sm-inline-block btn-modal"
						@click="loadData()"
					>
						<font-awesome-icon 
							:icon="['fas', 'plus']"
						/>
						{{ $t('template.addtemplate') }}
					</b-button>
				</div>
			</div>
		</div>
		<div v-else>
			<button 
				:title="$t('template.editname')"
				class="btn btn-ghost-dark"
				@click="loadData(id)"
			>
				<font-awesome-icon 
					:icon="['fas', 'pencil']"
				/>
			</button>
		</div>
		<b-modal 
			id="templatemodal" 
			v-model="templatemodal"
			:title="(!update) ? $t('template.addtemplate') : $t('template.editname')"
			hide-footer
			modal-class="custom-modal"
			
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ (!update) ? $t('template.addtemplate') : $t('template.editname') }}
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
						<b-form-group
							:label="$t('user.name')" 
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
				<b-row v-if="!update">
					<b-col>
						<b-form-group
							:label="$t('inventory.os')" 
							label-for="os"
						>
							<v-select
								id="os"
								v-model="row.os" 
								:options="options" 
								:reduce="text => text.value"
								:clearable="false"
								label="text"
								class="mb-3"
							/>
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
	name: "TemplateModal",
	props: {
		update: { type: Boolean, default: false },
		id: { type: [String, Number], default: null }
	},
	data() {
		return {
			errormsg: null,
			errored: false,
			createerror: false,
			createerrormsg: null,

			createwithsuccess: false,

			row: {
				name: null,
				sections: [],
				id: null,
				os: null,
				is_protected: false,
				last_update: null,
			},
			templatemodal: false,
			options: [
				{ value: 'WIN', text: this.$t('template.WIN') },
				{ value: 'DEB', text: this.$t('template.LIN')+' ('+this.$t('template.DEB')+')' },
				{ value: 'RHEL', text: this.$t('template.LIN')+' ('+this.$t('template.RHEL')+')' },
				{ value: 'MAC', text: this.$t('template.MAC') }
			],
			
			loading: true,
			loadingcreate: false,
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.templatemodal = false
				this.createwithsuccess = false
				this.row = {
					name: null,
					sections: [],
					id: null,
					os: null,
					is_protected: false,
					last_update: null,
				}
				this.$emit("reloadDatatable")
			}, 500)
		}
	},
	mounted() {
		if(!this.update) {
			this.loading = false
		}
	},
	methods: {
		_apiError(e) {
			return e?.response?.data?.error || e?.message || String(e)
		},

		loadData(id) {
			this.templatemodal = true
			this.row = {
				name: null,
				sections: [],
				id: null,
				os: null,
				is_protected: false,
				last_update: null,
			}

			this.errormsg = null
			this.errored = false
			this.createerror = false
			this.createerrormsg = null
			this.createwithsuccess = false

			if (id) {
				this.loading = true
				this.getTemplateName(id)
			}
		},

		async getTemplateName(id) {
			try {
				const data = await this.$api.generic.get(`templates/${id}/`)
				this.row = data
				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errored = true
				this.errormsg = this._apiError(e)
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
					await this.$api.generic.post("templates/", this.row)
				} else {
					await this.$api.generic.patch(
						`templates/${this.id}/`,
						{ name: this.row.name }
					)
				}

				this.createwithsuccess = true
				this.createerror = false
				this.createerrormsg = null
			} catch (e) {
				this.createerror = true
				this.createerrormsg = this._apiError(e)
				this.createwithsuccess = false
			} finally {
				this.loadingcreate = false
			}
		},
	}
}
</script>