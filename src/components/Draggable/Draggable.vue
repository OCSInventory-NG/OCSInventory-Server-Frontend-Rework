<template>
	<div 
		id="draggable-component"
		class="table-responsive datatable-custom"
		:class="{ 'sticky-table': isSticky }"
	>
		<table class="table table-vcenter table-striped table-hover border">
			<thead>
				<tr>
					<th />
					<th 
						v-for="theader in rowheader"
						:key="theader"
					>
						{{ ($te(translationkey+theader)) ? $t(translationkey+theader) : theader }}
					</th>
					<th
						v-if="canedit || candelete"
						class="sticky-col right actions-col"
					>
						{{ $t('generic.actions') }}
					</th>
				</tr>
			</thead>
			<draggable 
				v-if="rowdatas.length > 0"
				v-model="rowdatas" 
				item-key="id"
				:disabled="!canedit || viewOnly"
				tag="tbody"
				handle=".handle"
				@end="onEnd"
			>
				<template #item="{ element }">
					<tr>
						<td>
							<font-awesome-icon 
								:icon="['fas', 'bars']"
								class="draggable-icon handle"
							/>
						</td>
						<td 
							v-for="theader in rowheader" 
							:key="theader"
						>
							<span v-if="isSensitiveField(theader)">
								*********
							</span>
							<span v-else>
								{{ dateFields.includes(theader) ? element.last_update_formatted : element[theader] }}
							</span>
						</td>
						<td 
							v-if="candelete || canedit"
							class="section-table-btn sticky-col right actions-col"
						>
							<b-button-toolbar>
								<div class="d-flex flex-row flex-nowrap align-items-center gap-1 mx-1">	
									<MappingModal 
										v-if="canaddmapping"
										:id="element.id"
									/>
									<!-- Edit button -->
									<button 
										v-if="canviewruleaction"
										:title="$t('rule.managerule')"
										class="btn btn-ghost-orange ocs-auto"
										@click="goToEditRule(element.id)"
									>
										<font-awesome-icon 
											:icon="['fas', 'gear']"
											size="1x"
										/>
									</button>
									<component 
										:is="editcomponent"
										v-if="canedit"
										v-bind="{ id: element.id }"
										:update="true"
										:view-only="viewOnly"
										@reload-datatable="reloadDatatable"
									/>
									<DeleteItemModal 
										v-if="candelete"
										:id="element.id"
										:name="element.name"
										:parameter="apiroute"
										@reload-datatable="reloadDatatable"
									/>
								</div>
							</b-button-toolbar>
						</td>
					</tr>
				</template>
			</draggable>
			<tbody v-else>
				<tr>
					<td>
						{{ $t("generic.no_data") }}
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script>
export default {
	name: "DraggableComponent",
	props: {
		rowdata: { type: [Array, Object], default: () => [] },
		rowheader: { type: [Array, Object], default: () => [] },
		translationkey: { type: String, default: "deployment." },
		apiroute: { type: String, default: "deployment/actions" },
		editcomponent: { type: String, default: "ActionListModal" },
		canedit: { type: Boolean, default: false },
		candelete: { type: Boolean, default: false },
		canviewruleaction: { type: Boolean, default: false },
		canaddmapping: { type: Boolean, default: false },
		field: { type: String, default: 'priority' },
		viewOnly: { type: Boolean, default: false },
		// Table format
		isSticky: { type: Boolean, default: false },
	},
	data() {
		return {
			rowdatas: [],
			dateFields: ['last_update', 'last_updated', 'timestamp', 'date_created'],	
		}
	},
	watch: {
		'$i18n.locale': function() {
			this.updateDateFormat()
		}
	},
	mounted() {
		this.rowdatas = Array.isArray(this.rowdata) ? this.rowdata.map(r => ({ ...r })) : []

		this.updateDateFormat()
		this.rowdatas.sort((a, b) => (a?.[this.field] ?? 0) - (b?.[this.field] ?? 0))
	},

	methods: {
		async onEnd(event) {
			event?.preventDefault?.()

			try {
				const idx = event?.newIndex
				if (idx == null || !this.rowdatas?.[idx]) return

				this.rowdatas[idx][this.field] = idx + 1

				const payload = { ...this.rowdatas[idx] }
				if (payload.file) delete payload.file
				if (payload.trigger) delete payload.trigger
				await this.$api.generic.patch(
					`${this.apiroute}/${payload.id}/`,
					payload
				)

				this.$emit("reloadDatatable")
			} catch (e) {
				console.log(e)
			}
		},

		reloadDatatable() {
			this.$emit("reloadDatatable")
		},

		isSensitiveField(field) {
			return field.toUpperCase().includes("PASSWORD") || field.toUpperCase().includes("SECRET")
		},

		updateDateFormat() {
			for (const row of this.rowdatas || []) {
				for (const dateValue of this.dateFields || []) {
					if (row?.[dateValue]) {
						row.last_update_formatted = new Date(row[dateValue]).toLocaleString(this.$i18n.locale)
						break
					}
				}
			}
		},
		goToEditRule(id) {
			this.$router.push('/configurations/rules/'+id);
		},
	}
}
</script>