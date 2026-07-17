<template>
	<div
		id="template-create-version-modal"
		class="d-inline"
	>
		<b-button
			v-if="canView"
			:title="$t('template.create_revision')"
			class="btn-teal"
			:disabled="viewOnly"
			@click="loadData()"
		>
			<font-awesome-icon
				:icon="['fas', 'plus']"
				class="me-1"
			/>
			{{ $t('template.create_revision') }}
		</b-button>

		<b-modal
			id="templatecreateversionmodal"
			v-model="createmodal"
			:title="$t('template.create_revision')"
			hide-footer
			modal-class="custom-modal"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('template.create_revision') }}
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

			<b-form @submit="onSubmit">
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('template.history_label')"
							label-for="label"
						>
							<b-form-textarea
								id="label"
								v-model="label"
								rows="3"
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
							{{ $t('generic.add') }}
						</b-button>
					</b-col>
					<b-col align-self="end" />
				</b-row>
			</b-form>
		</b-modal>
	</div>
</template>

<script>
export default {
	name: "TemplateCreateVersionModal",
	props: {
		id: { type: [String, Number], required: true }
	},
	data() {
		return {
			createmodal: false,

			errormsg: null,
			errored: false,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,

			label: "",

			loadingcreate: false,
		}
	},
	computed: {
		canView() {
			return localStorage.getItem('permissions') ?.split(',').includes('template_view_templateversion')
		},
		viewOnly() {
			return !localStorage.getItem('permissions') ?.split(',').includes('template_add_templateversion')
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.createmodal = false
				this.createwithsuccess = false
				this.$emit("reload-template")
			}, 500)
		}
	},
	methods: {
		_apiError(e) {
			return e?.response?.data?.error || e?.message || String(e)
		},

		loadData() {
			this.createmodal = true
			this.errored = false
			this.errormsg = null
			this.createerror = false
			this.createerrormsg = null
			this.createwithsuccess = false
			this.label = ""
		},

		async onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true

			this.createwithsuccess = false
			this.createerror = false
			this.createerrormsg = null

			try {
				await this.$api.generic.post(`templates/${this.id}/versions/`, { label: this.label })

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
