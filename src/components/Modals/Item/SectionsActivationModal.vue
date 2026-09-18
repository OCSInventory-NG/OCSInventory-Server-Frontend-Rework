<template>
	<div id="sections-activation-modal">
		<b-button
			:title="$t('template.manage_sections_activation')"
			variant="info"
			class="d-sm-inline-block btn-modal"
			:disabled="viewOnly"
			@click="loadData()"
		>
			<font-awesome-icon
				:icon="['fas', 'toggle-on']"
			/>
		</b-button>
		<b-modal
			id="sectionsactivationmodal"
			v-model="sectionsactivationmodal"
			:title="$t('template.manage_sections_activation')"
			hide-footer
			modal-class="custom-modal"
			size="lg"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('template.manage_sections_activation') }}
					<b-spinner
						v-if="loadingupdate"
						variant="success"
					/>
					<font-awesome-icon
						v-if="updatewithsuccess"
						:icon="['fas', 'check']"
						color="green"
					/>
					<font-awesome-icon
						v-if="updateerror"
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
				v-if="updateerror || errored"
				:message="(updateerror) ? updateerrormsg : errormsg"
				variant="danger"
			/>
			<div v-if="!sections.length">
				<Alert
					:message="$t('message.no_section')"
					variant="info"
				/>
			</div>
			<div v-else>
				<div class="table-responsive">
					<table class="table table-vcenter border">
						<thead>
							<tr>
								<th>
									<input
										v-model="checkall"
										class="form-check-input"
										type="checkbox"
									>
								</th>
								<th>{{ $t('user.name') }}</th>
								<th>{{ $t('template.is_active') }}</th>
							</tr>
						</thead>
						<tbody>
							<tr
								v-for="section in sections"
								:key="section.id"
							>
								<td>
									<input
										v-model="selected"
										class="form-check-input"
										type="checkbox"
										:value="section.id"
									>
								</td>
								<td>{{ section.name }}</td>
								<td>
									<font-awesome-icon
										v-if="section.is_active"
										:icon="['fas', 'circle-check']"
										class="text-success"
									/>
									<font-awesome-icon
										v-else
										:icon="['fas', 'circle-xmark']"
										class="text-danger"
									/>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				<b-row>
					<b-col
						align-self="center"
						align="center"
					>
						<b-button
							variant="success"
							class="me-2"
							:disabled="!selected.length || loadingupdate"
							@click="updateSelection(true)"
						>
							{{ $t('template.activate_selected_sections') }}
						</b-button>
						<b-button
							variant="danger"
							:disabled="!selected.length || loadingupdate"
							@click="updateSelection(false)"
						>
							{{ $t('template.deactivate_selected_sections') }}
						</b-button>
					</b-col>
				</b-row>
			</div>
		</b-modal>
	</div>
</template>

<script>
export default {
	name: "SectionsActivationModal",
	props: {
		template: { type: Number, required: true },
		viewOnly: { type: Boolean, default: false }
	},
	emits: ["reloadTemplate"],
	data() {
		return {
			errormsg: null,
			errored: false,
			updateerror: false,
			updateerrormsg: null,

			updatewithsuccess: false,

			sectionsactivationmodal: false,
			sections: [],
			selected: [],
			checkall: false,

			loading: true,
			loadingupdate: false,
		}
	},
	watch: {
		checkall: function(value) {
			this.selected = value ? this.sections.map((section) => section.id) : []
		},
		updatewithsuccess: function() {
			setTimeout(() => {
				this.updatewithsuccess = false
			}, 500)
		}
	},
	methods: {
		_apiError(e) {
			return e?.response?.data?.error || e?.message || String(e)
		},

		async loadData() {
			this.sectionsactivationmodal = true
			this.selected = []
			this.checkall = false
			this.errormsg = null
			this.errored = false
			this.updateerror = false
			this.updateerrormsg = null
			this.updatewithsuccess = false

			await this.getSections()
		},

		async getSections() {
			this.loading = true

			try {
				const data = await this.$api.generic.get(
					"sections/",
					{},
					{ template: this.template }
				)

				const sections = Array.isArray(data) ? data : (data?.results || [])

				this.sections = sections.sort((a, b) =>
					(a?.name || "").localeCompare(b?.name || "")
				)

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		async updateSelection(isActive) {
			this.loadingupdate = true
			this.updatewithsuccess = false
			this.updateerror = false
			this.updateerrormsg = null

			try {
				await Promise.all(
					this.selected.map((id) =>
						this.$api.generic.patch(`sections/${id}/`, { is_active: isActive })
					)
				)

				await this.getSections()
				this.selected = []
				this.checkall = false

				this.updatewithsuccess = true
				this.$emit("reloadTemplate")
			} catch (e) {
				this.updateerrormsg = this._apiError(e)
				this.updateerror = true
			} finally {
				this.loadingupdate = false
			}
		},
	}
}
</script>
