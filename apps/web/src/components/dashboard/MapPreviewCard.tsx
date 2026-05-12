export const MapPreviewCard = () => (
  <div className="bg-surface-container-low border border-outline-variant rounded-xl shadow-sm overflow-hidden h-40 relative group cursor-pointer">
    <img
      alt="Route Map"
      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJjURWkpFuxl_tuyOLNN2MR0mOXho2aYJD6NjftgeeTf4luxJcHjL82hWc4p4SKvjhVISWnXQA-9EvLxyG_iNdO8o6UlvawCZJiwj4UVnWL9HTm5nxxKK1guUZD6lPXxueHTda4IgwyvQhWz3k6lydKJmcscTiu5oKnzCzc5qUdc93jh6Wq_liqUNnQOLIh5c8znfgLxgiknqTbf2S-N0nRaLk5oJq299se0X7NlhK55xFCGOGK_WbcX1FTyDBzkr04ZzKL5LFZhI"
      className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
    />
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
      <span className="bg-primary text-on-primary px-6 py-2 rounded-full font-bold text-sm shadow-lg">
        View Full Route
      </span>
    </div>
  </div>
);
