<template>
	<div class="sidebar-wrapper">
		<nav
			:class="{sidebar: true, sidebarStatic, sidebarOpened}"
			@mouseenter="sidebarMouseEnter"
			@mouseleave="sidebarMouseLeave"
		>
			<header class="logo">
				<router-link to="/app/dashboard"><span class="primary-word">OCS</span> <span class="secondary-word"> Inventory</span></router-link>
			</header>
			<ul class="nav">
				<NavLink
					:activeItem="activeItem"
					header="Dashboard"
					link="/app/dashboard"
					iconName="flaticon-home"
					index="dashboard"
					isHeader
				/>
				<NavLink
					:activeItem="activeItem"
					header="All computers"
					link="/app/all_computers"
					iconName="flaticon-network"
					index="all_computers"
					isHeader
				/>
				<NavLink
					:activeItem="activeItem"
					header="Inventory"
					link="/app/inventory"
					iconName="flaticon-network"
					index="inventory"
					:childrenLinks="[
						{ header: 'Multicriteria', link: '/app/inventory/multicriteria' },
						{ header: 'All softwares', link: '/app/inventory/all_softwares' },
						{ header: 'IpDiscover', link: '/app/inventory/ipdiscover' },
						{ header: 'SNMP', link: '/app/inventory/snmp_inventory' },
						{ header: 'Groups', link: '/app/inventory/groups' },
						{ header: 'CVE Reporting', link: '/app/inventory/cve_reporting' },
						{ header: 'Web app Inventory', link: '/app/inventory/web_app_inventory' },
						{ header: 'Computers per TAG', link: '/app/inventory/computers_per_tag' },
					]"
				/>
				<NavLink
					:activeItem="activeItem"
					header="Deployment"
					link="/app/deployment"
					iconName="flaticon-network"
					index="deployment"
					:childrenLinks="[
						{ header: 'Build', link: '/app/deployment/build' },
						{ header: 'Activate', link: '/app/deployment/activate' },
						{ header: 'Assignement rules', link: '/app/deployment/assignement_rules' },
					]"
				/>
				<NavLink
					:activeItem="activeItem"
					header="Configuration"
					link="/app/configuration"
					iconName="flaticon-network"
					index="configuration"
					:childrenLinks="[
						{ header: 'General configuration', link: '/app/configuration/general_configuration' },
						{ header: 'SNMP configuration', link: '/app/configuration/snmp_configuration' },
						{ header: 'Notifications', link: '/app/configuration/notifications' },
						{ header: 'Users', link: '/app/configuration/users' },
						{ header: 'Blacklist', link: '/app/configuration/blacklist' },
						{ header: 'Label file configuration', link: '/app/configuration/label_file_configuration' },
						{ header: 'Store agents', link: '/app/configuration/store_agents' },
					]"
				/>
				<NavLink
					:activeItem="activeItem"
					header="Manage"
					link="/app/manage"
					iconName="flaticon-network"
					index="manage"
					:childrenLinks="[
						{ header: 'Assets categories', link: '/app/manage/assets_categories' },
						{ header: 'Software categories', link: '/app/manage/software_categories' },
						{ header: 'Dictionary', link: '/app/manage/dictionary' },
						{ header: 'Administrative data', link: '/app/manage/administrative_data' },
						{ header: 'Network scan', link: '/app/manage/network_scan' },
						{ header: 'Registry', link: '/app/manage/registry' },
						{ header: 'Saved searches', link: '/app/manage/saved_searches' },
						{ header: 'Duplicates', link: '/app/manage/duplicates' },
						{ header: 'Local import', link: '/app/manage/local_import' },
					]"
				/>
				<NavLink
					:activeItem="activeItem"
					header="Extensions"
					link="/app/extensions"
					iconName="flaticon-network"
					index="extensions"
					:childrenLinks="[
						{ header: 'Extensions manager', link: '/app/extensions/extensions_manager' },
					]"
				/>
				<NavLink
					:activeItem="activeItem"
					header="Informations"
					link="/app/informations"
					iconName="flaticon-network"
					index="informations"
					:childrenLinks="[
						{ header: 'Log visualization', link: '/app/informations/log_visualization' },
						{ header: 'Server information', link: '/app/informations/server_information' },
						{ header: 'CVE history', link: '/app/informations/cve_history' },
					]"
				/>
				<NavLink
					:activeItem="activeItem"
					header="Help"
					link="/app/help"
					iconName="flaticon-network"
					index="help"
					:childrenLinks="[
						{ header: 'Wiki', link: '/app/help/wiki' },
						{ header: 'IRC', link: '/app/help/irc' },
						{ header: 'Q&A', link: '/app/help/qa' },
						{ header: 'OCS Professional', link: '/app/help/ocs_professional' },
					]"
				/>
			</ul>
		</nav>
	</div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import isScreen from '@/core/screenHelper';
import NavLink from './NavLink/NavLink';

export default {
  name: 'Sidebar',
  components: { NavLink },
  methods: {
    ...mapActions('layout', ['changeSidebarActive', 'switchSidebar']),
    setActiveByRoute() {
      const paths = this.$route.fullPath.split('/');
      paths.pop();
      this.changeSidebarActive(paths.join('/'));
    },
    sidebarMouseEnter() {
      if (!this.sidebarStatic && (isScreen('lg') || isScreen('xl'))) {
        this.switchSidebar(false);
        this.setActiveByRoute();
      }
    },
    sidebarMouseLeave() {
      if (!this.sidebarStatic && (isScreen('lg') || isScreen('xl'))) {
        this.switchSidebar(true);
        this.changeSidebarActive(null);
      }
    },
  },
  created() {
    this.setActiveByRoute();
  },
  computed: {
    ...mapState('layout', {
      sidebarStatic: state => state.sidebarStatic,
      sidebarOpened: state => !state.sidebarClose,
      activeItem: state => state.sidebarActiveElement,
    }),
  },
};
</script>

<!-- Sidebar styles should be scoped -->
<style src="./Sidebar.scss" lang="scss" scoped/>
