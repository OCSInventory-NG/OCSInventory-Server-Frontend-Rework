<template>
	<div 
		id="draggable-component"
		class="table-responsive"
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
					<th v-if="canedit || candelete">
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
							{{ element[theader] }}
						</td>
						<td 
							v-if="candelete || canedit"
							class="section-table-btn"
						>
							<b-button-toolbar>
								<b-button-group class="mr-1">
									<EditMappingModal 
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
									<delete-item-modal 
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
import EditLdapModal from '@/components/Modals/EditItem/EditLdapModal.vue'
import EditMappingModal from '@/components/Modals/EditItem/EditMappingModal.vue'
import DeleteItemModal from '@/components/Modals/DeleteItem/DeleteItemModal.vue'

export default {
	name: "DraggableComponent",
	components: { 
		draggable,
		ActionListModal,
		EditLdapModal,
		EditMappingModal,
		DeleteItemModal
	},
	props: {
		rowdata: { type: Array, default: null },
		rowheader: { type: Array, default: null },
		translationkey: { type: String, default: "deployment." },
		apiroute: { type: String, default: "deployment/actions" },
		editcomponent: { type: String, default: "ActionListModal" },
		canedit: { type: Boolean, default: false },
		candelete: { type: Boolean, default: false },
		canaddmapping: { type: Boolean, default: false }
	},
	data() {
		return {
			rowdatas: [],
			header: {
				"Content-Type": "application/json;charset=utf-8",
				"Authorization": 'Token ' + localStorage.getItem('token_authentication')
			}		
		}
	},
	mounted() {
		this.rowdatas = this.rowdata
		this.rowdatas.sort((a,b) => a.priority - b.priority)
	},
	methods: {
		onEnd(event) {
			event.preventDefault

			this.rowdatas[event.newIndex].priority = event.newIndex + 1
			axios.patch(
				import.meta.env.VITE_APP_API_ROUTE+this.apiroute+"/"+this.rowdatas[event.newIndex].id+"/",
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
		}
	}
}
</script>