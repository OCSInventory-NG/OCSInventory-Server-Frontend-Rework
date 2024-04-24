<template>
	<div id="FieldCollapse">
		<b-card
			no-body
			class="mb-1"
		>
			<div class="table-responsive">
				<table class="table table-vcenter">
					<thead>
						<tr>
							<th style="text-align: center;">
								{{ $t('template.fieldslist') }}
							</th>
						</tr>
					</thead>
				</table>
				<table class="table table-vcenter">
					<thead>
						<tr>
							<th>{{ $t('user.name') }}</th>
							<th>{{ $t('template.retrival_value') }}</th>
							<th>{{ $t('template.override_target') }}</th>
							<th>{{ $t('template.retrival_method') }}</th>
							<th>{{ $t('template.new_target') }}</th>
							<th>{{ $t('template.retrival_output') }}</th>
							<th>{{ $t('template.retrieval_output_options') }}</th>
							<th class="section-table-title">
								{{ $t('generic.actions') }}
							</th>
						</tr>
					</thead>
					<tbody>
						<tr
							v-for="(value, key) in rowfielddata"
							:id="'field-'+value.id"
							:key="key"
						>
							<td>{{ value.name }}</td>
							<td>{{ value.retrival_value }}</td>
							<td>{{ value.override_target }}</td>
							<td>{{ (value.retrival_output != null) ? $t('template.' + value.retrival_method) : null }}</td>
							<td>{{ value.new_target }}</td>
							<td>{{ (value.retrival_output != null) ? $t('template.' + value.retrival_output) : null }}</td>
							<td>
								<p
									v-for="(option, optioname) in value.options"
									:key="optioname"
									class="section-table-options"
								>
									{{ $t('template.' + optioname) }} : {{ option }}
								</p>
							</td>
							<td class="section-table-btn">
								<b-button-toolbar>
									<b-button-group class="mr-1">
										<FieldModal
											:rowfielddata="value"
											:id="value.id"
											:section="value.section"
											:update="true"
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
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</b-card>
	</div>
</template>

<script>
export default {
	name: "FieldCollapse",
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