<template>
	<div id="EditTemplatePage">
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
				<b-row class="text-center">
					<b-col cols="1">
						<AddSectionModal
							:template="rowtemplatedata.id"
							@reloadTemplate="reloadTemplate"
						/>
					</b-col>
					<b-col cols="10">
						<h2> {{ rowtemplatedata.name }} </h2><br>
					</b-col>
				</b-row>
				<b-row class="text-center">
					<b-col>
						<p>{{ $t('os') }} : {{ $t(rowtemplatedata.os) }}</p>
						<p>{{ $t('last_update') }} : {{ rowtemplatedata.last_update }}</p>
					</b-col>
				</b-row>

				<SectionCollapse
					:rowsectiondata="rowsectiondata"
					@reloadTemplate="reloadTemplate"
				/>

			</div>
		</section>
	</div>
</template>

<script>
import Axios from 'axios'
import Loader from '@/components/Loader/Loader'
import SectionCollapse from '@/components/Collapse/Template/SectionCollapse'
import AddSectionModal from '@/components/Modals/AddItem/AddSectionModal.vue'

export default {
	name: 'TemplatePage',
	components: {
		Loader,
		SectionCollapse,
		AddSectionModal
	},
	props: {
		id: { type: String, required: true },
	},
	data() {
		return {
			errorMsg: null,
			rowtemplatedata: [],
			rowsectiondata: [],
			succesMsg: null,
			successed: false,
			loading: true,
			errored: false
		}
	},
	watch: {
		successed: function() {
			setTimeout(() => this.successed = false, 10000)
		}
	},
	mounted() {
		this.getTemplate()
	},
	methods: {
		getTemplate() {
			const header = {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}

			Axios.get(process.env.VUE_APP_API_ROUTE+"templates/"+this.id, { headers: header })
				.then(response => {
					this.rowtemplatedata = response.data
					this.rowsectiondata = response.data.sections
					this.errorMsg = null
					this.errored = false
				})
				.catch(e => {
					this.errorMsg = e
					this.errored = true
				})
				.finally(() => this.loading = false)
		},
		reloadTemplate() {
			this.loading = true
			this.getTemplate()
		}
	}
}
</script>
