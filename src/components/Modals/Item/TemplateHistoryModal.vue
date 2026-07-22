<template>
	<div id="template-history-modal">
		<button
			v-if="canView"
			:title="$t('template.history')"
			class="btn btn-ghost-dark"
			@click="loadData()"
		>
			<font-awesome-icon
				:icon="['fas', 'clock-rotate-left']"
			/>
		</button>

		<b-modal
			id="templatehistorymodal"
			v-model="historymodal"
			:title="$t('template.history')"
			hide-footer
			modal-class="custom-modal"
			size="lg"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('template.history') }}
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
				<b-table
					:items="versions"
					:fields="fields"
					striped
					hover
					bordered
					class="table-vcenter"
					show-empty
				>
					<template #empty="">
						{{ $t('generic.no_data') }}
					</template>

					<template #cell(revision)="row">
						{{ row.item.revision }}
					</template>

					<template #cell(created_at)="row">
						{{ formatDate(row.item.created_at) }}
					</template>

					<template #cell(label)="row">
						<div style="max-width: 220px; word-break: break-word;">
							{{ row.item.label }}
						</div>
					</template>

					<template #cell(actions)="row">
						<div class="d-flex flex-nowrap justify-content-center">
							<TemplateVersionPreviewModal
								:template-id="id"
								:version="row.item"
							/>
							<TemplateVersionDiffModal
								:template-id="id"
								:version="row.item"
							/>
							<button
								:title="$t('template.rollback')"
								class="btn btn-ghost-dark"
								:disabled="!canRestore"
								@click="confirmRollback(row.item)"
							>
								<font-awesome-icon
									:icon="['fas', 'arrows-rotate']"
								/>
							</button>
							<DeleteItemModal
								v-if="!isProtected || row.item.revision !== 1"
								:id="row.item.id"
								:name="$t('template.history_revision') + ' ' + row.item.revision"
								:parameter="`templates/${id}/versions`"
								:disabled="!canDelete"
								@reload-template="getVersions"
							/>
						</div>
					</template>
				</b-table>
			</div>
		</b-modal>

		<b-modal
			id="templaterollbackmodal"
			v-model="confirmmodal"
			:title="$t('template.rollback')"
			hide-footer
			modal-class="custom-modal"
			size="sm"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('template.rollback') }}
					<b-spinner
						v-if="rollingback"
						variant="success"
					/>
					<font-awesome-icon
						v-if="rollbacksuccess"
						:icon="['fas', 'check']"
						color="green"
					/>
					<font-awesome-icon
						v-if="rollbackerror"
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
				v-if="rollbackerror"
				:message="rollbackerrormsg"
				variant="danger"
			/>

			<div class="text-center">
				<font-awesome-icon
					:icon="['fas', 'triangle-exclamation']"
					size="5x"
					color="#d63939"
				/>
				<p><b>{{ $t('message.deletevalid') }}</b></p>
				<p v-if="selectedversion">
					{{ $t('template.rollback_msg') }}
				</p>
			</div>
			<div class="w-100 text-center">
				<div class="row">
					<div class="col">
						<button
							class="btn btn-danger"
							@click="doRollback"
						>
							{{ $t('template.rollback') }}
						</button>
					</div>
				</div>
			</div>
		</b-modal>
	</div>
</template>

<script>
export default {
	name: "TemplateHistoryModal",
	props: {
		id: { type: [String, Number], required: true },
		isProtected: { type: Boolean, default: false }
	},
	data() {
		return {
			historymodal: false,
			confirmmodal: false,

			loading: false,
			errored: false,
			errormsg: null,

			versions: [],
			selectedversion: null,

			rollingback: false,
			rollbacksuccess: false,
			rollbackerror: false,
			rollbackerrormsg: null,
		}
	},
	computed: {
		fields() {
			return [
				{ key: "revision", label: this.$t("template.history_revision") },
				{ key: "created_at", label: this.$t("template.history_date") },
				{ key: "created_by", label: this.$t("template.history_author") },
				{ key: "label", label: this.$t("template.history_label") },
				{ key: "actions", label: this.$t("generic.actions"), class: "text-nowrap" },
			]
		},

		// "Template - Versionning" permission (templateversion model).
		// View gates access to the history, restore maps to the "change" right,
		// deleting a revision to the "delete" right.
		canView() {
			return localStorage.getItem('permissions') ?.split(',').includes('template_view_templateversion')
		},
		canRestore() {
			return localStorage.getItem('permissions') ?.split(',').includes('template_change_templateversion')
		},
		canDelete() {
			return localStorage.getItem('permissions') ?.split(',').includes('template_delete_templateversion')
		}
	},
	watch: {
		rollbacksuccess: function() {
			if (this.rollbacksuccess) {
				setTimeout(() => {
					this.confirmmodal = false
					this.historymodal = false
					this.rollbacksuccess = false
					this.$emit("reload-template")
				}, 500)
			}
		}
	},
	methods: {
		_apiError(e) {
			return e?.response?.data?.error || e?.message || String(e)
		},

		formatDate(value) {
			return value ? new Date(value).toLocaleString(this.$i18n.locale) : ""
		},

		async loadData() {
			this.historymodal = true
			await this.getVersions()
		},

		async getVersions() {
			this.loading = true
			this.errored = false
			this.errormsg = null

			try {
				const data = await this.$api.generic.get(`templates/${this.id}/versions/`)
				this.versions = Array.isArray(data) ? data : (data?.results || [])
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		confirmRollback(version) {
			this.selectedversion = version
			this.rollbackerror = false
			this.rollbackerrormsg = null
			this.rollbacksuccess = false
			this.confirmmodal = true
		},

		async doRollback() {
			if (!this.selectedversion) return

			this.rollingback = true
			this.rollbackerror = false
			this.rollbackerrormsg = null

			try {
				await this.$api.generic.post(
					`templates/${this.id}/versions/${this.selectedversion.id}/rollback/`
				)

				this.rollbacksuccess = true
			} catch (e) {
				this.rollbackerrormsg = this._apiError(e)
				this.rollbackerror = true
			} finally {
				this.rollingback = false
			}
		},
	}
}
</script>
