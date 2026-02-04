<template>
	<div id="navbarMenu" class="collapse navbar-collapse" :class="showmobilemenu ? 'show' : ''">
		<div class="d-flex flex-column flex-md-row flex-fill align-items-stretch align-items-md-center">
			<BNav class="navbar-nav">
				<NavLink
					v-for="item in menu"
					:key="item.index"
					:is-active="activeItem"
					:header="$t(item.headerKey)"
					:column-dividers="item.columnDividers?.map(d => ({ header: $t(d.headerKey), identifier: d.identifier }))"
					:children-links="item.children?.map(c => ({ 
						header: $t(c.headerKey), link: c.link, route: c.route, column: c.column
					}))"
					:link="item.link"
					:icon-name="item.icon"
					:index="item.index"
					:is-header="item.type === 'header'"
				/>
			</BNav>
		</div>
	</div>
</template>

<script>
import { menuStore } from "@/menu/menuStore"

export default {
	name: "Sidebar",
	props: { showmobilemenu: { type: Boolean, default: false } },
	computed: {
		menu() {
			return menuStore.items
		},
		activeItem() {
			return this.$route.name
		}
	}
}
</script>