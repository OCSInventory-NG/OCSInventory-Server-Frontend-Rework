<template>
	<!-- Menu without children item -->
	<b-nav-item 
		v-if="!childrenLinks && isHeader"
		:href="link" 
		class="nav-item"
	>
		<span class="nav-link-icon d-md-none d-lg-inline-block">
			<font-awesome-layers 
				style="font-size: 1.7em;"
				class="icon-group"
			>
				<font-awesome-icon 
					icon="circle" 
					style="color: transparent; font-size: 1.4em;"
					class="icon"
				/>
				<font-awesome-icon 
					:icon="['fas', iconName]"
					style="font-size: 1.2em;"
					transform="shrink-6"
				/>
			</font-awesome-layers>
		</span>
		<span class="nav-link-title">
			{{ header }} 
		</span>
	</b-nav-item>

	<!-- Menu with children items -->
	<b-nav-item-dropdown 
		v-else-if="childrenLinks"
		id="my-nav-dropdown"
		class="nav-item dropdown"
		no-caret
		right
	>
		<template slot="button-content">
			<span class="nav-link-icon d-md-none d-lg-inline-block">
				<font-awesome-layers 
					style="font-size: 1.7em;"
					class="icon-group"
				>
					<font-awesome-icon 
						icon="circle" 
						style="color: transparent; font-size: 1.4em;"
						class="icon"
					/>
					<font-awesome-icon 
						:icon="['fas', iconName]"
						style="font-size: 1.2em;"
						transform="shrink-6"
					/>
				</font-awesome-layers>
			</span>
			<span class="nav-link-title">
				{{ header }} 
			</span>
		</template>
		<div
			v-for="childLink in childrenLinks"
			:key="childLink.link"
		>
			<b-dropdown-header
				v-if="childLink.main"
				:href="childLink.link"
				class="dropdown-header"
			>
				{{ childLink.header }}
			</b-dropdown-header>
			<b-dropdown-item
				v-else
				:href="childLink.link"
			>
				{{ childLink.header }}
			</b-dropdown-item>
		</div>
	</b-nav-item-dropdown>
</template>

<script>
export default {
	name: 'NavLink',
	props: {
		header: { type: String, default: '' },
		link: { type: String, default: '' },
		main: { type: String, default: null },
		childrenLinks: { type: Array, default: null },
		isHeader: { type: Boolean, default: false },
		iconName: { type: String, default: '' },
		index: { type: String, default: '' },
		activeItem: { type: String, default: '' },
	},
	data() {
		return {
			headerlinkWasClicked: true,
		};
	},
	computed: {
		isActive() {
			return (this.activeItem && this.activeItem.includes(this.index) && this.headerlinkWasClicked);
		},
	}
}
</script>
