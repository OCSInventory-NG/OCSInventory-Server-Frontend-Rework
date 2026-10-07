<template>
	<div id="cpe-match-modal">
		<button
			:title="$t('security.editcpematch')"
			class="btn btn-ghost-dark"
			@click="loadData(id)"
		>
			<font-awesome-icon
				:icon="['fas', 'pencil']"
			/>
		</button>
		<b-modal
			id="cpematchmodal"
			v-model="cpematchmodal"
			:title="$t('security.editcpematch')"
			hide-footer
			modal-class="custom-modal"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('security.editcpematch') }}
					<b-spinner
						v-if="loadingaction"
						variant="success"
					/>
					<font-awesome-icon
						v-if="actionsuccess"
						:icon="['fas', 'check']"
						color="green"
					/>
					<font-awesome-icon
						v-if="actionerror"
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
				v-if="actionerror || errored"
				:message="(actionerror) ? actionerrormsg : errormsg"
				variant="danger"
			/>
			<div
				v-if="loading"
				class="ocs-loader"
			>
				<Loader />
			</div>
			<div v-else>
				<div class="cpe-match-software-card">
					<div class="cpe-match-software-name">
						{{ row.software_name || '-' }}
					</div>
					<div
						v-if="row.software_publisher"
						class="cpe-match-software-publisher"
					>
						{{ row.software_publisher }}
					</div>
					<span
						class="badge text-white mt-2"
						:class="'bg-' + statusVariant"
					>
						{{ statusLabel }}
					</span>
				</div>

				<b-form-group
					:label="$t('security.cpe')"
					label-for="cpe"
					class="mt-4"
				>
					<b-form-input
						id="cpe"
						v-model="cpe"
						class="cpe-match-cpe-input"
						placeholder="cpe:2.3:a:vendor:product:version:*:*:*:*:*:*:*"
					/>
				</b-form-group>

				<div class="cpe-match-actions mt-4">
					<b-button
						variant="outline-primary"
						:disabled="!cpeChanged || loadingaction"
						@click="setManualCpe"
					>
						{{ $t('security.save_manual_cpe') }}
					</b-button>
					<div class="cpe-match-actions-review">
						<b-button
							variant="danger"
							:disabled="loadingaction"
							@click="review('reject')"
						>
							{{ $t('security.reject') }}
						</b-button>
						<b-button
							variant="success"
							:disabled="loadingaction"
							@click="review('confirm')"
						>
							{{ $t('security.confirm') }}
						</b-button>
					</div>
				</div>
			</div>
		</b-modal>
	</div>
</template>

<script>
export default {
	name: "CpeMatchModal",
	props: {
		update: { type: Boolean, default: false },
		id: { type: Number, default: null }
	},
	emits: ["reloadDatatable"],
	data() {
		return {
			errormsg: null,
			errored: false,
			actionerror: false,
			actionerrormsg: null,
			actionsuccess: false,

			row: {},
			cpe: null,
			initialCpe: null,

			cpematchmodal: false,

			loading: true,
			loadingaction: false,
		}
	},
	computed: {
		statusLabel() {
			return this.$te('security.' + this.row.status) ? this.$t('security.' + this.row.status) : this.row.status
		},
		statusVariant() {
			switch (this.row.status) {
				case "confirmed":
					return "success"
				case "pending_review":
					return "warning"
				case "rejected":
					return "danger"
				case "no_match":
				default:
					return "secondary"
			}
		},
		cpeChanged() {
			return this.cpe !== this.initialCpe
		}
	},
	watch: {
		actionsuccess: function(value) {
			if (!value) return
			setTimeout(() => {
				this.cpematchmodal = false
				this.actionsuccess = false
				this.$emit("reloadDatatable")
			}, 500)
		}
	},
	methods: {
		_apiError(e) {
			return e?.response?.data?.error || e?.message || String(e)
		},

		async loadData(id) {
			this.cpematchmodal = true
			this.row = {}
			this.cpe = null
			this.initialCpe = null

			this.errormsg = null
			this.errored = false
			this.actionerror = false
			this.actionerrormsg = null
			this.actionsuccess = false

			if (id) {
				this.loading = true
				await this.getCpeMatch(id)
			}
		},

		async getCpeMatch(id) {
			try {
				const data = await this.$api.generic.get(`security/cpe-matches/${id}/`)
				this.row = data
				this.cpe = data?.cpe || null
				this.initialCpe = data?.cpe || null

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		async review(decision) {
			this.loadingaction = true
			this.actionsuccess = false
			this.actionerror = false
			this.actionerrormsg = null

			try {
				// NOTE: action review à confirmer sur CpeMatchViewSet côté backend
				await this.$api.generic.post(`security/cpe-matches/${this.row.id}/review/`, { decision })

				this.actionsuccess = true
			} catch (e) {
				this.actionsuccess = false
				this.actionerror = true
				this.actionerrormsg = this._apiError(e)
			} finally {
				this.loadingaction = false
			}
		},

		async setManualCpe() {
			this.loadingaction = true
			this.actionsuccess = false
			this.actionerror = false
			this.actionerrormsg = null

			try {
				// NOTE: action set-manual-cpe à confirmer sur CpeMatchViewSet côté backend
				await this.$api.generic.post(`security/cpe-matches/${this.row.id}/set-manual-cpe/`, { cpe: this.cpe })

				this.initialCpe = this.cpe
				this.actionsuccess = true
			} catch (e) {
				this.actionsuccess = false
				this.actionerror = true
				this.actionerrormsg = this._apiError(e)
			} finally {
				this.loadingaction = false
			}
		},
	}
}
</script>
