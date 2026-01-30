<template>
	<div id="asset-options-modal">
		<div 
			class="col-auto ms-auto"
		>
			<button 
				id="asset-options"
				:title="$t('inventory.options')"
				class="form-control btn datatable-btn"
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
			hide-footer
			modal-class="custom-modal modal-blur"
			scrollable
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
import axios from 'axios'

export default {
	name: "AssetOptionsModal",
	props: {
		item: { type: Array, default: null }
	},
	data() {
		return {
			assetoptmodal: false,
			errored: false,
			errormsg: null,
			rowdatatmp: [],
			rowdatagrp: [],
			rowtmp: [],
			rowgrp: [],
			template: null,
			loading: false,
			loadingcreate: false,
			successed: false,
			selectedopt: null,
			selectedgrp: null,
			options: [
				{ value: 'assign_temp', text: this.$t('template.assign') },
				{ value: 'assign_grp', text: this.$t('inventory.assign') },
				{ value: 'reset_temp', text: this.$t('inventory.reset_template') }
			],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
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
		async getTemplate() {
			this.rowtmp = this.item
			await axios.get(this.$config.BACKEND_API_ROUTE+"templates/?os!=SNMP", { headers: this.header })
				.then(response => {
					this.rowdatatmp = []
					response.data.forEach(template => {
						this.rowdatatmp.push({
							value: template.id,
							text: template.name
						})
					})
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
		},
		async getStaticGroup() {
			await axios.get(this.$config.BACKEND_API_ROUTE+"asset/groups/?is_dynamic=false", { headers: this.header })
				.then(response => {
					this.rowdatagrp = []
					response.data.forEach(assetgrp => {
						this.rowgrp[assetgrp.id] = assetgrp
						this.rowdatagrp.push({
							value: assetgrp.id,
							text: assetgrp.name
						})
					})
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
					this.errored = true
				})
		},
		onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true

			if(this.selectedopt == "assign_temp" || this.selectedopt == "reset_temp") {

				var patch = {
					template: (this.selectedopt == "assign_temp") ? this.template : null,
					is_template_forced: (this.selectedopt == "assign_temp") ? true : false
				}

				axios.patch(this.$config.BACKEND_API_ROUTE+"asset/bases/"+this.item[0].id+"/", patch,
					{ headers: this.header })
					.then(() => {
						this.successed = true
						this.errored = null
						this.errormsg = false
					})
					.catch(e => {
						this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
						this.errored = true
						this.successed = false
					})
					.finally(() => {
						this.loadingcreate = false
					})
			} else if(this.selectedopt == "assign_grp") {
				this.rowgrp[this.selectedgrp].assets.push(this.rowtmp[0].id)

				axios.patch(this.$config.BACKEND_API_ROUTE+"asset/groups/"+this.selectedgrp+"/",
					this.rowgrp[this.selectedgrp], { headers: this.header })
					.then(() => {
						this.successed = true
						this.errored = null
						this.errormsg = false
					})
					.catch(e => {
						this.errormsg = (e.response?.data?.error) ? e.response.data.error : e.message
						this.errored = true
						this.successed = false
					})
					.finally(() => {
						this.loadingcreate = false
					})
			}
		}
	}
}
</script>