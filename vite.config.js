export default {
	build: {
		rollupOptions: {
			output: {
				assetFileNames: "[name].[ext]",
				entryFileNames: "[name].js",
			},
		},
	},
};
