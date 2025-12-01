<template>
	<div 
		id="draggable-component"
		class="table-responsive datatable-custom"
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
				:disabled="!canedit"
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
							{{ dateFields.includes(theader) ? element.last_update_formatted : element[theader] }}
						</td>
						<td 
							v-if="candelete || canedit"
							class="section-table-btn sticky-col right actions-col"
						>
							<b-button-toolbar>
								<b-button-group class="mr-1">
									<MappingModal 
										v-if="canaddmapping"
										:id="element.id"
									/>
									<!-- Edit button -->
									<component 
										:is="editcomponent"
										v-if="canedit"
										v-bind="{ id: element.id }"
										:update="true"
										@reloadDatatable="reloadDatatable"
									/>
									<DeleteItemModal 
										v-if="candelete"
										:id="element.id"
										:name="element.name"
										:parameter="apiroute"
										@reloadDatatable="reloadDatatable"
									/>
								</b-button-group>
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
import draggable from 'vuedraggable'
import axios from 'axios'
import ActionListModal from '@/components/Modals/Item/ActionListModal.vue'
import LdapModal from '@/components/Modals/Item/LdapModal.vue'
import FieldModal from '@/components/Modals/Item/FieldModal.vue'

export default {
	name: "DraggableComponent",
	components: { 
		draggable,
		ActionListModal,
		LdapModal,
		FieldModal
	},
	props: {
		rowdata: { type: Array, default: null },
		rowheader: { type: Array, default: null },
		translationkey: { type: String, default: "deployment." },
		apiroute: { type: String, default: "deployment/actions" },
		editcomponent: { type: String, default: "ActionListModal" },
		canedit: { type: Boolean, default: false },
		candelete: { type: Boolean, default: false },
		canaddmapping: { type: Boolean, default: false },
		field: { type: String, default: 'priority' }
	},
	data() {
		return {
			rowdatas: [],
			dateFields: ['last_update', 'last_updated', 'timestamp', 'date_created'],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}		
		}
	},
	watch: {
		'$i18n.locale': function() {
			this.updateDateFormat()
		}
	},
	mounted() {
		this.rowdatas = this.rowdata
		this.rowdatas.forEach(row => {
			for (const dateValue of this.dateFields) {
				if (row[dateValue]) {
					row.last_update_formatted = new Date(row[dateValue]).toLocaleString(this.$i18n.locale)
				}
			}
		});
		this.rowdatas.sort((a,b) => a[this.field] - b[this.field])
	},
	methods: {
		onEnd(event) {
			event.preventDefault

			this.rowdatas[event.newIndex][this.field] = event.newIndex + 1

			// Prevent 400 bad request
			if(this.rowdatas[event.newIndex].file) {
				delete this.rowdatas[event.newIndex].file
			}

			axios.patch(
				this.$config.BACKEND_API_ROUTE+this.apiroute+"/"+this.rowdatas[event.newIndex].id+"/",
				this.rowdatas[event.newIndex],
				{ headers: this.header }
			)
				.then(() => {
					this.$emit('reloadDatatable')
				})
				.catch(e => {
					console.log(e)
				})			
		},
		reloadDatatable() {
			this.$emit('reloadDatatable')
		},
		updateDateFormat(){
			this.rowdatas.forEach(row => {
				for (const dateValue of this.dateFields) {
					if (row[dateValue]) {
						row.last_update_formatted = new Date(row[dateValue]).toLocaleString(this.$i18n.locale)
					}
				}
			});
		}
	}
}
</script>