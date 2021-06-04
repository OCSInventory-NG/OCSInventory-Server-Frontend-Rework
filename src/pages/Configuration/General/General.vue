<template>
	<div id="GeneralPage">
		<section v-if="successed">
			<b-alert 
				:show="!!succesMsg" 
				class="alert-sm" 
				variant="success"
			>
				{{ $t('success_saved') }}
			</b-alert>
		</section>

		<section v-if="errored">
			<b-alert 
				:show="!!errorMsg" 
				class="alert-sm" 
				variant="danger"
			>
				{{ errorMsg }}
			</b-alert>
		</section>

		<section v-else>
			<div v-if="loading">
				<Loader/>
			</div>

			<div
				v-else
			>
				<Datatable
					id="generalDatatable"
					:rowdata="rowdata"
					editcomponent="EditConfigModal"
					title="config"
					@reloadDatatable="reloadDatatable"
				/>
			</div>
		</section>
	</div>
</template>

<script>
import Axios from 'axios'
import i18n from '../../../i18n'
import Loader from '@/components/Loader/Loader'
import Datatable from '@/components/Datatable/Datatable'

const header = {
	"Content-Type": "application/json;charset=utf-8",
	"Authorization": 'Token ' + localStorage.getItem('token_authentication')
}

export default {
	name: 'GeneralPage',
	components: {
		Datatable,
		Loader
	},
	data() {
		return {
			rowdata: [],
			errorMsg: null,
			succesMsg: null,
			errored: false,
			successed: false,
			loading: true,
		}
	},
	watch: {
		successed: function() {
			setTimeout(() => this.successed = false, 10000)
		}
	},
	mounted() {
		this.getConfig()
	},
	methods: {
		// Get all config
		getConfig() {
			Axios.get("http://172.18.26.12:8000/config", { headers: header })
				.then(response => {
					response.data.forEach(element => {
						var tmpArray = [];
						tmpArray = {
							name: element.name,
							description: i18n.t(element.name),
							value: element.value
						}
						this.rowdata.push(tmpArray)
					});
					this.loading = false
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
					this.loading = false
				})
		},
		reloadDatatable() {
			this.getConfig()
		}
	}
}
</script>
