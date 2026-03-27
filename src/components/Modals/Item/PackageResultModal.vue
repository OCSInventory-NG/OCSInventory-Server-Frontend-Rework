<template>
	<div id="package-result-modal">
		<div 
			class="col-auto ms-auto"
		>
			<button 
				id="attr-pkg"
				:title="$t('deployment.attrpkg')"
				class="form-control btn datatable-btn"
				:disabled="viewOnly"
				@click="
					(items.length > 0) ? loadInitial() : emptyselection = !emptyselection,
					loadData()
				"
			>
				<font-awesome-icon 
					:icon="['fas', 'boxes-packing']"
				/>
			</button>
		</div>
		<b-modal 
			id="attr-pkg" 
			v-model="packageresultmodal"
			:title="$t('deployment.attrpkg')"
			hide-footer
			modal-class="custom-modal"
			size="xl"
			
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('deployment.attrpkg') }}
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
				<div>
					<Datatable
						id="attrpkg-datatable"
						:rowdata="rowdata"
						:usecheckbox="true"
						:canexport="false"
						:canshowhide="false"
						:rowheader="rowheader"
						:isbusy="isbusy"
						:canrefresh="false"
						is-sticky
						title="deployment"
						translationkey="deployment."
						@attributePackage="attributePackage"
					/>
				</div>
				<b-row>
					<b-col align-self="start" />
					<b-col 
						align-self="center"
						align="center"
					>
						<b-button 
							type="submit"
							variant="success"
							:disabled="viewOnly || selectedPkg.length == 0"
						>
							{{ $t('generic.add') }}
						</b-button>
					</b-col>
					<b-col align-self="end" />
				</b-row>
			</b-form>
		</b-modal>
		<b-modal 
			id="attr-pkg" 
			v-model="emptyselection"
			:title="$t('deployment.attrpkg')"
			hide-footer
			modal-class="custom-modal"
			size="lg"
			
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('deployment.attrpkg') }}
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
			<div>
				<Alert 
					:message="$t('message.no_selection')" 
					variant="warning"
				/>
			</div>
		</b-modal>
	</div>
</template>

<script>
export default {
	name: "PackageResultModal",
	props: {
		items: { type: [Array, Object], default: () => [] },
		group: { type: String, default: null },
	},
	computed: {
		viewOnly() {
			return !localStorage.getItem("permissions")?.split(',').includes('asset_group_change_assetgroup')
		}
	},
	data() {
		return {
			errored: false,
			errormsg: null,

			successed: false,
			emptyselection: false,
			packageresultmodal: false,
			rowheader: [],
			rowdata: [],
			selectedPkg: [],
			
			isbusy: true,
			loading: true,
			loadingcreate: false,
		}
	},
	watch: {
		successed: function() {
			setTimeout(() => {
				this.packageresultmodal = false
				this.successed = false
			}, 500)
		}
	},
	methods: {
		_apiError(e) {
			return e?.response?.data?.error || e?.message || String(e)
		},

		loadData() {
			this.errormsg = null
			this.errored = false
		},

		async loadInitial() {
			this.loading = true
			this.isbusy = true,
			this.packageresultmodal = true

			try {
				const header = await this.$api.generic.options("deployment/packages/")
				this.rowheader = Object.keys(header.actions.POST).filter((f) => f !== "result")

				this.errormsg = null
				this.errored = false

				await this.getPackages()
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			} finally {
				this.loading = false
				this.isbusy = false
			}
		},

		async getPackages() {
			this.isbusy = true

			try {
				const data = await this.$api.generic.get("deployment/packages/")

				this.rowdata = (data || []).map((pkg) => {
					const { result: _result, ...rest } = pkg
					return {
						...rest,
						actions_list: Array.isArray(rest.actions_list) ? rest.actions_list.length : 0,
					}
				})

				this.errormsg = null
				this.errored = false
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
			} finally {
				this.isbusy = false
			}
		},

		attributePackage(selectedItems) {
			this.selectedPkg = selectedItems
		},

		async onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true

			this.successed = false
			this.errored = false
			this.errormsg = null

			try {
				const row = []

				for (const asset of this.items) {
					for (const pkg of this.selectedPkg) {
						row.push({
							package: pkg.id,
							asset: asset.id,
							name: pkg.name,
							status: 1,
							comment: "Waiting notification",
							group: parseInt(this.group, 10),
						})
					}
				}

				if (!row.length) {
					this.successed = true
					return
				}

				await this.$api.generic.post("deployment/results/", row)

				this.successed = true
				this.errored = false
				this.errormsg = null
			} catch (e) {
				this.errormsg = this._apiError(e)
				this.errored = true
				this.successed = false
			} finally {
				this.loadingcreate = false
				this.$emit("reloadDeployment")
			}
		},
	}
}
</script>