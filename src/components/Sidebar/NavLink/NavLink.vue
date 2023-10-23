<template>
	<!-- Menu without children item -->
	<router-link
		v-if="!childrenLinks && isHeader"
		:to="link" 
		class="nav-item"
		:class="{ active: isActive == header }"
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
	</router-link>

	<!-- Menu with children items -->
	<b-nav-item-dropdown 
		v-else-if="childrenLinks"
		id="my-nav-dropdown"
		class="nav-item dropdown"
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
		<div class="dropdown-menu-columns">
			<div
				v-for="columnDivider in columnDividers"
				:key="columnDivider.identifier"
				class="dropdown-menu-column"
			>
				<b-dropdown-header
					class="dropdown-header"
				>
					{{ columnDivider.header }}
				</b-dropdown-header>
				<div
					v-for="childLink in childrenLinks"
					:key="childLink.link"
				>
					<router-link
						v-if="childLink.column == columnDivider.identifier"
						:to="childLink.link"
						class="nav-link-title"
						:class="{ active: isActive == childLink.route }"
					>
						{{ childLink.header }}
					</router-link>
				</div>
			</div>
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
		columnDividers: { type: Array, default: null },
		isHeader: { type: Boolean, default: false },
		iconName: { type: String, default: '' },
		index: { type: String, default: '' },
		isActive: { type: String, default: '' }
	}
}
</script>
