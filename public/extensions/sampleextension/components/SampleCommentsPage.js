// Example: a page with its own menu tab.
// Wired to a route and a menu entry in plugin.js. Reuses the core
// PageHeader and Datatable (api.getComponent)
export function createComponent(api) {
	const PageHeader = api.getComponent("PageHeader");
	const Datatable = api.getComponent("Datatable");

	return {
		name: "SampleCommentsPage",
		components: { PageHeader, Datatable },

		data() {
			return {
				rowdata: [],
				rowheader: ["asset", "message", "created_at", "actions"],
			};
		},

		methods: {
			async load() {
				const { data } = await api.http.get("/sampleextension/comments/");
				const results = data.results || data;
				this.rowdata = results.map((r) => ({ ...r, asset: { id: r.asset, name: r.asset_name } }));
			},

			async deleteComment(id) {
				await api.http.delete(`/sampleextension/comments/${id}/`);
				await this.load();
			},
		},

		mounted() {
			this.load();
		},

		template: `
            <div class="container-xl">
                <PageHeader :page-title="$t('sampleextension.title')" />
                <div class="page-body">
                    <div class="card">
                        <div class="card-body">
                            <Datatable
                                :rowdata="rowdata"
                                :rowheader="rowheader"
                                title="sampleextension/comments"
                                translationkey="sampleextension."
                                is-sticky
                                canaccesspackagedetails
                                @reload-datatable="load"
                            >
                                <template v-slot:cell(firstActions)="slotProps">
                                    <button type="button" class="btn btn-ghost-danger" @click="deleteComment(slotProps.row.item.id)">
                                        <font-awesome-icon :icon="['fas', 'trash']" />
                                    </button>
                                </template>
                            </Datatable>
                        </div>
                    </div>
                </div>
            </div>
        `,
	};
}
