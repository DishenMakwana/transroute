# Memory — Frontend Architecture

## Key Components
- **`Header`**: Branding, Excel export trigger, and Add Transporter modal launcher.
- **`SearchBar`**: Origin/Destination inputs with swap, corridor shortcut chips, and direct `Filters` modal launcher.
- **`CitySearchInput`**: Autocomplete dropdown supporting both verified city hubs (`[CITY]`) and 6-digit postal PIN codes (`[PIN]`).
- **`FilterModal`**: Dark popup modal (`max-w-4xl`) with direct interactive pill button lists (no nested dropdowns) for Weight Unit, Box Size, Price Presets, Facility Type, Operating Status, and Sorting.
- **`TransportList` & `TransportCard`**: Results feed with active removable filter pills and rate cards (formatted 4 rate records per row).
- **`TransportModal` & `DeleteConfirmModal`**: Operator creation and deletion dialogues.
