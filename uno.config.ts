import extractorSvelte from '@unocss/extractor-svelte';
import { defineConfig, presetWind3 } from 'unocss';

export default defineConfig({
	presets: [presetWind3()],
	extractors: [extractorSvelte()],
	safelist: [
		'bg-zinc-950',
		'b-zinc-950',
		'hover:bg-zinc-800',
		'bg-red-600',
		'b-red-600',
		'hover:bg-red-700',
		'bg-amber-500',
		'b-amber-500',
		'hover:bg-amber-400',
		'text-white',
		'text-zinc-950'
	]
});
