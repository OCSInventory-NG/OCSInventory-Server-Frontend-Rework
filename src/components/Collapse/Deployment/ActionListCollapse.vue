<template>
	<div id="ActionListCollapse">
		<div
			v-for="(value, key) in rowactiondata"
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
						v-b-toggle="'action-'+value.id"
						block
						variant="info"
						class="section-btn"
					>
						{{ value.name }}
					</b-button>
				</b-card-header>

				<b-collapse
					:id="'action-'+value.id"
					accordion="my-accordion"
					role="tabpanel"
				>
					<b-card-body>
						<b-card-text>
							<div class="table-responsive">
								<table class="table table-vcenter">
									<thead>
										<tr>
											<th>{{ $t('deployment.name') }}</th>
											<th>{{ $t('deployment.date_created') }}</th>
											<th>{{ $t('deployment.action_type') }}</th>
											<th>{{ $t('deployment.command') }}</th>
											<th>{{ $t('deployment.file') }}</th>
											<th class="section-table-title">
												{{ $t('generic.actions') }}
											</th>
										</tr>
									</thead>
									<tbody>
										<tr>
											<td>{{ value.name }}</td>
											<td>{{ value.date_created }}</td>
											<td>{{ $t('deployment.'+value.action_type) }}</td>
											<td>{{ value.command }}</td>
											<td>{{ value.file }}</td>
											<td class="section-table-btn">
												<b-button-toolbar>
													<b-button-group class="mr-1">
														<delete-item-modal 
															:id="value.id"
															:name="value.name"
															parameter="deployment/actions"
															@reloadPackage="reloadPackage"
														/>
													</b-button-group>
												</b-button-toolbar>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</b-card-text>
					</b-card-body>
				</b-collapse>
			</b-card>
		</div>
	</div>
</template>

<script>
import DeleteItemModal from '@/components/Modals/DeleteItem/DeleteItemModal'

export default {
	name: 'ActionListCollapse',
	components: {
		DeleteItemModal
	},
	props: {
		rowactiondata: { type: Array, default: null },
	},
	methods: {
		reloadPackage() {
			this.$emit('reloadPackage')
		},
	}
}
</script>
