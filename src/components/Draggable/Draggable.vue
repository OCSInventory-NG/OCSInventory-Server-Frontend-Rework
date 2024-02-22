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
				v-model="rowdatas" 
				:disabled="!canedit"
				tag="tbody"
				@change="updatePriority"
			>
				<tr
					v-for="value in rowdatas"
					:key="value.id"
				>
					<td>
						<font-awesome-icon 
							:icon="['fas', 'bars']"
							class="draggable-icon"
						/>
					</td>
					<td 
						v-for="theader in rowheader" 
						:key="theader"
					>
						{{ value[theader] }}
					</td>
					<td 
						v-if="candelete || canedit"
						class="section-table-btn"
					>
						<b-button-toolbar>
							<b-button-group class="mr-1">
								<EditMappingModal 
									:id="value.id"
								/>
								<!-- Edit button -->
								<component 
									:is="editcomponent"
									v-if="canedit"
									v-bind="{ id: value.id }"
									@reloadDatatable="reloadDatatable"
								/>
								<delete-item-modal 
									v-if="candelete"
									:id="value.id"
									:name="value.name"
									:parameter="apiroute"
									@reloadDatatable="reloadDatatable"
								/>
							</b-button-group>
						</b-button-toolbar>
					</td>
				</tr>
			</draggable>
		</table>
	</div>
</template>

<script>
import draggable from 'vuedraggable'
import Axios from 'axios'
import EditActionListModal from '@/components/Modals/EditItem/EditActionListModal'
import EditLdapModal from '@/components/Modals/EditItem/EditLdapModal'
import EditMappingModal from '@/components/Modals/EditItem/EditMappingModal'
import DeleteItemModal from '@/components/Modals/DeleteItem/DeleteItemModal'

export default {
	name: "DraggableComponent",
	components: { 
		draggable,
		EditActionListModal,
		EditLdapModal,
		EditMappingModal,
		DeleteItemModal
	},
	props: {
		rowdata: { type: Array, default: null },
		rowheader: { type: Array, default: null },
		translationkey: { type: String, default: "deployment." },
		apiroute: { type: String, default: "deployment/actions" },
		editcomponent: { type: String, default: "EditActionListModal" },
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
		updatePriority(event) {
			event.preventDefault

			var priority = 1
			var index = 0

			this.rowdatas.forEach(action => {
				this.rowdatas[index].priority = priority

				var json = {
					priority: priority
				}

				Axios.patch(process.env.VUE_APP_API_ROUTE+this.apiroute+"/"+action.id+"/", json, { headers: this.header })
					.catch(e => {
						console.log(e)
					})

				index += 1
				priority += 1
			});
		},
		reloadDatatable() {
			this.$emit('reloadDatatable')
		}
	}
}
</script>