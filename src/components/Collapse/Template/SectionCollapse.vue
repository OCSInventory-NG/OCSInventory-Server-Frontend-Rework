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
								<b-col><b>{{ $t('user.name') }} :</b> {{ value.name }}</b-col>
								<b-col>
									<b>{{ $t('template.retrival_method') }} :</b> 
									{{ $t('template.' + value.retrival_method) }}
								</b-col>
								<b-col>
									<b>{{ $t('template.retrival_output') }} :</b> 
									{{ $t('template.' + value.retrival_output) }}
								</b-col>
								<b-col>
									<b>{{ $t('template.target') }} :</b> 
									{{ value.target }}
								</b-col>
								<b-col>
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
								</b-col>
							</b-row>
							<div v-if="outputoptionoptions[value.retrival_output]">
								<b-row class="text-center">
									<b-col><b>{{ $t('template.retrieval_output_options') }}</b></b-col>
								</b-row>
								<b-row class="text-center">
									<b-col
										v-for="(option,optionname) in value.options"
										:key="optionname"
									>
										<p v-if="optionname in outputoptionoptions[value.retrival_output]">
											<b>{{ $t('template.' + optionname) }} :</b> {{ option }}
										</p>
									</b-col>
								</b-row>
							</div>
							<!--<br><br>-->
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
	data() {
		return {
			outputoptionoptions: {
				"TBLE": {
					"use_index": false,
					"remove_line": [],
					"override_line_used": null
				},
				"JSON": {
					"need_format": false,
					"submap": null,
					"is_list": false
				},
				"REGX": {
					"multiple": false,
					"separator": null
				}
			}
		}
	},
	methods: {
		reloadTemplate() {
			this.$emit('reloadTemplate')
		},
	}
}
</script>
