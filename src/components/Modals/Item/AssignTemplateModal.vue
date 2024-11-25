<template>
	<div id="assign-template-modal">
		<div 
			class="col-auto ms-auto"
		>
			<button 
				id="assign-template"
				:title="$t('template.assign')"
				class="form-control btn datatable-btn"
				@click="getTemplate()"
			>
				<font-awesome-icon 
					:icon="['fas', 'sliders']"
				/>
			</button>
		</div>
		<b-modal 
			id="assign-temp" 
			v-model="assigntemplatemodal"
			:title="$t('template.assign')"
			hide-footer
			modal-class="custom-modal modal-blur"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('template.assign') }}
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
							:label="$t('title.templates')" 
							label-for="template"
						>
							<v-select
								id="template"
								v-model="row[0].template" 
								:options="rowdata" 
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
	name: "AssignTemplateModal",
	props: {
		item: { type: Array, default: null }
	},
	data() {
		return {
			assigntemplatemodal: false,
			errored: false,
			errormsg: null,
			rowdata: [],
			row: [],
			loading: true,
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
				this.assigntemplatemodal = false
				this.successed = false
				this.$emit('reloadInventory', this.row)
			}, 500)
		}
	},
	methods: {
		async getTemplate() {
			this.loading = true
			this.row = this.item
			this.assigntemplatemodal = true
			await axios.get(this.$config.BACKEND_API_ROUTE+"templates?os!=SNMP", { headers: this.header })
				.then(response => {
					this.rowdata = []
					response.data.forEach(template => {
						this.rowdata.push({
							value: template.id,
							text: template.name
						})
					})
					this.errormsg = null
					this.errored = false
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true

			axios.patch(this.$config.BACKEND_API_ROUTE+"asset/bases/"+this.row[0].id+"/", this.row[0],
				{ headers: this.header })
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
				})
		}
	}
}
</script>