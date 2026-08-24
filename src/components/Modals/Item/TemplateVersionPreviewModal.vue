<template>
	<div class="template-version-preview-modal d-inline">
		<button
			:title="$t('template.preview')"
			class="btn btn-ghost-dark"
			@click="loadData()"
		>
			<font-awesome-icon
				:icon="['fas', 'magnifying-glass-plus']"
			/>
		</button>

		<b-modal
			:id="`versionpreview-${version.id}`"
			v-model="previewmodal"
			:title="$t('template.preview')"
			hide-footer
			lazy
			modal-class="custom-modal"
			size="xl"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('template.preview') }} ({{ version.revision }})
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
				v-if="errored"
				:message="errormsg"
				variant="danger"
			/>

			<div
				v-if="loading"
				class="ocs-loader"
			>
				<Loader />
			</div>

			<div v-else>
				<p>
					<span class="datagrid-title">{{ $t('user.name') }} :</span>
					{{ snapshot.name }}
					<span class="datagrid-title ms-3">{{ $t('inventory.os') }} :</span>
					{{ $t('template.' + snapshot.os) }}
				</p>

				<div
					v-for="(section, sIndex) in snapshot.sections"
					:key="sIndex"
					class="card mb-3"
				>
					<div class="card-header">
						<b>{{ section.name }}</b>&nbsp;-
						{{ $t('template.' + section.retrieval_method) }} / {{ $t('template.' + section.retrieval_output) }}
					</div>
					<div class="card-body">
						<p v-if="section.target">
							<b>{{ $t('template.target') }} :</b> {{ section.target }}
						</p>

						<table
							v-if="section.fields && section.fields.length"
							class="table table-sm table-striped table-vcenter"
						>
							<thead>
								<tr>
									<th>{{ $t('user.name') }}</th>
									<th>{{ $t('template.retrieval_value') }}</th>
									<th>{{ $t('template.retrieval_method') }}</th>
									<th>{{ $t('template.retrieval_output') }}</th>
								</tr>
							</thead>
							<tbody>
								<tr
									v-for="(field, fIndex) in section.fields"
									:key="fIndex"
								>
									<td>{{ field.name }}</td>
									<td>{{ field.retrieval_value }}</td>
									<td>{{ field.retrieval_method ? $t('template.' + field.retrieval_method) : '' }}</td>
									<td>{{ field.retrieval_output ? $t('template.' + field.retrieval_output) : '' }}</td>
								</tr>
							</tbody>
						</table>
						<Alert
							v-else
							:message="$t('message.no_field')"
							:cols="true"
							variant="info"
						/>
					</div>
				</div>

				<Alert
					v-if="!snapshot.sections || !snapshot.sections.length"
					:message="$t('message.no_section')"
					:cols="true"
					variant="info"
				/>
			</div>
		</b-modal>
	</div>
</template>

<script>
export default {
	name: "TemplateVersionPreviewModal",
	props: {
		templateId: { type: [String, Number], required: true },
		version: { type: Object, required: true }
	},
	data() {
		return {
			previewmodal: false,

			loading: false,
			errored: false,
			errormsg: null,

			snapshot: {}
		}
	},
	methods: {
		_apiError(e) {
			return e?.response?.data?.error || e?.message || String(e)
		},

		async loadData() {
			this.previewmodal = true
			this.loading = true
			this.errored = false
			this.errormsg = null

			try {
				const data = await this.$api.generic.get(
					`templates/${this.templateId}/versions/${this.version.id}/`
				)
				this.snapshot = data?.snapshot || {}
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			} finally {
				this.loading = false
			}
		},
	}
}
</script>
