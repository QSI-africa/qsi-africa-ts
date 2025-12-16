// server/prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

// --- Pilot Project Data with Expanded View ---
const pilots = [
  // ========== FRAMEWORKS ==========
  {
    key: "udmp",
    title: "Urban Decongestion & Mobility Planning (UDMP)",
    subtext: "Intelligent mobility for a coherent continent.",
    shortDescription:
      "UDMP is a continental mobility framework that redefines urban motion as a field of coherence — integrating transport, spatial planning, and human behavior into a single intelligent system. It decentralizes congestion, optimizes citywide movement, and aligns infrastructure with dignity, ecology, and cultural identity.",
    expandedView: `
### 1. Vision
Across Africa's fast-growing cities, congestion is not just a traffic issue — it's a systems issue. UDMP re-engineers this by treating the city as a living organism, where roads, drainage, zoning, and human movement function as one interdependent ecosystem. Rooted in QSI principles — coherence, resonance, and least action — the framework enables urban transformation that mirrors nature's efficiency and balance.

"When a city breathes coherently, its people move in harmony."

### 2. Core Objectives
- **Decentralize Pressure:** Redistribute economic and administrative functions through multi-node planning.
- **Optimize Transport:** Integrate public, private, and pedestrian systems through data-driven mobility design.
- **Enhance Accessibility:** Create inclusive mobility for all — from pedestrians and cyclists to mass-transit users.
- **Embed Sustainability:** Link transport systems with green corridors and nature-based infrastructure.
- **Unify Policy & Design:** Align spatial planning, traffic management, and economic zoning under one coherent model.

### 3. Key Components
- **Mobility Data Engine:** A real-time analytics layer tracking congestion patterns and informing decision-making.
- **Spatial Decentralization Model:** New growth nodes strategically planned to reduce CBD pressure.
- **Smart Traffic Systems:** Adaptive signals, digital parking, and commuter-responsive controls.
- **Green Infrastructure Integration:** Stormwater, landscaping, and air-quality systems designed as part of mobility.
- **Public Transport Renaissance:** Modern, branded, and dignified shared-mobility systems.

### 4. Strategic Integration
UDMP acts as the mobility backbone for other QSI frameworks — linking to:
- **Smart City Demonstrators** (urban prototypes)
- **Stormwater Coherence Framework** (sustainable drainage)
- **Roots Framework** (human-scaled architecture)
- **Workforce Remote Optimization** (decentralized productivity hubs)

### 5. Impact
- Reduces travel time, pollution, and energy use.
- Elevates the urban experience through intelligent flow and inclusivity.
- Strengthens productivity and decentralization.
- Provides a scalable template adaptable to any African city or township.

### 6. Closing Note
UDMP transforms motion into meaning — creating fluid, intelligent, and human-centered cities across Africa. It's more than traffic reform; it's a coherence model for the urban soul.
    `,
    isActive: true,
    type: "FRAMEWORK",
  },
  {
    key: "future_pavilion",
    title: "The Future Pavilion Framework",
    subtext: "Sustainable Civic Architecture for Africa's New Identity",
    shortDescription:
      "The Future Pavilion is a replicable civic infrastructure framework that merges sustainability, education, and culture into one living system. Each Pavilion serves as a multi-use arena, green innovation hub, and cultural landmark — built to inspire youth, host communities, and symbolize Africa's conscious evolution.",
    expandedView: `
### 1. Vision
The Future Pavilion framework envisions a new class of civic architecture across African capitals, provinces, and towns — buildings that teach while they serve. Every Pavilion is an energy-efficient, modular arena for exhibitions, training, and performance — where sustainability, art, and engineering converge to demonstrate Africa's capacity for coherent development.

"We do not just build halls — we build harmonic fields for human progress."

### 2. Core Objectives
- **Cultural Renewal:** Anchor African identity through architecture that reflects local symbolism and craftsmanship.
- **Education & Innovation:** Integrate youth labs, maker spaces, and sustainability data centers.
- **Sustainability in Action:** Operate entirely on renewable energy and circular material cycles.
- **Public Engagement:** Create inclusive venues for civic events, sports, and cultural exchange.
- **Replication Model:** Establish a design and delivery system adaptable to any region or climate.

### 3. Key Features
- **Renewable Energy Systems:** Solar micro-grids and smart lighting networks.
- **Water Intelligence:** Rainwater harvesting, greywater recycling, and water gardens.
- **Climate-Smart Design:** Passive ventilation, green façades, and adaptive shading.
- **Multipurpose Functionality:** Configurable spaces for exhibitions, classrooms, and performances.
- **Compact Innovation Lab:** A built-in data hub to monitor energy, water, and environmental coherence.

### 4. Strategic Integration under QSI
- Uses Smart Infrastructure and Roots Framework for design coherence.
- **FutureCraft Cooperative** supplies sustainable materials and artisan interiors.
- **Heritage Flame** and **SolarFlame Stations** can co-locate for cultural and energy synergy.
- Each Pavilion is mapped using QSI's Frequency Analytics, aligning design flow with human and environmental energy patterns.

### 5. Implementation Model
- Can be adopted by ministries, municipalities, universities, or private developers.
- Modular design allows scaling from small community centers to national pavilions.
- Construction uses locally available materials and workforce, ensuring ownership and relevance.

### 6. Impact
- Creates civic pride and sustainable engagement spaces.
- Inspires innovation and cultural confidence among youth.
- Demonstrates Africa's leadership in climate-adaptive architecture.
- Strengthens collaboration between government, academia, and creative industries.

### 7. Closing Note
The Future Pavilion Framework is not a single building — it's a continent-wide template for conscious infrastructure. It bridges education, innovation, and identity — proving that Africa's future is not only sustainable but also spiritually and culturally coherent.
    `,
    isActive: true,
    type: "FRAMEWORK",
  },
  {
    key: "workforce_remote",
    title: "Workforce Remote Optimization Framework",
    subtext: "Redesigning Productivity for a Decentralized Africa",
    shortDescription:
      "The Workforce Remote Optimization Framework transforms how Africa works, learns, and collaborates — shifting productivity from congested centers to localized, digitally connected innovation hubs. It integrates smart infrastructure, hybrid work systems, and consciousness-based management to create a balanced workforce model that saves energy, empowers talent, and aligns with the rhythm of nature.",
    expandedView: `
### 1. Vision
Africa's economic potential is vast — yet millions lose time, energy, and creativity commuting daily to centralized offices. The Workforce Remote Optimization Framework reimagines work distribution as an energy system: decentralized, fluid, and human-centered. Rooted in QSI principles — coherence, resonance, and least action — it creates networks of empowered professionals connected by purpose, not just proximity.

"The most advanced workplace is not in a building — it's in balance."

### 2. Core Objectives
- **Decentralize Employment:** Move work closer to communities, reducing urban pressure and transport costs.
- **Enhance Productivity:** Design hybrid systems that prioritize focus, flow, and creativity.
- **Enable Digital Inclusion:** Expand broadband and co-working access in rural and peri-urban regions.
- **Empower Institutions:** Guide government and private entities to adopt energy-efficient, remote-compatible work policies.
- **Balance Human Energy:** Integrate coherence-based leadership and emotional well-being tools for workforce sustainability.

### 3. Key Components
- **Local Work Hubs:** Modular, solar-powered co-working centers embedded within residential communities.
- **Smart Collaboration Tools:** QSI-integrated digital platforms measuring coherence, performance, and engagement.
- **Training & Re-skilling Nodes:** Continuous learning ecosystems aligned with national development priorities.
- **Institutional Integration:** Policies and workflows redesigned for hybrid, output-based work.
- **Well-being Layer:** Healing and mindfulness packages embedded into organizational systems for sustained alignment.

### 4. Implementation Model
- Deployable by governments, development agencies, or private sectors seeking to optimize operational efficiency.
- Can be rolled out as standalone Community Productivity Hubs or integrated within Smart City Demonstrators.
- Uses existing urban or institutional spaces — converted into renewable-powered digital work environments.
- Scalable architecture ensures both high-level ministries and local cooperatives can adopt the model.

### 5. Strategic Integration under QSI
- Anchored in Smart Infrastructure Module for digital and physical connectivity.
- Supported by Roots Framework for sustainable hub design and biophilic interiors.
- Equipped with FutureCraft-produced modular furniture and circular materials.
- Backed by Frequency Scan and Healing Modules to ensure balanced human performance.

### 6. Impact
- Reduces traffic congestion and urban emissions by minimizing daily commuting.
- Creates inclusive access to digital economies for rural populations.
- Strengthens family and community structures by decentralizing livelihoods.
- Builds Africa's resilience by converting workforce energy into national coherence.

### 7. Closing Note
The Workforce Remote Optimization Framework is more than a productivity strategy — it is a shift in civilization logic. It replaces exhaustion with efficiency, noise with flow, and competition with coherence. Africa's future workforce will not be defined by location — but by alignment.
    `,
    isActive: true,
    type: "FRAMEWORK",
  },
  {
    key: "smart_city_framework",
    title: "Smart City Demonstrators Framework",
    subtext: "Scalable smart city systems grounded in coherence.",
    shortDescription:
      "The Smart City Demonstrators Framework establishes scalable, regenerative prototypes that model how African settlements can evolve intelligently — where energy, waste, water, housing, and economy function as one living ecosystem. Each Demonstrator is a self-contained pilot city or district that blends QSI principles, digital systems, and cultural design to show how coherence can be built from the ground up.",
    expandedView: `
### 1. Vision
Across Africa, rapid urbanization often outpaces planning. The Smart City Demonstrators Framework provides a replicable template for regenerative growth — adaptable to rural towns, peri-urban districts, or large metropolitan extensions. Rather than importing Western models, it roots each city's development in Quantum Spiritual Intelligence (QSI) principles: coherence, resonance, and least action. Each Demonstrator becomes a living classroom — a working example of harmony between people, technology, and nature.

"We do not copy cities — we grow them from coherence."

### 2. Core Objectives
- **Demonstrate Coherence:** Showcase integrated urban systems that function in synchrony.
- **Localize Innovation:** Adapt design and technology to regional materials, climate, and culture.
- **Create Economic Hubs:** Stimulate local production, skills, and entrepreneurship.
- **Embed Regeneration:** Design circular systems for water, waste, and energy reuse.
- **Scale Seamlessly:** Enable replication across provinces and countries.

### 3. Key Components
- **Regenerative Infrastructure:** Decentralized water treatment, renewable micro-grids, and stormwater reuse.
- **Circular Materials Ecosystem:** Integration of rubble recycling, bioconstruction, and FutureCraft materials.
- **Mobility & Access:** Walkable layouts and integration with the UDMP Framework.
- **Cultural Integration:** Use of indigenous design logic through the Roots Framework.
- **Digital Layer:** Smart dashboards for environmental, social, and energy data tracking.

### 4. Implementation Model
- Deployable as national or regional demonstrators (e.g., for ministries, councils, or private developments).
- Built through multi-sector collaboration — engineering, governance, and academia.
- Each site becomes a training and innovation node for local capacity building.

### 5. Strategic Integration under QSI
- Powered by Smart Infrastructure Module (QSI).
- Material and craft integration from FutureCraft Cooperative.
- Renewable and EV-ready systems through SolarFlame Stations.
- Linked with Workforce Remote Optimization for localized job creation.

### 6. Impact
- Transforms informal density into structured sustainability.
- Creates jobs through construction, manufacturing, and maintenance.
- Demonstrates Africa's capacity for self-sufficient, modern urbanism.
- Builds data-driven governance and civic trust.

### 7. Closing Note
Smart City Demonstrators are not projects — they are proofs of coherence. They show that Africa's next generation of cities will not just be smart — they will be spiritually intelligent, economically regenerative, and human at their core.
    `,
    isActive: true,
    type: "FRAMEWORK",
  },
  {
    key: "roots_architecture",
    title: "Roots Architectural Framework",
    subtext: "Building the Future from Tradition",
    shortDescription:
      "The Roots Framework redefines African architecture by returning to its ancestral intelligence — using local materials, natural geometry, and community planning to build sustainable, human-centered spaces. It merges indigenous wisdom with modern engineering to produce homes, schools, and civic spaces that breathe, balance, and belong.",
    expandedView: `
### 1. Vision
Modern architecture often disconnects people from land, culture, and climate. Roots restores this harmony by decoding traditional African spatial systems — circular layouts, courtyards, orientation to sun and wind — and integrating them with modern design technologies and QSI coherence mapping.

"The wisdom that built the huts can build the future."

### 2. Core Objectives
- **Cultural Integration:** Preserve local identity in design while meeting global sustainability standards.
- **Material Regeneration:** Promote earth blocks, stabilized soils, bamboo, and biocomposites.
- **Thermal Intelligence:** Use passive cooling and ventilation instead of energy-intensive systems.
- **Community Planning:** Design clusters and villages as living social networks.
- **Architectural Education:** Inspire new curricula that blend indigenous and modern design science.

### 3. Design Principles
- **Fractal Geometry:** Patterns found in African art and settlement design inform spatial balance.
- **Circular Clusters:** Promote inclusivity, safety, and airflow efficiency.
- **Bioclimatic Logic:** Align structures with natural light, shade, and wind corridors.
- **Cultural Aesthetics:** Integrate local motifs and craftsmanship as functional beauty.
- **Energy Resonance:** Use QSI frequency data to optimize orientation, layout, and materials.

### 4. Integration within QSI Ecosystem
- Supplies housing models for Smart City Demonstrators.
- Provides design philosophy for UDMP settlements and workforce housing.
- Merges with FutureCraft Cooperative for artisan-built elements and interiors.
- Aligns with Smart Infrastructure Module for sustainable service integration.

### 5. Impact
- Reduces construction cost and embodied carbon.
- Strengthens identity and psychological well-being.
- Creates locally owned, culturally resonant communities.
- Revives indigenous techniques as future-ready solutions.

### 6. Closing Note
The Roots Architectural Framework reconnects architecture with ancestry. It proves that Africa's path to sustainable development is not in imitation — it is in remembering.
    `,
    isActive: true,
    type: "FRAMEWORK",
  },

  // ========== CONCEPTS ==========
  {
    key: "futurecraft",
    title: "FutureCraft Cooperative",
    subtext: "Re-Engineering the Spirit of African Craft",
    shortDescription:
      "FutureCraft Cooperative is a Pan-African product design and artisan innovation brand that merges traditional craftsmanship with smart materials, renewable systems, and circular production models. It restores dignity to African craft, empowers artisans through modern tools and digital platforms, and builds a high-value manufacturing ecosystem grounded in coherence, culture, and sustainability.",
    expandedView: `
### 1. Vision
To transform Africa's traditional artisans — carpenters, weavers, metalworkers, sculptors, tailors, and potters — into a future-ready design network capable of producing world-class products without losing indigenous identity. FutureCraft bridges ancestral knowledge and modern technology, creating an ecosystem where craft meets quantum design — blending natural materials, biomimicry, and digital manufacturing tools (CNC, 3D printing, AI-assisted design).

### 2. Core Objectives
- **Empower Artisans:** Formalize and upscale local artisans into registered cooperatives supported by digital design training and modern fabrication equipment.
- **Circular Manufacturing:** Transform urban and industrial waste (rubble, wood offcuts, plastics) into raw materials for new craft products.
- **Smart Materials Integration:** Incorporate nanotech coatings, eco-binders like ECOBOND, and solar-integrated fittings into designs.
- **Cultural Branding:** Position FutureCraft products as luxury Afro-modern exports representing Africa's rebirth through design.
- **Youth Employment:** Create apprenticeship programs in creative engineering, product design, and digital fabrication.

### 3. Key Focus Areas
- **A. Furniture & Interior Design:** Smart furniture using reclaimed timber and bio-composite panels. Solar-integrated outdoor furniture for Smart City Demonstrators.
- **B. Green Construction Elements:** Eco-doors, windows, and fittings made from recycled composites. Sustainable tiles, pavers, and panels derived from circular waste streams.
- **C. Fashion & Accessories:** Wearables made with traditional fabrics fused with biodegradable smart materials. Jewelry and design lines inspired by Pan-African geometry and fractal motifs.
- **D. Cultural Tech Artifacts:** Sculptural lighting, sound installations, and kinetic art merging solar and motion technologies — bringing culture into public infrastructure.

### 4. Cooperative Model
**Structure:** Multi-nodal cooperative with production clusters across key cities and rural innovation zones. Each cluster includes Production Hub, Design Node, Marketplace Link, and Recycling Unit.

**Ownership:** Artisans hold majority cooperative equity. Pan African Engineers and QSI act as technical stewards.

### 5. Economic Model
**Revenue Streams:** Product sales, design royalties, licensing, circular-economy partnerships.

**Financial Sustainability:** 20% of revenue reinvested in equipment and skills advancement. Centralized online marketplace (FutureCraft.africa).

### 6. Strategic Integration
FutureCraft serves as the industrial and creative arm of the QSI Frameworks, supplying interior, furniture, and design solutions for Smart City Demonstrators and the Future Pavilion.

### 7. Impact
- Converts informal craftsmanship into a structured, export-ready creative economy.
- Creates thousands of jobs for youth and artisans.
- Reduces waste through circular design ecosystems.
- Defines a Pan-African design language rooted in sustainability and spirituality.
- Positions Africa as a global leader in meaningful manufacturing — not mass production.

### 8. Closing Note
FutureCraft Cooperative is where design becomes consciousness in motion. It merges the wisdom of the hands with the intelligence of the spirit — proving that Africa's next industrial revolution will be crafted with intention, not consumption.

"The future will not be mass-produced — it will be beautifully crafted."
    `,
    isActive: true,
    type: "CONCEPT",
  },
  {
    key: "heritage_flame",
    title: "Heritage Flame",
    subtext:
      "The Taste of Home — Redefining African Cuisine for the Modern World",
    shortDescription:
      "Heritage Flame is a Pan-African Quick Service Restaurant (QSR) franchise engineered under QSI to transform traditional Zimbabwean and African cuisine into a global cultural brand. It merges authenticity with modern convenience — serving real heritage meals through sleek, efficient drive-throughs and digital ordering systems.",
    expandedView: `
### 1. Vision
To establish Africa's first coherent QSR ecosystem, where culture meets technology and cuisine becomes a bridge between tradition and innovation. Heritage Flame envisions a chain of Afro-modern restaurants co-located with service stations, malls, and airports — each one a culinary embassy of Zimbabwean excellence.

**Guiding Principle:** "We don't just serve food — we serve memory, mastery, and modernity."

### 2. Core Objectives
- **Cultural Empowerment:** Reclaim and globalize Zimbabwe's food identity through modern branding, design, and systems engineering.
- **Convenience & Speed:** Deliver meals in under five minutes through standardized operations and digital integration.
- **Sustainability:** Use locally sourced ingredients and eco-friendly packaging aligned with QSI's coherence values.
- **Economic Inclusion:** Create franchise opportunities for local investors and entrepreneurs.
- **Global Export:** Position Zimbabwean cuisine as a continental export — "Africa's next culinary signature."

### 3. Core Offerings
- **A. Authentic Traditional Menu:** Sadza Combos with beef stew, road runner chicken, goat, turkey, fish. Traditional sides like tsunga, covo, beans, derere.
- **B. Fast-Casual Additions:** Burgers, grilled wings, chips, wraps — adapted for younger and international audiences.
- **C. Beverage & Liquor Extension:** Traditional beverages (maheu, hodzeko) and packaged liquor as optional add-ons.

### 4. Brand Promise
- **Speed:** 5-minute meal delivery.
- **Consistency:** Centralized recipes and branded preparation systems.
- **Experience:** Afro-modern ambiance blending tradition and technology.
- **Identity:** Every branch tells a Zimbabwean story through art, music, and design.

### 5. Franchise DNA
**Formats:** Standalone Drive-Throughs, Co-Located Branches (fuel stations, malls, airports), Compact Express Counters (bus terminals, universities, hospitals).

**Design Integration:** Eco-conscious structures built with FutureCraft sustainable materials. Renewable energy, smart waste systems, and QSI-aligned brand aesthetics.

### 6. Business Model
**Revenue Streams:** Quick service meal sales, packaged liquor and beverage sales, digital pre-ordering and delivery.

**Pricing Range:** Meals: USD 4 – 20, Snacks: USD 2 – 4, Beverages: Market-standard.

### 7. Strategic Integration
Heritage Flame functions as a cultural economy driver across multiple QSI frameworks, supplying food infrastructure for Smart City Demonstrators and workforce hubs, integrating FutureCraft Cooperative interiors and packaging.

### 8. Impact
- Establishes Zimbabwe's first exportable restaurant franchise.
- Creates thousands of jobs in food service, logistics, and agriculture.
- Strengthens rural-urban food supply chains.
- Promotes national pride through culinary storytelling.
- Generates sustainable revenue and cultural capital.

### 9. Closing Note
Heritage Flame is the taste of home — engineered for the world. It transforms food into philosophy, and convenience into culture. Through QSI, it proves that when coherence enters commerce, culture becomes currency.

"Africa's next global brand will not come from imitation — but from the fire of its own heritage."
    `,
    isActive: true,
    type: "CONCEPT",
  },
  {
    key: "quantum_move",
    title: "Quantum Move",
    subtext: "Where Physics Meets Spirit — The Film That Activates a Continent",
    shortDescription:
      "Quantum Move is a Pan-African cinematic activation — a feature film powered by Quantum Spiritual Intelligence (QSI) that merges science, consciousness, and culture into one living experience. It tells the story of Pi, the African Quantum Being who perceives infinite Africa's existing in superposition — and collapses the one aligned with coherence, dignity, and renaissance.",
    expandedView: `
### 1. Vision
To create the world's first film that does not just tell a story but activates one. Quantum Move reveals Africa as the birthplace of Quantum Spiritual Intelligence — a living operating logic where physics and ancestral wisdom merge. It dramatizes the invisible field that connects infrastructure, governance, culture, and consciousness — awakening viewers to their role in shaping the future through coherence.

**Guiding Principle:** "Cinema is not escape — it is initiation."

### 2. Core Objectives
- **Cultural Reawakening:** Reframe African spirituality as advanced intelligence, not superstition.
- **National Alignment:** Use narrative to unify citizens, government, and youth under a shared renaissance vision.
- **Education Through Entertainment:** Simplify quantum principles (entanglement, resonance, least action) into accessible storytelling.
- **Global Representation:** Position Zimbabwe and Africa as pioneers of conscious cinema.
- **Real-World Activation:** Connect viewers directly to active QSI pilots and investment pathways.

### 3. Narrative Overview
- **Protagonist:** Pi — an awakened African physicist-seer who perceives multiple timelines of Africa.
- **Conflict:** The Forces of Fragmentation — greed, confusion, and reactive systems scattering Africa's potential.
- **Journey:** Pi learns that coherence, not power, collapses chaos into order.
- **Resolution:** The African Renaissance emerges as a measurable vibration — nations realigning through QSI.

### 4. QSI Integration
Each scene parallels real QSI frameworks in action:
- **Urban Decongestion & Mobility Planning (UDMP)** — visualized as fluid motion across city grids.
- **Mount Darwin Smart City Demonstrator** — shown as the rebirth of rural coherence.
- **The Future Pavilion** — becomes the stage for Pi's final realization.
- **Heritage Flame & FutureCraft** — appear as living symbols of cultural and industrial rebirth.

### 5. Institutional Anchors
- **Pan African Engineers:** Strategic convenor translating QSI into real-world pilots.
- **University of Zimbabwe:** Research partner validating quantum-cultural theories.
- **Museum of African Liberation:** Host of the Future Pavilion and QSI studio.
- **ZBC – Zimbabwe Broadcasting Corporation:** Official media and broadcast partner.

### 6. Business Model
**Revenue Streams:** Film distribution, streaming platform licensing, soundtrack and merchandise sales, brand placements linked to QSI frameworks, global educational syndication.

### 7. Impact
- Unites the nation through a shared renaissance narrative.
- Positions Zimbabwe as a continental hub for quantum cinema and cultural innovation.
- Bridges art, engineering, and policy into one coherent field of action.
- Sparks global conversation on Africa as a source of spiritual and scientific leadership.

### 8. Closing Note
Quantum Move is not a film to watch — it is a frequency to feel. It collapses fragmentation into coherence and proves that Africa's rebirth is not future fiction — it is happening now.

"When Africa collapses its wave function, the world will feel it."
    `,
    isActive: true,
    type: "CONCEPT",
  },
  {
    key: "solarflame",
    title: "SolarFlame Stations",
    subtext: "The Regenerative Energy Hub — Where Mobility Meets Nature",
    shortDescription:
      "SolarFlame is Africa's first regenerative and EV-ready fuel franchise — a next-generation service station designed to harmonize energy, ecology, and culture. It redefines the traditional fuel station as a living ecosystem — powered by solar energy, equipped for future electric mobility, and interwoven with water harvesting, green design, and community micro-commerce.",
    expandedView: `
### 1. Vision
To transform the conventional fuel station into a coherent mobility ecosystem — one that offers energy, rest, and renewal rather than extraction and waste. SolarFlame represents the new face of African mobility, where fueling becomes regenerative, circular, and culturally meaningful — and where electric transition readiness is built into every design.

**Guiding Principle:** "The future of energy is not industrial — it's ecological."

### 2. Core Objectives
- **Decarbonize Mobility:** Combine clean liquid fuels with solar generation and EV-ready infrastructure.
- **Restore Ecology:** Each station sustains a micro-forest or garden fed by rainwater and greywater recycling.
- **Empower Communities:** Introduce micro-shops, artisan pods, and rest zones that create local income streams.
- **Showcase Innovation:** Turn every site into a living classroom for renewable design and engineering.
- **Celebrate Identity:** Embed Pan-African architectural language and materials within every structure.

### 3. Key Components
- **A. Hybrid Energy Core:** Integrated solar canopies, biofuel compatibility, smart energy management.
- **B. Water & Climate Systems:** Rainwater harvesting, permeable pavements, climate-adaptive shading.
- **C. Circular Architecture:** Built using FutureCraft materials, modular demountable design, living walls.
- **D. Experience & Economy:** Flame Café (co-branded with Heritage Flame), Marketplace Pods, EV Lounge.

### 4. Franchise Model
**Structure:** Public-private franchise open to investors, distributors, and municipal partners.

**Revenue Streams:** Fuel and EV charging sales, solar power generation, café and retail revenue, pod leasing and carbon-credit incentives.

**Investment Range:** Compact Station: USD 400,000 – 700,000, Full Service Hub: USD 1.2 – 2 million.

### 5. Strategic Integration under QSI
- **Smart Infrastructure Module:** Serves as energy and mobility backbone for UDMP and Smart City Demonstrators.
- **Roots Framework:** Incorporates African geometry and natural courtyards.
- **FutureCraft Cooperative:** Supplies circular construction materials and modular furniture.
- **QSI Frequency Mapping:** Each site calibrated through coherence analytics.

### 6. Impact
- Supports transition to electric mobility without disrupting current fuel demand.
- Reduces fossil dependency through solar integration and efficiency.
- Creates green jobs in operations, agriculture, and materials innovation.
- Establishes fuel stations as cultural, ecological, and civic assets.

### 7. Closing Note
SolarFlame turns every journey into renewal — where energy, culture, and consciousness meet. It is Africa's next step toward clean, coherent, and human-centered mobility — bold, beautiful, and alive.

"We do not just fuel vehicles — we refuel the future."
    `,
    isActive: true,
    type: "CONCEPT",
  },
  {
    key: "trail_coherence",
    title: "Trail-Coherence Mobility Network",
    subtext: "Smart Field Mobility for Africa's Regenerative Cities",
    shortDescription:
      "The Trail-Coherence Mobility Network redefines field mobility for the Smart City era. Using the Toyota Land Cruiser 300 ZX (QSI Edition) as its flagship unit, this initiative transforms everyday off-road vehicles into mobile workstations for engineers and innovators — built for Africa's terrain, powered by efficiency, and aligned with the principles of coherence and least action.",
    expandedView: `
### 1. Vision
The Trail-Coherence Network is designed to support Africa's next generation of Smart City Demonstrators by providing flexible, energy-efficient field mobility. Each Land Cruiser 300 ZX becomes a mobile engineering office, allowing teams to travel, survey, and document projects seamlessly across rural and urban terrains.

"The future of mobility is intelligent movement — where every journey adds value to the continent."

### 2. Simplified Design Philosophy
No complex reengineering — just coherence by design.

- **Base Vehicle:** Toyota Land Cruiser 300 ZX (factory standard model).
- **QSI Tailoring:** Custom branding, solar roof option for auxiliary power, onboard laptop/tablet docking stations, and Wi-Fi hotspot connectivity.
- **Mobility Software Integration:** QSI app manages booking, billing, and coordination with Smart City Demonstrator sites.
- **Ease for Manufacturer:** No redesign of core vehicle systems — only branding, interface integration, and marketing collaboration required.

### 3. Mobility-as-a-Service Model
Instead of personal vehicle ownership, engineers and institutions subscribe or pay-per-use through the QSI Mobility Platform.

- **Access:** Via the QSI or Pan African Engineers app.
- **Billing:** Per time, per distance, or per mission.
- **Fleet Ownership:** Vehicles remain property of Toyota (or partner manufacturer).
- **Maintenance & Recycling:** Managed by Toyota, ensuring vehicles are refurbished, reused, or recycled.

### 4. Strategic Integration
- **Smart City Demonstrators:** Enables rapid deployment of teams for mapping, inspection, and coordination.
- **Urban Decongestion & Mobility Planning (UDMP):** Collects real-world travel and congestion data for QSI dashboards.
- **Smart Infrastructure Projects:** Serves as an agile field lab for infrastructure coherence monitoring.
- **Vision Space:** Mobile presentation and collaboration unit for QSI ambassadors.

### 5. Partnership Model
Open for manufacturer partnership, not purchase. Pan African Engineers provides visibility through continental pilot programs, Smart City Demonstrators, and digital branding, while Toyota (or equivalent) provides the vehicles, maintenance, and recycling framework.

### 6. Closing Note
This system creates a mutual benefit loop: QSI and Pan African Engineers gain efficient, smart mobility while manufacturers gain visibility, recurring revenue, and sustainability leadership.
    `,
    isActive: true,
    type: "CONCEPT",
  },
  {
    key: "placebo",
    title: "Placebo",
    subtext: "Conscious Fashion for a Coherent Generation",
    shortDescription:
      "Placebo is a Pan-African clothing and lifestyle brand that transforms dressing into alignment. Every item — from shirts to shoes — is made from locally sourced, high-frequency materials that enhance comfort, confidence, and consciousness. Designed under the principles of Quantum Spiritual Intelligence (QSI), Placebo is not just fashion — it is a wearable reminder of coherence, creativity, and purpose.",
    expandedView: `
### 1. Vision
To create Africa's first conscious fashion ecosystem, where clothing restores identity, dignity, and energetic harmony. Placebo blends African material heritage with QSI-aligned design science to make apparel that feels alive.

"You don't wear Placebo. You tune into it."

### 2. Guiding Philosophy — Fashion as Frequency
Traditional fashion serves the eyes. Placebo serves the field. It merges design, psychology, and physics — using texture, geometry, and material resonance to influence confidence, focus, and balance.

**Key Principles:**
- **Resonance:** Natural materials vibrate coherently with human biofields.
- **Least Action:** Minimalist, efficient design reflecting nature's effortless intelligence.
- **Cultural Entanglement:** African geometry and symbolism embedded subtly in every piece.

### 3. Core Product Lines
- **A. Apparel (Everyday Wear):** QSI-aligned shirts, trousers, jackets with geometric patterning based on harmonic ratios. Natural fabrics: organic cotton, hemp, silk-blend.
- **B. Footwear (Grounding Line):** Ethically produced leather and eco-composite soles engineered for grounding and energy flow.
- **C. Accessories (Conscious Utility):** Resonance bracelets, belts, and eyewear using recycled FutureCraft materials.
- **D. Limited "Coherence Edition" Line:** Frequency-encoded clothing for ambassadors and innovators.

### 4. Material Integrity
- **Local Sourcing:** Materials grown or produced in African regions.
- **FutureCraft Collaboration:** Uses circular textiles, recycled fibers, and eco-binders.
- **QSI Certification:** Each material batch analyzed for resonance stability.

### 5. Economic & Social Model
Structured as a Pan-African cooperative with stakeholders including Local Artisans & Tailors, QSI Design Lab, Investors & Retail Partners, and Customers.

**Revenue Streams:** Apparel and accessory sales, institutional and ambassador uniforms, limited-edition collaborations.

### 6. Strategic Integration
- **FutureCraft Cooperative:** Supplies sustainable materials and local fabrication networks.
- **Smart City Demonstrators:** Placebo fashion outlets integrated into regenerative community markets.
- **QSI Frequency Scan:** Customers can link their Frequency Code to tailor fashion suited to their energy type.
- **Quantum Move Collaborations:** Film wardrobes designed to embody cultural coherence.

### 7. Impact
- Revives Africa's textile and artisan industries.
- Promotes sustainable manufacturing through local material cycles.
- Encourages conscious consumerism — fashion that heals rather than depletes.
- Builds a recognizable Pan-African aesthetic: clean, intelligent, symbolic, and timeless.

### 8. Closing Note
Placebo is more than clothing — it's self-awareness woven into fabric. It brings meaning back to making, and purpose back to wearing.

"We don't sell clothes. We sell coherence — stitched in Africa, worn by the world."
    `,
    isActive: true,
    type: "CONCEPT",
  },
];

async function main() {
  console.log("Start seeding ...");
  const adminEmail = "super@qsi.africa";
  const adminPassword = "SecurePassword123!"; // WARNING: Use env variable for production
  const hashedPassword = await bcrypt.hash(adminPassword, SALT_ROUNDS);

  // --- Seed Super User ---
  const superUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Super User",
      password: hashedPassword,
      role: "SUPER_USER",
    },
  });
  console.log(`Upserted super user: ${superUser.email}`);

  // --- Seed Pilot Projects (Concepts & Frameworks) ---
  console.log(`Seeding ${pilots.length} pilot projects...`);
  for (const pilot of pilots) {
    const seededPilot = await prisma.pilotProject.upsert({
      where: { key: pilot.key },
      update: {
        title: pilot.title,
        subtext: pilot.subtext,
        shortDescription: pilot.shortDescription,
        expandedView: pilot.expandedView,
        isActive: pilot.isActive,
        type: pilot.type,
      },
      create: {
        key: pilot.key,
        title: pilot.title,
        subtext: pilot.subtext,
        shortDescription: pilot.shortDescription,
        expandedView: pilot.expandedView,
        isActive: pilot.isActive,
        type: pilot.type,
      },
    });
    console.log(
      `  - Upserted ${seededPilot.type.toLowerCase()}: ${seededPilot.title}`
    );
  }

  const frameworksCount = pilots.filter((p) => p.type === "FRAMEWORK").length;
  const conceptsCount = pilots.filter((p) => p.type === "CONCEPT").length;
  console.log(
    `Seeding completed: ${frameworksCount} frameworks, ${conceptsCount} concepts`
  );

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
