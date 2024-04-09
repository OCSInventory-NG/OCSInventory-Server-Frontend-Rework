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
							<div class="table-responsive">
								<table class="table table-vcenter border">
									<thead>
										<tr>
											<th>{{ $t('user.name') }}</th>
											<th>{{ $t('template.retrival_output') }}</th>
											<th>{{ $t('template.retrival_output') }}</th>
											<th>{{ $t('template.target') }}</th>
											<th>{{ $t('template.retrieval_output_options') }}</th>
											<th class="section-table-title">
												{{ $t('generic.actions') }}
											</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>{{ value.name }}</td>
											<td>{{ $t("template."+value.retrival_method) }}</td>
											<td>{{ $t("template."+value.retrival_output) }}</td>
											<td>{{ value.target }}</td>
											<td>
												<p
													v-for="(option,optionname) in value.options"
													:key="optionname"
													class="section-table-options"
												>
													{{ $t('template.' + optionname) }} : {{ option }}
												</p>
											</td>
											<td class="section-table-btn">
												<b-button-toolbar>
													<b-button-group class="mr-1">
														<EditSectionModal
															:rowsectiondata="value"
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
											</td>
										</tr>
									</tbody>
								</table>
							</div>
							<!--<br><br>-->
							<b-row  
								v-if="value.fields[0]"
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
import FieldCollapse from '@/components/Collapse/Template/FieldCollapse.vue'
import EditSectionModal from '@/components/Modals/EditItem/EditSectionModal.vue'
import DeleteItemModal from '@/components/Modals/DeleteItem/DeleteItemModal.vue'
import AddFieldModal from '@/components/Modals/AddItem/AddFieldModal.vue'

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
