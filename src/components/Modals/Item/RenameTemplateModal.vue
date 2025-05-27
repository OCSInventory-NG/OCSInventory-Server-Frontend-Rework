<template>
	<div id="renameTemplate-modal">
		<div>
			<button 
				:title="$t('template.editname')"
				class="btn btn-ghost-dark"
				@click="loadData(id)"
			>
				<font-awesome-icon 
					:icon="['fas', 'pencil']"
				/>
			</button>
		</div>
		<b-modal  
			v-model="renametemplatemodal"
			:title="$t('template.editname')"
			hide-footer
			modal-class="custom-modal modal-blur"
			scrollable
		>
			<template #header="{ close }">
				<h5 class="modal-title">
					{{ $t('template.editname') }}
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
	name: "RenameTemplateModal",
	props: {
		routetype: { type: String, default: "assets" },
		id: { type: String, default: null },
		name: { type: String, default: null },
		os: { type: String, default: null },
		isProtected: { type: Boolean, default: null },
		lastUpdate: { type: Date, default: null },
		sections: { type: Map, default: null },
	},
	data() {
		return {
			row: {
				id: null,
				name: null,
				os: null,
				is_protected: null,
				last_update: null,
				sections: null,
			},
			routetypemut: "assets",
			errormsg: null,
			errored: false,
			loading: true,
			loadingcreate: false,
			createerror: false,
			createerrormsg: null,
			createwithsuccess: false,
			renametemplatemodal: false,
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}
		}
	},
	watch: {
		createwithsuccess: function() {
			if (this.createwithsuccess) {
				setTimeout(() => {
					this.renametemplatemodal = false
					this.createwithsuccess = false
					this.row = {
						id: null,
						name: null,
						os: null,
						is_protected: null,
						last_update: null,
						sections: null,
					}
					this.$emit("reloadDatatable")
				}, 500)
			}
		}
	},
	created() {
		if(this.$route.path.includes("snmp")) {
			this.routetypemut = "snmp"
		}
	},
	mounted() {
		if(!this.update) {
			this.row.section = this.section
			this.loading = false
		}
	},
	methods: {
		loadData(id) {
			this.loading = true
			this.renametemplatemodal = true
			this.getField(id)
		},
		async getField(id) {
			this.loading = true
			this.errored = false
			this.errormsg = null

			try {
				const response = await axios.get(
					this.$config.BACKEND_API_ROUTE + "templates/" + id + "/",
					{ headers: this.header }
				)
				this.row = response.data
			} catch (e) {
				this.errored = true
				this.errormsg = e.message
			} finally {
				this.loading = false
			}
		},

		onSubmit(event) {
			event.preventDefault()
			this.loadingcreate = true
			this.createerror = false
			this.createerrormsg = null

			const url = this.$config.BACKEND_API_ROUTE + "templates/" + this.id + "/"
			const request = axios.patch
			request(url, {name: this.row.name}, { headers: this.header })
				.then(() => {
					this.createwithsuccess = true
					this.createerror = false
				})
				.catch(e => {
					this.createerror = true
					this.createerrormsg = e.message
					this.createwithsuccess = false
				})
				.finally(() => {
					this.loadingcreate = false
				})
		},
	}
}
</script>