<template>
	<div id="IpdiscoverCollapse">
		<div
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
						v-b-toggle="'netgroup-'+groupid"
						block
						class="section-btn"
					>
						{{ groupname }}
					</b-button>
				</b-card-header>

				<b-collapse
					:id="'netgroup-'+groupid"
					accordion="my-accordion"
					role="tabpanel"
				>
					<b-card-body>
						<b-card-text>
							<Datatable
								id="networks-datatable"
								:rowdata="rowdata"
								:rowheader="rowheader"
								title="networks"
								:candelete="candelete"
								:canedit="canedit"
								:canaccesschild="canaccesschild"
								editcomponent="EditNetworkModal"
								translationkey="network."
								@reloadDatatable="reloadDatatable"
							/>
						</b-card-text>
					</b-card-body>
				</b-collapse>
			</b-card>
		</div>
	</div>
</template>

<script>
import Datatable from '@/components/Datatable/Datatable';

export default {
	name: 'IpdiscoverCollapse',
	components: { Datatable },
	props: {
		groupname: { type: String, default: '' },
		groupdescription: { type: String, default: '' },
		groupid: { type: Number, default: null },
		rowdata: { type: Array, default: null },
		rowheader: { type: Array, default: null },
		canedit: { type: Boolean, default: false },
		candelete: { type: Boolean, default: false },
		canaccesschild: { type: Boolean, default: false },
	},
	methods: {
		reloadDatatable() {
			this.$emit('reloadDatatable')
		}
	}
}
</script>
