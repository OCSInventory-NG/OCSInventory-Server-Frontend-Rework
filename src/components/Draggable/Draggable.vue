<template>
	<div 
		id="draggable-component"
		class="table-responsive"
	>
		<table class="table table-vcenter table-striped table-hover">
			<thead>
				<tr>
					<th 
						v-for="theader in rowheader"
						:key="theader"
					>
						{{ $t('deployment.'+theader) }}
					</th>
					<th>{{ $t('generic.actions') }}</th>
				</tr>
			</thead>
			<draggable 
				v-model="rowdatas" 
				tag="tbody"
				@change="updatePriority"
			>
				<tr
					v-for="value in rowdatas"
					:key="value.id"
				>
					<td 
						v-for="theader in rowheader" 
						:key="theader"
					>
						{{ value[theader] }}
					</td>
					<td class="section-table-btn">
						<b-button-toolbar>
							<b-button-group class="mr-1">
								<EditActionListModal
									:id="value.id"
								/>
								<delete-item-modal 
									:id="value.id"
									:name="value.name"
									parameter="deployment/actions"
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
import DeleteItemModal from '@/components/Modals/DeleteItem/DeleteItemModal'

export default {
	name: "DraggableComponent",
	components: { draggable, EditActionListModal, DeleteItemModal },
	props: {
		rowdata: { type: Array, default: null },
		rowheader: { type: Array, default: null },
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

				Axios.patch(process.env.VUE_APP_API_ROUTE+"deployment/actions/"+action.id+"/", json, { headers: this.header })
					.catch(e => {
						console.log(e)
					})

				index += 1
				priority += 1
			});
		},
	}
}
</script>