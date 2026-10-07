<template>
	<div id="software-identity-decisions">
		<Alert
			v-if="errored"
			:message="errormsg"
			:cols="true"
			variant="danger"
		/>
		<div
			v-if="loading"
			class="ocs-loader"
		>
			<Loader />
		</div>
		<div v-else>
			<p v-if="!decisions.length">
				{{ $t('software_identity.decisions_empty') }}
			</p>
			<table
				v-else
				class="table table-sm table-striped table-vcenter"
			>
				<thead>
					<tr>
						<th>{{ $t('software_identity.family') }}</th>
						<th>{{ $t('software_identity.match_key') }}</th>
						<th>{{ $t('software_identity.product') }}</th>
						<th>{{ $t('software_identity.source') }}</th>
						<th>{{ $t('software_identity.created_at') }}</th>
						<th v-if="candelete" />
					</tr>
				</thead>
				<tbody>
					<tr
						v-for="decision in decisions"
						:key="decision.id"
					>
						<td>{{ $t('software_identity.family_' + decision.family) }}</td>
						<td>{{ decision.match_key }}</td>
						<td>{{ decision.product || $t('software_identity.no_cpe') }}</td>
						<td>{{ $t('software_identity.source_' + decision.source) }}</td>
						<td>{{ new Date(decision.created_at).toLocaleString() }}</td>
						<td v-if="candelete">
							<button
								v-if="decision.source === 'admin'"
								class="btn btn-ghost-danger"
								:title="$t('software_identity.revert')"
								@click="revert(decision)"
							>
								<font-awesome-icon :icon="['fas', 'trash-can']" />
							</button>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<script>
export default {
	name: "SoftwareIdentityDecisions",
	props: {
		candelete: { type: Boolean, default: false },
	},
	emits: ["reverted"],
	data() {
		return {
			errored: false,
			errormsg: null,
			loading: true,
			decisions: [],
		}
	},
	async mounted() {
		await this.load()
	},
	methods: {
		_apiError(e) {
			return e?.response?.data?.error || e?.response?.data?.detail || e?.response?.data?.[0] || e?.message || String(e)
		},

		async load() {
			this.loading = true
			try {
				this.decisions = await this.$api.generic.get("software_identity_decisions/")
				this.errored = false
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		async revert(decision) {
			try {
				await this.$api.generic.delete(`software_identity_decisions/${decision.id}/`)
				this.$emit("reverted")
				await this.load()
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			}
		},
	},
}
</script>
