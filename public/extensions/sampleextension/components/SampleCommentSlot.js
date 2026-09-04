// Example: injecting into an existing core page.
// Registered on a slot that Detail.vue already renders (see plugin.js),
// so an extension can add a feature to the asset page without touching it.
export function createComponent(api) {
	return {
		name: "SampleCommentSlot",
		props: { assetId: { type: [String, Number], default: null } },

		data() {
			return { comments: [], message: "" };
		},

		computed: {
			// Example: gating a UI element by permission. Checks against the
			// user's own permission list (Django's app_action_model format).
			canDelete() {
				return api.hasPermissions(["sampleextension_delete_samplecomment"]);
			},
		},

		methods: {
			async load() {
				const { data } = await api.http.get("/sampleextension/comments/", {
					params: { asset: this.assetId },
				});
				this.comments = data.results || data;
			},

			async addComment(event) {
				event.preventDefault();
				await api.http.post("/sampleextension/comments/", { asset: this.assetId, message: this.message });
				this.message = "";
				await this.load();
			},

			async deleteComment(id) {
				await api.http.delete(`/sampleextension/comments/${id}/`);
				await this.load();
			},
		},

		// assetId changes when navigating between two assets' pages without a
		// full reload, so reload the list whenever it does.
		watch: { assetId: { immediate: true, handler: "load" } },

		template: `
            <div class="card mt-3">
                <div class="card-header">
                    <h3 class="card-title">{{ $t('sampleextension.comments_title') }}</h3>
                </div>
                <div class="card-body">
                    <ul class="list-group mb-3">
                        <li
                            v-for="comment in comments"
                            :key="comment.id"
                            class="list-group-item d-flex justify-content-between align-items-start"
                        >
                            <div>{{ comment.message }}</div>
                            <button v-if="canDelete" type="button" class="btn btn-ghost-danger btn-sm" @click="deleteComment(comment.id)">
                                <font-awesome-icon :icon="['fas', 'trash']" />
                            </button>
                        </li>
                    </ul>

                    <form @submit="addComment" class="row g-2 align-items-end">
                        <div class="col-md-10">
                            <input class="form-control" v-model="message" type="text" required />
                        </div>
                        <div class="col-md-2">
                            <button type="submit" class="btn btn-primary">{{ $t('sampleextension.add_comment') }}</button>
                        </div>
                    </form>
                </div>
            </div>
        `,
	};
}
