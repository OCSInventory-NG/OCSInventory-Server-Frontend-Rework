<template>
	<div id="SectionCollapse">
		<div
			v-for="(value, key) in rowsectiondata"
			:key="key"
			class="accordion"
			role="tablist"
		>
			<b-card
				no-body
				class="mb-1"
			>
				<b-card-header
					header-tag="header"
					class="p-1"
					role="tab"
				>
					<b-button
						v-b-toggle="'template-'+value.id"
						block
						variant="info"
						class="section-btn"
					>
						{{ value.name }}
					</b-button>
				</b-card-header>

				<b-collapse
					:id="'template-'+value.id"
					accordion="my-accordion"
					role="tabpanel"
				>
					<b-card-body>
						<b-card-text>
							<b-row class="text-center">
								<b-col><b>{{ $t('name') }} :</b> {{ value.name }}</b-col>
								<b-col><b>{{ $t('retrival_method') }} :</b> {{ $t(value.retrival_method) }}</b-col>
								<b-col><b>{{ $t('retrival_output') }} :</b> {{ $t(value.retrival_output) }}</b-col>
								<b-col><b>{{ $t('target') }} :</b> {{ value.target }}</b-col>
								<b-col>
									<b-button-toolbar>
										<b-button-group class="mr-1">
											<EditSectionModal
												:namesection="value.name"
												:retrivalmethod="value.retrival_method"
												:retrivaloutput="value.retrival_output"
												:target="value.target"
												:idmodal="value.id"
												:template="value.template"
												@reloadTemplate="reloadTemplate"
											/>
											<delete-item-modal 
												:id="value.id"
												:name="value.name"
												parameter="sections"
												@reloadTemplate="reloadTemplate"
											/>
										</b-button-group>
										<b-button-group class="mx-3">
											<AddFieldModal
												:section="value.id"
												@reloadTemplate="reloadTemplate"
											/>
										</b-button-group>
									</b-button-toolbar>
								</b-col>
							</b-row><br><br>
							<b-row  
								v-if="value.fields[0]"
								align-h="center" 
								class="text-center"
							>
								<b-col>
									<FieldCollapse
										:rowfielddata="value.fields"
										@reloadTemplate="reloadTemplate"
									/>
								</b-col>
							</b-row>
						</b-card-text>
					</b-card-body>
				</b-collapse>
			</b-card>
		</div>
	</div>
</template>

<script>
import FieldCollapse from '@/components/Collapse/Template/FieldCollapse'
import EditSectionModal from '@/components/Modals/EditItem/EditSectionModal'
import DeleteItemModal from '@/components/Modals/DeleteItem/DeleteItemModal'
import AddFieldModal from '@/components/Modals/AddItem/AddFieldModal'

export default {
	name: 'SectionCollapse',
	components: {
		FieldCollapse,
		EditSectionModal,
		DeleteItemModal,
		AddFieldModal
	},
	props: {
		rowsectiondata: { type: Array, default: null },
	},
	methods: {
		reloadTemplate() {
			this.$emit('reloadTemplate')
		},
	}
}
</script>
