<template>
	<div id="network-group-modal">
		<div 
			v-if="!update"
			class="page-header d-print-none"
		>
			<div class="row">
				<div class="col-auto ms-auto">
					<b-button
						:title="$t('network.addnetgroup')"
						variant="primary"
						class="d-sm-inline-block btn-modal"
						@click="loadData()"
					>
						<font-awesome-icon 
							:icon="['fas', 'plus']"
						/>
						{{ $t('network.addnetgroup') }}
					</b-button>
				</div>
			</div>
		</div>
		<div v-else>
			<button 
				:title="$t('network.editnetgroup')"
				class="btn btn-ghost-dark"
				@click="loadData(id)"
			>
				<font-awesome-icon 
					:icon="['fas', 'pencil']"
				/>
			</button>
		</div>
		<b-modal 
			id="netgroupmodal" 
			v-model="netgroupmodal"
			:title="(!update) ? $t('network.addnetgroup') : $t('network.editnetgroup')"
			hide-footer
			modal-class="custom-modal"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ (!update) ? $t('network.addnetgroup') : $t('network.editnetgroup') }}
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
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('generic.description')" 
							label-for="description"
						>
							<b-form-input
								id="description"
								v-model="row.description"
								required
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row v-if="update">
					<b-col>
						<b-form-group
							:label="$t('title.network')" 
							label-for="network"
						>
							<v-select
								id="network"
								v-model="netid"
								:options="networks"
								:reduce="text => text.value"
								label="text"
								class="mb-3"
								multiple
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
	name: "NetworkGroupModal",
	props: {
		update: { type: Boolean, default: false },
		id: { type: Number, default: null }
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
				description: null
			},
			netgroupmodal: false,
			networks: [],
			netid: [],
			oldnetid: [],
			
			loading: true,
			loadingcreate: false,
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.netgroupmodal = false
				this.createwithsuccess = false
				this.row = {
					name: null,
					description: null
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

		async loadData(id) {
			this.netgroupmodal = true
			this.row = {
				name: null,
				description: null,
			}

			this.errormsg = null
			this.errored = false
			this.createerror = false
			this.createerrormsg = null
			this.createwithsuccess = false

			if (id) {
				this.loading = true
				try {
					await this.getNetgroup(id)
					await this.getNetworks()
				} catch (e) {
					this.errormsg = this._apiError(e)
					this.errored = true
					this.loading = false
				}
			}
		},

		async getNetgroup(id) {
			try {
				const data = await this.$api.generic.get(`netgroups/${id}/`)
				this.row = data

				this.netid = Array.isArray(this.row.networks) ? [...this.row.networks] : []
				this.oldnetid = Array.isArray(this.row.networks) ? [...this.row.networks] : []

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
				throw e
			}
		},

		async getNetworks() {
			try {
				const data = await this.$api.generic.get("networks/")

				this.networks = (data || []).map((network) => ({
					value: network.id,
					text: network.netid,
				}))

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
				throw e
			} finally {
				this.loading = false
			}
		},

		async patchNetwork(networkId, payload) {
			try {
				await this.$api.generic.patch(`networks/${networkId}/`, payload)
				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
				throw e
			}
		},

		async updateNetworks(groupId) {
			const oldIds = Array.isArray(this.oldnetid) ? this.oldnetid : []
			const newIds = Array.isArray(this.netid) ? this.netid : []

			const toRemove = oldIds.filter((nid) => !newIds.includes(nid))
			const toAdd = newIds.filter((nid) => !oldIds.includes(nid))

			const tasks = [
				...toRemove.map((nid) => this.patchNetwork(nid, { group: null })),
				...toAdd.map((nid) => this.patchNetwork(nid, { group: groupId })),
			]

			if (!tasks.length) {
				return
			}

			await Promise.all(tasks)

			this.oldnetid = [...newIds]
		},

		async onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true

			this.createwithsuccess = false
			this.createerror = false
			this.createerrormsg = null

			try {
				if (!this.update) {
					await this.$api.generic.post("netgroups/", this.row)
				} else {
					await this.$api.generic.patch(`netgroups/${this.row.id}/`, this.row)
					await this.updateNetworks(this.row.id)
				}

				this.createwithsuccess = true
			} catch (e) {
				this.createwithsuccess = false
				this.createerror = true
				this.createerrormsg = this._apiError(e)
			} finally {
				this.loadingcreate = false
			}
		},
	}
}
</script>