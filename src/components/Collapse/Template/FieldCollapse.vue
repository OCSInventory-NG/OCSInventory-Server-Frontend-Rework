<template>
	<div id="FieldCollapse">
		<div>
			<!-- Via array of string IDs passed to directive value -->
			<b-button v-b-toggle="idcollapse">{{ $t('displayfields') }}</b-button>

			<!-- Elements to collapse -->
			<b-collapse 
				v-for="(value, key) in rowfielddata"
				:key="key"
				:id="'field-'+value.id"
				class="mt-2">
				<b-card>
					<b-row class="text-center">
						<b-col cols="3"><b>{{ $t('name') }} :</b> {{ value.name }}</b-col>
						<b-col cols="3"><b>{{ $t('retrival_value') }} :</b> {{ value.retrival_value }}</b-col>
						<b-col cols="4"/>
						<b-col>
							<b-button-toolbar>
								<b-button-group class="mr-1">
									<EditFieldModal
										:namefield="value.name"
										:retrivalvalue="value.retrival_value"
										:idmodal="value.id"
										:section="value.section"
										@reloadTemplate="reloadTemplate"
									/>
									<delete-item-modal 
										:id="value.id"
										:name="value.name"
										parameter="fields"
										@reloadTemplate="reloadTemplate"
									/>
								</b-button-group>
							</b-button-toolbar>
						</b-col>
					</b-row>
				</b-card>
			</b-collapse>
		</div>
	</div>
</template>

<script>
import EditFieldModal from '@/components/Modals/EditItem/EditFieldModal'
import DeleteItemModal from '@/components/Modals/DeleteItem/DeleteItemModal'

export default {
	name: 'FieldCollapse',
	components: {
		EditFieldModal,
		DeleteItemModal
	},
	props: {
		rowfielddata: { type: Array, default: null },
	},
	data() {
		return {
			idcollapse: []
		}
	},
	created() {
		this.rowfielddata.forEach(details => {
			this.idcollapse.push('field-' + details.id)
		})
	},
	methods: {
		reloadTemplate() {
			this.$emit('reloadTemplate')
		},
	}
}
</script>
