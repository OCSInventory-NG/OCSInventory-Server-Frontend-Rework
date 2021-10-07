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
												:retrival_method="value.retrival_method"
												:retrival_output="value.retrival_output"
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
									</b-button-toolbar>
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

export default {
	name: 'SectionCollapse',
	components: {
		FieldCollapse,
		EditSectionModal,
		DeleteItemModal
	},
	props: {
		rowsectiondata: { type: Array, default: null },
		rowfielddata: { type: Array, default: null },
	},
	methods: {
		reloadTemplate() {
			this.$emit('reloadTemplate')
		},
	}
}
</script>
