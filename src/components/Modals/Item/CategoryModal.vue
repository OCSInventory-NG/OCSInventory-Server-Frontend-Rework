<template>
	<div id="category-modal">
		<div 
			v-if="!update"
			class="page-header d-print-none"
		>
			<div class="row">
				<div class="col-auto ms-auto">
					<b-button
						:title="$t('template.addcategory')"
						variant="primary"
						class="d-sm-inline-block btn-modal"
						@click="categorymodal = !categorymodal"
					>
						<font-awesome-icon 
							:icon="['fas', 'plus']"
						/>
						{{ $t('template.addcategory') }}
					</b-button>
				</div>
			</div>
		</div>
		<div v-else>
			<button 
				:title="$t('template.editcategory')"
				class="btn btn-ghost-dark"
				@click="loadData(id)"
			>
				<font-awesome-icon 
					:icon="['fas', 'pencil']"
				/>
			</button>
		</div>
		<b-modal 
			id="categorymodal" 
			v-model="categorymodal"
			:title="(!update) ? $t('template.addcategory') : $t('template.editcategory')"
			hide-footer
			modal-class="custom-modal modal-blur"
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ (!update) ? $t('template.addcategory') : $t('template.editcategory') }}
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
							:label="$t('inventory.description')" 
							label-for="description"
						>
							<b-form-input
								id="name"
								v-model="row.description"
							/>
						</b-form-group>
					</b-col>
				</b-row>
                <b-row v-if="update">
					<b-col>
						<b-form-group
							:label="$t('template.sections')" 
							label-for="sections"
						>
                            <p><i>{{ $t('message.select_multi') }}</i></p>
                            <b-form-select
                                v-model="row.sections"
                                :options="sections"
                                multiple
                                :select-size="10"
                            />
						</b-form-group>
                        <br>
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
import axios from 'axios'

export default {
	name: "CategoryModal",
	props: {
		update: { type: Boolean, default: false },
		id: { type: Number, default: null }
	},
	data() {
		return {
			row: {
				name: null,
				description: null,
                sections: []
			},
			errormsg: null,
			errored: false,
			loading: true,
			loadingcreate: false,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,
			categorymodal: false,
            sections: [],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		createwithsuccess: function() {
			setTimeout(() => {
				this.categorymodal = false
				this.createwithsuccess = false
				this.row = {
					name: null,
					description: null,
					sections: []
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
		loadData(id) {
			this.loading = true
			this.categorymodal = true
            this.getCategory(id)
		},
		async getCategory(id) {
			await axios.get(this.$config.BACKEND_API_ROUTE+"categories/"+id, { headers: this.header })
				.then(response => {
					this.row = response.data
					this.errormsg = null
					this.errored = false
                    this.getTemplates()
				})
				.catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
		},
        async getTemplates() {
            await axios.get(this.$config.BACKEND_API_ROUTE+"templates/?expand=sections", { headers: this.header })
                .then(response => {
                    this.sections = []
                    for (const template of response.data) {
                        for (const section of template.sections) {
                            this.sections.push({
                                value: section.id,
                                text: template.name.concat(" - ", section.name)
                            })
                        }
                    }
                })
                .catch(e => {
					this.errormsg = e.message
					this.errored = true
				})
                .finally(() => {
                    this.loading = false
                })
        },
		onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true
			
			if(!this.update) {
				axios.post(this.$config.BACKEND_API_ROUTE+"categories/", this.row, { headers: this.header })
					.then(() => {
						this.createwithsuccess = true
						this.createerrormsg = null
						this.createerror = false
					})
					.catch(e => {
						this.createerrormsg = e.message
						this.createerror = true
						this.createwithsuccess = false
					})
					.finally(() => {
						this.loadingcreate = false
					})
			} else {
				axios.patch(this.$config.BACKEND_API_ROUTE+"categories/"+this.row.id+"/", this.row, { headers: this.header })
					.then(() => {
						this.createwithsuccess = true
						this.createerrormsg = null
						this.createerror = false
					})
					.catch(e => {
						this.createerrormsg = e.message
						this.createerror = true
						this.createwithsuccess = false
					})
					.finally(() => this.loadingcreate = false)
			}		
		}
	}
}
</script>