<template>
	<div id="FieldCollapse">
		<b-card
			no-body
			class="mb-1"
		>
			<b-card-header
				header-tag="header"
				class="p-1 field-header"
				role="tab"
			>
				{{ $t('fieldslist') }}
			</b-card-header>
			<b-card-body
				v-for="(value, key) in rowfielddata"
				:id="'field-'+value.id"
				:key="key"
			>
				<b-card-text>
					<b-row>
						<b-col 
							cols="3" 
							align="left"
						>
							<b>{{ $t('name') }} :</b> {{ value.name }}
						</b-col>
						<b-col 
							cols="3" 
							align="left"
						>
							<b>{{ $t('retrival_value') }} :</b> {{ value.retrival_value }}
						</b-col>
						<b-col 
							cols="2" 
							align="left"
						>
							<b>{{ $t('override_target') }} :</b> {{ value.override_target }}
						</b-col>
						<b-col cols="2" />
						<b-col>
							<b-button-toolbar>
								<b-button-group class="mr-1">
									<EditFieldModal
										:rowfielddata="value"
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
					<b-row v-if="value.override_target == true">
						<b-col
							cols="2" 
							align="left"
						>
							<b>{{ $t('retrival_method') }} :</b> {{ $t(value.retrival_method) }}
						</b-col>
						<b-col
							cols="2" 
							align="left"
						>
							<b>{{ $t('new_target') }} :</b> {{ $t(value.new_target) }}
						</b-col>
						<b-col
							cols="2" 
							align="left"
						>
							<b>{{ $t('retrival_output') }} :</b> {{ $t(value.retrival_output) }}
						</b-col>						
						<b-col 
							v-for="(option, optioname) in value.options"
							:key="optioname"
							cols="2" 
							align="left"
						>
							<b>{{ $t(optioname) }} :</b> {{ option }}
						</b-col>
					</b-row>
				</b-card-text>
			</b-card-body>
		</b-card>
	</div>
</template>

<script>
import EditFieldModal from '@/components/Modals/EditItem/EditFieldModal'
import DeleteItemModal from '@/components/Modals/DeleteItem/DeleteItemModal'

export default {
	name: "FieldCollapse",
	components: {
		EditFieldModal,
		DeleteItemModal
	},
	props: {
		rowfielddata: { type: Array, default: null },
	},
	data() {
		return {
			idcollapse: [],
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