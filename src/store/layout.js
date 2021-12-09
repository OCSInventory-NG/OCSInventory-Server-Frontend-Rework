import isScreen from '@/core/screenHelper';

export default {
	namespaced: true,
	state: {
		sidebarclose: false,
		sidebarstatic: false,
		sidebarActiveElement: null,
	},
	mutations: {
		toggleSidebar(state) {
			const nextState = !state.sidebarstatic;

			localStorage.sidebarstatic = nextState;
			state.sidebarstatic = nextState;

			if (!nextState && (isScreen('lg') || isScreen('xl'))) {
				state.sidebarclose = true;
			}
		},
		switchSidebar(state, value) {
			if (value) {
				state.sidebarclose = value;
			} else {
				state.sidebarclose = !state.sidebarclose;
			}
		},
		handleSwipe(state, e) {
			if ('ontouchstart' in window) {
				if (e.direction === 4) {
					state.sidebarclose = false;
				}

				if (e.direction === 2 && !state.sidebarclose) {
					state.sidebarclose = true;
				}
			}
		},
		changeSidebarActive(state, index) {
			state.sidebarActiveElement = index;
		},
	},
	actions: {
		toggleSidebar({ commit }) {
			commit('toggleSidebar');
		},
		switchSidebar({ commit }, value) {
			commit('switchSidebar', value);
		},
		handleSwipe({ commit }, e) {
			commit('handleSwipe', e);
		},
		changeSidebarActive({ commit }, index) {
			commit('changeSidebarActive', index);
		},
	},
};
