<template>
	<div id="asset-options-modal">
		<div 
			class="col-auto ms-auto"
		>
			<button 
				id="asset-options"
				:title="$t('inventory.options')"
				class="form-control btn datatable-btn"
				:disabled="viewOnly"
				@click="
					assetoptmodal = true,
					selectedopt = null,
					errored = false,
					errormsg = null
				"
			>
				<font-awesome-icon 
					:icon="['fas', 'sliders']"
				/>
			</button>
		</div>
		<b-modal 
			id="asset-opt" 
			v-model="assetoptmodal"
			:title="$t('inventory.options')"
			:disabled="viewOnly"
			hide-footer
			modal-class="custom-modal"
			
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('inventory.options') }}
					<b-spinner 
						v-if="loadingcreate"
						variant="success"
					/>
					<font-awesome-icon 
						v-if="successed"
						:icon="['fas', 'check']"
						color="green"
					/>
					<font-awesome-icon 
						v-if="errored"
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
			<b-form
				v-else
				@submit="onSubmit"
			>
				<b-row>
					<b-col>
						<b-form-group
							:label="$t('generic.actions')" 
							label-for="selectopt"
						>
							<v-select
								id="selectopt"
								v-model="selectedopt" 
								:options="options"
								:disabled="viewOnly"
								:reduce="text => text.value"
								:clearable="false"
								label="text"
								class="mb-3"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row v-if="selectedopt == 'assign_temp'">
					<b-col>
						<Alert
							:message="$t('inventory.force_template')"
							variant="warning"
						/>
					</b-col>
				</b-row>
				<b-row v-if="selectedopt == 'assign_temp'">
					<b-col>
						<b-form-group
							:label="$t('title.templates')" 
							label-for="template"
						>
							<v-select
								id="template"
								v-model="template"
								:options="rowdatatmp" 
								:reduce="text => text.value"
								:disabled="viewOnly"
								:clearable="false"
								label="text"
								class="mb-3"
							/>
						</b-form-group>
					</b-col>
				</b-row>
				<b-row v-if="selectedopt == 'assign_grp'">
					<b-col>
						<b-form-group
							:label="$t('title.assetgroups')" 
							label-for="assetgrp"
						>
							<v-select
								id="assetgrp"
								v-model="selectedgrp" 
								:options="rowdatagrp" 
								:reduce="text => text.value"
								:disabled="viewOnly"
								:clearable="false"
								label="text"
								class="mb-3"
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
							:disabled="viewOnly"
						>
							{{ $t('generic.save') }}
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
	name: "AssetOptionsModal",
	props: {
		item: { type: [Array, Object], default: () => [] }
	},
	data() {
		return {
			errored: false,
			errormsg: null,

			successed: false,

			assetoptmodal: false,
			rowdatatmp: [],
			rowdatagrp: [],
			rowtmp: [],
			rowgrp: [],
			template: null,
			selectedopt: null,
			selectedgrp: null,
			options: [
				{ value: 'assign_temp', text: this.$t('template.assign') },
				{ value: 'assign_grp', text: this.$t('inventory.assign') },
				{ value: 'reset_temp', text: this.$t('inventory.reset_template') }
			],
			
			loading: false,
			loadingcreate: false,
		}
	},
	computed: {
		viewOnly() {
			return !localStorage.getItem("permissions")?.split(',').includes('asset_group_change_assetgroup')
		}
	},
	watch: {
		successed: function() {
			setTimeout(() => {
				this.assetoptmodal = false
				this.successed = false
				this.selectedopt = null
				this.$emit('reloadInventory')
			}, 500)
		}
	},
	async mounted() {
		this.getTemplate()
		this.getStaticGroup()
		this.template = this.item[0].template ?? null
	},
	methods: {
		_apiError(e) {
			return e?.response?.data?.error || e?.message || String(e)
		},

		async getTemplate() {
			this.rowtmp = this.item

			try {
				const data = await this.$api.generic.get("templates/", { "os!": "SNMP" })

				this.rowdatatmp = data.map((template) => ({
					value: template.id,
					text: template.name,
				}))

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			}
		},

		async getStaticGroup() {
			try {
				const data = await this.$api.generic.get("asset/groups/", { is_dynamic: false })

				this.rowdatagrp = []
				data.forEach((assetgrp) => {
					this.rowgrp[assetgrp.id] = assetgrp
					this.rowdatagrp.push({
						value: assetgrp.id,
						text: assetgrp.name,
					})
				})

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			}
		},

		async onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true
			this.successed = false
			this.errored = false
			this.errormsg = null

			try {
				if (this.selectedopt === "assign_temp" || this.selectedopt === "reset_temp") {
					const patch = {
						template: this.selectedopt === "assign_temp" ? this.template : null,
						is_template_forced: this.selectedopt === "assign_temp",
					}

					await this.$api.generic.patch(
						`asset/bases/${this.item[0].id}/`,
						patch
					)

					this.successed = true
				} else if (this.selectedopt === "assign_grp") {
					const grp = this.rowgrp[this.selectedgrp]

					grp.assets = grp.assets || []

					if (!grp.assets.includes(this.rowtmp[0].id)) {
						grp.assets.push(this.rowtmp[0].id)
					}

					await this.$api.generic.patch(
						`asset/groups/${this.selectedgrp}/`,
						grp
					)

					this.successed = true
				}
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
				this.successed = false
			} finally {
				this.loadingcreate = false
			}
		},
	}
}
</script>