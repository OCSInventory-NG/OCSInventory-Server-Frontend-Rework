<template>
	<div>
		<button
			v-if="update"
			:title="$t('note.edit')"
			class="btn btn-ghost-dark"
			@click="loadData(id)"
		>
			<font-awesome-icon
				:icon="['fas', 'pencil']"
			/>
		</button>
		<b-modal
			v-if="update"
			v-model="notemodal"
			:title="$t('note.edit')"
			hide-footer
			modal-class="custom-modal"
		>
			<Alert
				v-if="createerror || errored"
				:message="createerror ? createerrormsg : errormsg"
				variant="danger"
			/>

			<b-form
				v-if="!loading"
				@submit="onSubmit"
			>
				<b-form-group
					:label="$t('note.text')"
					label-for="note"
				>
					<b-form-textarea
						id="note"
						v-model="row.text"
						rows="6"
						required
					/>
				</b-form-group>

				<div class="text-center">
					<b-button
						type="submit"
						variant="success"
					>
						{{ $t('generic.save') }}
					</b-button>
				</div>
			</b-form>

			<div
				v-if="loading"
				class="ocs-loader"
			>
				<Loader />
			</div>
		</b-modal>

		<b-modal
			v-else
			v-model="notemodal"
			:title="$t('note.create')"
			hide-footer
			modal-class="custom-modal"
		>
			<Alert
				v-if="createerror || errored"
				:message="createerror ? createerrormsg : errormsg"
				variant="danger"
			/>

			<b-form
				v-if="!loading"
				@submit="onSubmit"
			>
				<b-form-group
					:label="$t('note.text')"
					label-for="note"
				>
					<b-form-textarea
						id="note"
						v-model="row.text"
						rows="6"
						required
					/>
				</b-form-group>

				<div class="text-center">
					<b-button
						type="submit"
						variant="success"
					>
						{{ $t('generic.save') }}
					</b-button>
				</div>
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
	name: "NoteModal",

	props: {
		id: { type: Number, default: null },
		update: { type: Boolean, default: false },
		objectSlug: { type: String, default: null },
		objectId: { type: Number, default: null },
		contentType: { type: Number, required: true },
	},

	data() {
		return {
			notemodal: false,
			row: { id: null, text: null },
			loading: false,
			loadingcreate: false,
			errored: false,
			errormsg: null,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,
			creator: null,
		}
	},

	async mounted(){
		await this.fetchCurrentUser()
	},

	methods: {
		loadData(id = null) {
			this.row.id = id
			this.notemodal = true
			this.loading = false
			this.row.text = null

			if(id) {
				this.loading = true
				this.getNote(id)
			}
		},
		async fetchCurrentUser() {
			try {
				const user = await this.$api.generic.get("myaccount/")
				this.creator = user.id
			} catch (e) {
				this.errormsg = "Failed to fetch user information."
				this.errored = true
			}
		},
		async getNote(id) {
			try {
				const data = await this.$api.generic.get(`notes/${id}/`)
				this.row.text = data.text
			} catch (e) {
				this.errormsg = e?.response?.data?.error || e?.message
				this.errored = true
			} finally {
				this.loading = false
			}
		},
		async onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true
			try {
				if(this.update) {
					await this.$api.generic.patch(`notes/${this.row.id}/`, { text: this.row.text })
				} else {
					await this.$api.generic.post("notes/", {
						text: this.row.text,
						creator: this.creator,
						object_slug: this.objectSlug,
						object_id: this.objectId,
						content_type: this.contentType
					})
				}
				this.createwithsuccess = true
				this.$emit("reloadDatatable")
				this.notemodal = false
			} catch (e) {
				this.createerrormsg = e?.response?.data?.error || e?.message
				this.createerror = true
			} finally {
				this.loadingcreate = false
			}
		}
	}
}
</script>