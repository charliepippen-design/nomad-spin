import { defineMcp } from "@lovable.dev/mcp-js";
import searchCities from "./tools/search-cities";
import getCity from "./tools/get-city";
import spinDestination from "./tools/spin-destination";

export default defineMcp({
  name: "nomad-spin-mcp",
  title: "Digital Nomad Spin",
  version: "0.1.0",
  instructions:
    "Tools for the Digital Nomad Spin app. Use `search_cities` to filter the 1,200+ city database, `get_city` for a full destination profile, and `spin_destination` to run the match-scoring engine against a nomad's budget, internet, and safety preferences.",
  tools: [searchCities, getCity, spinDestination],
});
