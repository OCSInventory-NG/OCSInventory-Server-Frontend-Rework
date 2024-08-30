<template>
	<div id="package-result-modal">
		<div 
			class="col-auto ms-auto"
		>
			<button 
				id="attr-pkg"
				:title="$t('deployment.attrpkg')"
				class="form-control btn datatable-btn"
				@click="(items.length > 0) ? getHeader() : emptyselection = !emptyselection"
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
			modal-class="custom-modal modal-blur"
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
							:disabled="(selectedPkg.length == 0) ? true : false"
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
			modal-class="custom-modal modal-blur"
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
import axios from 'axios'

export default {
	name: "PackageResultModal",
	props: {
		items: { type: Array, default: null },
		group: { type: String, default: null }
	},
	data() {
		return {
			emptyselection: false,
			packageresultmodal: false,
			errored: false,
			errormsg: null,
			rowheader: [],
			rowdata: [],
			loading: true,
			selectedPkg: [],
			loadingcreate: false,
			successed: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
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
		getHeader() {
			this.loading = true
			this.packageresultmodal = true
			axios.options(this.$config.BACKEND_API_ROUTE+"deployment/packages/", { headers: this.header })
				.then(response => {
					Object.keys(response.data.actions.POST).forEach(field => {
						if(field != "result") {
							this.rowheader.push(field)
						}
					})
					this.errormsg = null
					this.errored = false
					this.getPackages()
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})	
		},
		getPackages() {
			axios.get(this.$config.BACKEND_API_ROUTE+"deployment/packages/", { headers: this.header })
				.then(response => {
					response.data.forEach(packages => {
						delete packages.result
						packages.actions_list = packages.actions_list.length
					})
					this.rowdata = response.data
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		attributePackage(selectedItems) {
			this.selectedPkg = selectedItems
		},
		onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true

			var row = []

			for (const asset of this.items) {
				for (const pkg of this.selectedPkg) {
					var tmp = {
						package: pkg.id,
						asset: asset.id,
						name: pkg.name,
						status: 0,
						comment: "Waiting notification",
						group: parseInt(this.group)
					}

					row.push(tmp)
				}
			}

			if(row.length > 0) {
				axios.post(this.$config.BACKEND_API_ROUTE+"deployment/results/", row, { headers: this.header })
					.then(() => {
						this.successed = true
						this.errored = null
						this.errormsg = false
					})
					.catch(e => {
						this.errormsg = e.message
						this.errored = true
						this.successed = false
					})
					.finally(() => {
						this.loadingcreate = false
						this.$emit('reloadDeployment')
					})
			}
		}
	}
}
</script>