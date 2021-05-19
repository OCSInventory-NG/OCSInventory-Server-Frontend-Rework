<template>
	<li 
		v-if="!childrenLinks && isHeader" 
		:class="{headerLink: true, className}"
	>
		<router-link 
			:to="link" 
			class="sidebar-link"
		>
			<span class="icon">
				<font-awesome-icon :icon="['fas', iconName]"/>
			</span>
			{{ header }} 
			<sup 
				v-if="label" 
				:class="'text-' + labelColor" 
				class="headerLabel"
			>
				{{ label }}
			</sup>
			<b-badge 
				v-if="badge" 
				variant="primary" 
				pill
			>
				{{ badge }}
			</b-badge>
		</router-link>
	</li>
	<li 
		v-else-if="childrenLinks" 
		:class="{headerLink: true, className}"
	>
		<div @click="() => togglePanelCollapse(link)">
			<router-link 
				:to="link" 
				event="" 
				class="d-flex sidebar-link"
			>
				<span class="icon">
					<font-awesome-icon :icon="['fas', iconName]"/>
				</span>
				{{ header }} 
				<sup 
					v-if="label" 
					:class="'text-' + labelColor" 
					class="ml-1 headerLabel"
				>
					{{ label }}
				</sup>
				<div :class="{caretWrapper: true, carretActive: isActive}">
					<font-awesome-icon :icon="['fas', 'angle-right']"/>
				</div>
			</router-link>
		</div>
		<b-collapse 
			:id="'collapse' + index" 
			:visible="isActive"
		>
			<ul class="sub-menu">
				<NavLink 
					v-for="childLink in childrenLinks"
					:active-item="activeItem"
					:header="childLink.header"
					:index="childLink.index"
					:link="childLink.link"
					:children-links="childLink.childrenLinks"
					:key="childLink.link"
				/>
			</ul>
		</b-collapse>
	</li>
	<li v-else>
		<router-link :to="index !== 'menu' && link">
			{{ header }} 
			<sup 
				v-if="label" 
				:class="'text-' + labelColor" 
				class="headerLabel"
			>
				{{ label }}
			</sup>
		</router-link>
	</li>
</template>

<script>
import { mapActions } from 'vuex';

export default {
	name: 'NavLink',
	props: {
		badge: { type: String, default: '' },
		header: { type: String, default: '' },
		iconName: { type: String, default: '' },
		c: { type: String, default: '' },
		headerLink: { type: String, default: '' },
		link: { type: String, default: '' },
		childrenLinks: { type: Array, default: null },
		className: { type: String, default: '' },
		isHeader: { type: Boolean, default: false },
		deep: { type: Number, default: 0 },
		activeItem: { type: String, default: '' },
		label: { type: String, default: '' },
		labelColor: { type: String, default: 'warning' },
		index: { type: String, default: '' },
	},
	data() {
		return {
			headerLinkWasClicked: true,
		};
	},
	computed: {
		isActive() {
			return (this.activeItem && this.activeItem.includes(this.index) && this.headerLinkWasClicked);
		},
	},
	methods: {
		...mapActions('layout', ['changeSidebarActive']),
		togglePanelCollapse(link) {
			this.changeSidebarActive(link);
			this.headerLinkWasClicked = !this.headerLinkWasClicked || !this.activeItem.includes(this.index);
		},
	},
};
</script>
