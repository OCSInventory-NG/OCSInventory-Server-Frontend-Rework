<template>
	<div id="Notes">
		<section v-if="errored">
			<Alert
				:message="errormsg"
				variant="danger"
			/>
		</section>

		<section v-else>
			<div
				v-if="loading"
				class="ocs-loader"
			>
				<Loader />
			</div>

			<div v-else>
				<div class="row">
					<div class="col-auto ms-auto">
						<b-button
							:title="$t('note.addnote')"
							variant="primary"
							class="d-sm-inline-block btn-modal"
							@click="openCreateModal"
						>
							<font-awesome-icon
								:icon="['fas', 'plus']"
							/>
							{{ $t('note.addnote') }}
						</b-button>
					</div>
				</div>

				<Datatable
					id="notes"
					:rowdata="rowdata"
					:rowheader="rowheader"
					:hiddenfields="hiddenfields"
					:candelete="candelete"
					:canedit="canedit"
					:usecheckbox="true"
					:isbusy="isbusy"
					editcomponent="NoteModal"
					title="notes"
					translationkey="note."
					@reloadDatatable="reloadDatatable"
				/>

				<NoteModal
					ref="noteModal"
					:update="false"
					:object-slug="slug"
					:object-id="id"
					:content-type="Number(type)"
					@reloadDatatable="reloadDatatable"
				/>
			</div>
		</section>
	</div>
</template>

<script>
export default {
	name: 'Notes',

	props: {
		id: { type: Number, required: true },
		slug: { type: String, required: true },
		type: { type: String, required: true }
	},

	data() {
		return {
			errormsg: null,
			errored: false,
			rowdata: [],
			rowheader: [],
			hiddenfields: ['content_type', 'object_id', 'object_slug'],
			candelete: false,
			canedit: false,
			loading: true,
			isbusy: true,
		}
	},

	async mounted() {
		const rawPermissions = localStorage.getItem('permissions')
		const permissions = rawPermissions ? rawPermissions.split(",") : []

		if (permissions.includes("asset_group_view_assetgroup")) {
			if (permissions.includes("asset_group_change_assetgroup")) {
				this.canedit = true
			}
			if (permissions.includes("asset_group_delete_assetgroup")) {
				this.candelete = true
			}
		} else {
			this.errormsg = this.$t("message.dont_have_right_to_see")
			this.errored = true
			this.loading = false
			this.isbusy = false
			return
		}

		await this.getNotes()
	},

	methods: {
		async getNotes() {
			this.isbusy = true
			this.rowdata = []

			try {
				const header = await this.$api.generic.options("notes/")
				this.rowheader = Object.keys(header.actions.POST)

				const data = await this.$api.generic.get("notes/", {}, { object_slug: this.slug, object_id: this.id })
				const notes = Array.isArray(data) ? data : (data?.results || [])

				const creatorIds = [...new Set(notes.map(n => n.creator).filter(id => id))]
				const users = {}
				for (const id of creatorIds) {
					try { users[id] = await this.$api.generic.get(`users/${id}/`) }
					catch { users[id] = { username: `User ${id}` } }
				}

				this.rowdata = notes.map(note => {
					const creator = users[note.creator] || {}
					const creatorName = creator.first_name
						? `${creator.last_name} ${creator.first_name}`
						: creator.username || `User ${note.creator}`
					return {
						...note,
						creator: creatorName,
						object_slug: note.object_slug || this.slug,
						object_id: note.object_id || this.id,
						content_type: Number(note.content_type),
					}
				})

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = e?.response?.data?.error || e?.message
				this.errored = true
			} finally {
				this.isbusy = false
				this.loading = false
			}
		},

		async reloadDatatable() {
			await this.getNotes()
		},
		openCreateModal() {
			this.$refs.noteModal.loadData()
		},
	}
}
</script>