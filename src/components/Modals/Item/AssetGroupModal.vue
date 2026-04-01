<template>
	<div id="asset-group-modal">
		<div
			v-if="!update"
			class="col-auto ms-auto" 
			:align="(!datatable) ? 'center' : ''"
		>
			<b-button
				:title="$t('assetgroup.saveasgroup')"
				:class="cssclass + ' d-none d-sm-inline-block btn-teal'"
				:disabled="viewOnly"
				@click="
					loadData(),
					getUserInfo()
				"
			>
				<font-awesome-icon 
					:icon="['fas', 'plus']"
				/>
				{{ $t('assetgroup.group') }}
			</b-button>
		</div>
		<div v-else>
			<button 
				:title="$t('assetgroup.editassetgroup')"
				class="btn btn-ghost-dark"
				@click="loadData(id)"
			>
				<font-awesome-icon 
					:icon="['fas', 'pencil']"
				/>
			</button>
		</div>
		<b-modal 
			id="assetgroupmodal" 
			v-model="assetgroupmodal"
			:title="(!update) ? $t('assetgroup.saveasgroup') : $t('assetgroup.editassetgroup')"
			hide-footer
			modal-class="custom-modal"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ (!update) ? $t('assetgroup.saveasgroup') : $t('assetgroup.editassetgroup') }}
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
				<div v-if="datatable && !assetrow.length">
					<Alert 
						:message="$t('message.no_selection')" 
						variant="warning"
					/>
				</div>
				<div v-else>
					<b-row v-if="!update">
						<b-col>
							<b-form-group
								:label="$t('assetgroup.action')" 
								label-for="action"
							>
								<v-select 
									id="action"
									v-model="groupaction"
									:options="(!datatable) ? optactions : optactionsdt"
									:reduce="text => text.value"
									:clearable="false"
									label="text"
									class="mb-3"
									required
									@option:selected="getMyAssetGroups()"
								/>
							</b-form-group>
						</b-col>
					</b-row>
					<b-row v-if="groupaction == 'update'">
						<b-col>
							<b-form-group
								:label="$t('assetgroup.selectassetgroup')" 
								label-for="assetgroups"
							>
								<v-select 
									id="assetgroups"
									v-model="updategroupid"
									:options="optgroup"
									:reduce="text => text.value"
									:clearable="false"
									label="text"
									class="mb-3"
									required
									@option:selected="setAssetGroupInfo(updategroupid)"
								/>
							</b-form-group>
						</b-col>
					</b-row>
					<b-row v-if="!datatable || (datatable && groupaction != 'update')">
						<b-col>
							<b-form-group
								:label="$t('assetgroup.name')" 
								label-for="name"
							>
								<b-form-input
									id="name"
									v-model="rowgroup.name"
									required
								/>
							</b-form-group>
						</b-col>
					</b-row>
					<b-row v-if="!datatable || (datatable && groupaction != 'update')">
						<b-col>
							<b-form-group
								:label="$t('assetgroup.description')" 
								label-for="description"
							>
								<b-form-input
									id="description"
									v-model="rowgroup.description"
								/>
							</b-form-group>
						</b-col>
					</b-row>
					<b-row v-if="!datatable">
						<b-col>
							<b-form-group
								:label="$t('assetgroup.is_dynamic')" 
								label-for="is_dynamic"
							>
								<label class="form-check form-switch">
									<input 
										v-model="rowgroup.is_dynamic"
										class="is-dynamic form-check-input"
										type="checkbox"
									>
								</label>
							</b-form-group>
						</b-col>
					</b-row>
					<b-row v-if="!datatable || (datatable && groupaction != 'update')">
						<b-col>
							<b-form-group
								:label="$t('assetgroup.visibility')" 
								label-for="visibility"
							>
								<v-select 
									v-model="rowgroup.visibility"
									:options="optvisibility"
									:reduce="text => text.value"
									:clearable="false"
									label="text"
									class="mb-3"
									required
								/>
							</b-form-group>
						</b-col>
					</b-row>
					<b-row v-if="rowgroup.visibility == 'private_group'">
						<b-col>
							<b-form-group
								:label="$t('assetgroup.groups')" 
								label-for="groups"
							>
								<v-select 
									v-model="rowgroup.groups"
									:options="groups"
									:reduce="text => text.value"
									label="text"
									multiple
								/>
							</b-form-group>
						</b-col>
					</b-row>
					<b-row v-if="rowgroup.visibility == 'private_group'">
						<b-col>
							<b-form-group
								class="allow-group-modification"
								:label="$t('assetgroup.allow_group_modification')" 
								label-for="allow_group_modification"
							>
								<label class="form-check form-switch">
									<input 
										v-model="rowgroup.allow_group_modification"
										class="form-check-input"
										type="checkbox"
									>
								</label>
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
	name: "AssetGroupModal",
	props: {
		search: { type: [Array, Object], default: () => [] },
		assetrow: { type: [Array, Object], default: () => []},
		update: { type: Boolean, default: false },
		id: { type: Number, default: null },
		datatable: { type: Boolean, default: false },
		cssclass: { type: String, default: null }
	},
	data() {
		return {
			errormsg: null,
			errored: false,
			createerror: false,
			createerrormsg: null,

			createwithsuccess: false,

			rowgroup: {
				name: null,
				description: null,
				search: [],
				is_dynamic: (this.datatable) ? false : true,
				assets: [],
				visibility: "public",
				allow_group_modification: false,
				user: null,
				groups: []
			},
			assetgroupmodal: false,
			optvisibility: [
				{ value: "public", text: this.$t("assetgroup.public") },
				{ value: "private_personal", text: this.$t("assetgroup.private_personal") },
				{ value: "private_group", text: this.$t("assetgroup.private_group") }
			],
			optactions : [
				{ value: "create", text: this.$t("assetgroup.create") },
				{ value: "update", text: this.$t("assetgroup.update") }
			],
			optactionsdt : [
				{ value: "create", text: this.$t("assetgroup.create") },
				{ value: "update", text: this.$t("assetgroup.addingrp") }
			],
			optgroup: [],
			user: [],
			groups: [],
			groupaction: "create",
			updategroup: [],
			updategroupid: null,
			
			loading: true,
			loadingcreate: false,
		}
	},
	computed: {
		viewOnly() {
			return !localStorage.getItem('permissions')?.split(',').includes("asset_group_change_assetgroup")
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.assetgroupmodal = false
				this.createwithsuccess = false
				this.rowgroup = {
					name: null,
					description: null,
					search: [],
					is_dynamic: (this.datatable) ? false : true,
					assets: [],
					visibility: "public",
					allow_group_modification: false,
					user: null,
					groups: []
				}
				if(this.update) {
					this.$emit("reloadDatatable")
				}
			}, 500)
		}
	},
	methods: {
		_apiError(e) {
			return e?.response?.data?.error || e?.message || String(e)
		},

		_resetRowgroup() {
			this.rowgroup = {
				name: null,
				description: null,
				search: [],
				is_dynamic: this.datatable ? false : true,
				assets: [],
				visibility: "public",
				allow_group_modification: false,
				user: null,
				groups: [],
			}
		},

		loadData(id) {
			this.assetgroupmodal = true
			this._resetRowgroup()

			this.errormsg = null
			this.errored = false
			this.createerror = false
			this.createerrormsg = null
			this.createwithsuccess = false

			if (id) {
				this.loading = true
				this.getAssetGroupInfo(id)
			}
		},

		async getAssetGroupInfo(id) {
			this.loading = true
			this.assetgroupmodal = true

			try {
				const data = await this.$api.generic.get(`asset/groups/${id}/`)

				const cleaned = { ...data }
				delete cleaned.search
				delete cleaned.assets

				this.rowgroup = cleaned
				this.errormsg = null
				this.errored = false

				await this.getUserName()
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		async getUserName() {
			try {
				const data = await this.$api.generic.get(`users/${this.rowgroup.user}/`)
				this.user = data

				if (data.first_name && data.first_name !== "") {
					this.rowgroup.user = data.last_name.concat(" ", data.first_name)
				} else {
					this.rowgroup.user = data.username
				}

				await this.getGroups(this.user.groups || [])
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			}
		},

		async getUserInfo() {
			this.loading = true
			this.assetgroupmodal = true

			try {
				this.optvisibility.sort((a, b) =>
					a.text > b.text ? 1 : (b.text > a.text ? -1 : 0)
				)

				const data = await this.$api.generic.get("myaccount/")
				this.user = data

				this.errormsg = null
				this.errored = false

				if (this.user.groups) {
					await this.getGroups(this.user.groups)
				}
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		async getGroups(groups) {
			this.loading = true
			this.groups = []

			try {
				const results = await Promise.all(
					(groups || []).map((groupId) => this.$api.generic.get(`groups/${groupId}/`))
				)

				this.groups = results
					.map((g) => ({ value: g.id, text: g.name }))
					.sort((a, b) => (a.text > b.text ? 1 : (b.text > a.text ? -1 : 0)))

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		async getMyAssetGroups() {
			this.loading = true
			this._resetRowgroup()

			const parameter = this.datatable ? { is_dynamic: false } : {}
			this.optgroup = []
			this.updategroupid = null

			try {
				const data = await this.$api.generic.get("asset/groups/", parameter)

				for (const assetgroup of data) {
					this.optgroup.push({ value: assetgroup.id, text: assetgroup.name })
					this.updategroup[assetgroup.id] = assetgroup
				}

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			} finally {
				this.loading = false
			}
		},

		setAssetGroupInfo(id) {
			this.loading = true
			this.rowgroup = this.updategroup[id]
			this.loading = false
		},

		async onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true
			this.createwithsuccess = false
			this.createerror = false
			this.createerrormsg = null

			try {
				if (!this.update) {
					if (!this.datatable) {
						this.rowgroup.assets = this.assetrow
						this.rowgroup.search = this.search
					} else {
						for (const asset of this.assetrow) {
							if (!this.rowgroup.assets.includes(asset.id)) {
								this.rowgroup.assets.push(asset.id)
							}
						}
					}
				}

				this.rowgroup.user = this.user.id

				if (this.rowgroup.visibility !== "private_group") {
					this.rowgroup.groups = []
					this.rowgroup.allow_group_modification = false
				}

				if (!this.update && this.groupaction === "create") {
					await this.$api.generic.post("asset/groups/", this.rowgroup)
				} else {
					await this.$api.generic.patch(`asset/groups/${this.rowgroup.id}/`, this.rowgroup)
				}

				this.createwithsuccess = true
			} catch (e) {
				this.createerrormsg = this._apiError(e)
				this.createerror = true
				this.createwithsuccess = false
			} finally {
				this.loadingcreate = false
			}
		},
	}
}
</script>